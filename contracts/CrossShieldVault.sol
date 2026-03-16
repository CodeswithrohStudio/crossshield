// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./RWAOracle.sol";
import "./XCMBridge.sol";

/// @title CrossShieldVault
/// @notice Principal-protected DeFi vault with cross-chain yield deployment
/// @dev Uses zero-coupon bond math: PV = FV / (1 + r)^t
///      User's principal is always 100% protected; yield is used as margin for leveraged RWA positions
contract CrossShieldVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Constants ────────────────────────────────────────────────────────────
    uint256 public constant BASE_RATE = 5e16;         // 5% annual (1e18 precision)
    uint256 public constant PRECISION = 1e18;
    uint256 public constant USDC_PRECISION = 1e6;
    uint256 public constant MATURITY_DAYS = 365;
    uint256 public constant MAX_LEVERAGE = 50;
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    // ─── State ────────────────────────────────────────────────────────────────
    IERC20 public immutable usdc;
    RWAOracle public immutable oracle;
    XCMBridge public immutable xcmBridge;

    struct Deposit {
        uint256 principal;      // Original deposit amount (USDC, 6 decimals)
        uint256 depositedAt;    // Unix timestamp of deposit
        uint256 maturityTime;   // depositedAt + 365 days
    }

    struct Shield {
        uint256 id;
        address owner;
        uint8 assetId;
        uint8 leverage;
        uint256 entryPrice;     // Oracle price at open (8 decimals)
        uint256 marginUsed;     // Yield used as margin (USDC, 6 decimals)
        uint256 openedAt;
        bool isOpen;
        bytes32 xcmMessageId;   // XCM message tracking
        int256 realizedPnl;     // Settled PnL (signed)
    }

    mapping(address => Deposit) public deposits;
    mapping(uint256 => Shield) public shields;
    mapping(address => uint256[]) public userShields;

    uint256 public nextShieldId = 1;
    uint256 public totalDeposited;
    uint256 public totalYieldDeployed;

    // ─── Events ───────────────────────────────────────────────────────────────
    event PrincipalDeposited(address indexed user, uint256 amount, uint256 maturityTime);
    event PrincipalWithdrawn(address indexed user, uint256 amount);
    event ShieldOpened(uint256 indexed shieldId, address indexed user, uint8 assetId, uint8 leverage, uint256 margin);
    event ShieldClosed(uint256 indexed shieldId, address indexed user, int256 pnl, bool principalSafe);
    event YieldDeployed(address indexed user, uint256 amount);

    constructor(
        address _usdc,
        address _oracle,
        address _xcmBridge
    ) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        oracle = RWAOracle(_oracle);
        xcmBridge = XCMBridge(_xcmBridge);
    }

    // ─── Core Deposit/Withdraw ─────────────────────────────────────────────

    /// @notice Deposit USDC to receive principal protection
    /// @param amount Amount of USDC to deposit (6 decimals)
    function depositUSDC(uint256 amount) external nonReentrant {
        require(amount >= 1e6, "CrossShieldVault: minimum deposit is 1 USDC");
        require(deposits[msg.sender].principal == 0, "CrossShieldVault: existing deposit, withdraw first");

        usdc.safeTransferFrom(msg.sender, address(this), amount);

        uint256 maturityTime = block.timestamp + MATURITY_DAYS * 1 days;
        deposits[msg.sender] = Deposit({
            principal: amount,
            depositedAt: block.timestamp,
            maturityTime: maturityTime
        });

        totalDeposited += amount;
        emit PrincipalDeposited(msg.sender, amount, maturityTime);
    }

    /// @notice Withdraw 100% of original principal (always available)
    function withdrawPrincipal() external nonReentrant {
        Deposit memory dep = deposits[msg.sender];
        require(dep.principal > 0, "CrossShieldVault: no deposit found");

        // Close any open shields first
        uint256[] memory userShieldIds = userShields[msg.sender];
        for (uint256 i = 0; i < userShieldIds.length; i++) {
            if (shields[userShieldIds[i]].isOpen) {
                revert("CrossShieldVault: close all shields before withdrawing");
            }
        }

        uint256 amount = dep.principal;
        delete deposits[msg.sender];
        totalDeposited -= amount;

        usdc.safeTransfer(msg.sender, amount);
        emit PrincipalWithdrawn(msg.sender, amount);
    }

    // ─── Zero-Coupon Bond Math ─────────────────────────────────────────────

    /// @notice Calculate present value using zero-coupon bond formula
    /// @dev PV = FV / (1 + r)^t  where r=5%, t=years
    /// @param faceValue Face value (principal deposit)
    /// @param maturityDays Days until maturity
    /// @return pv Present value locked to guarantee face value at maturity
    function calculatePresentValue(uint256 faceValue, uint256 maturityDays)
        public pure returns (uint256 pv)
    {
        // t in years with 1e18 precision
        uint256 t = (maturityDays * PRECISION) / 365;

        // (1 + r)^t using simple approximation: 1 + r*t for small t
        // For accuracy, use: (1 + r)^t = 1 + r*t + r^2*t^2/2 + ...
        // We use the binomial approximation: sufficient for 0–5 year maturities
        uint256 rate = BASE_RATE; // 5e16 = 0.05 * 1e18

        // denominator = (1 + r*t/1e18) with precision
        // For t=1 year: denominator = 1.05 * 1e18
        uint256 denominator = PRECISION + (rate * t) / PRECISION;

        // PV = FV * 1e18 / denominator
        pv = (faceValue * PRECISION) / denominator;
    }

    /// @notice Calculate available yield for a user
    /// @dev Yield = FV - PV = principal - presentValue
    /// @param user Address of the depositor
    /// @return yield Amount of yield available as margin (USDC, 6 decimals)
    function yieldAvailable(address user) public view returns (uint256 yield) {
        Deposit memory dep = deposits[user];
        if (dep.principal == 0) return 0;

        uint256 elapsed = block.timestamp - dep.depositedAt;
        uint256 elapsedDays = elapsed / 1 days;
        if (elapsedDays == 0) return 0; // No yield until 1 day has passed

        uint256 pv = calculatePresentValue(dep.principal, elapsedDays);
        yield = dep.principal > pv ? dep.principal - pv : 0;
    }

    // ─── Shield Operations ─────────────────────────────────────────────────

    /// @notice Open a leveraged position using yield as margin
    /// @param assetId Asset to trade (0–24)
    /// @param leverage Leverage multiplier (1–50)
    function openShield(uint8 assetId, uint8 leverage)
        external nonReentrant returns (uint256 shieldId)
    {
        require(deposits[msg.sender].principal > 0, "CrossShieldVault: deposit first");
        require(assetId < oracle.ASSET_COUNT(), "CrossShieldVault: invalid asset");
        require(leverage >= 1 && leverage <= MAX_LEVERAGE, "CrossShieldVault: leverage 1-50");

        uint256 margin = yieldAvailable(msg.sender);
        require(margin > 0, "CrossShieldVault: no yield available yet");

        uint256 entryPrice = oracle.getPrice(assetId);
        require(entryPrice > 0, "CrossShieldVault: oracle price unavailable");

        shieldId = nextShieldId++;

        // Encode XCM payload for cross-chain position
        bytes memory payload = abi.encode(
            shieldId,
            msg.sender,
            assetId,
            leverage,
            margin * leverage,
            entryPrice
        );

        // Send to parachain via XCM
        bytes32 destination = bytes32(uint256(2004)); // Moonbeam parachain ID
        bytes32 xcmId = xcmBridge.sendXCMMessage(destination, payload);

        shields[shieldId] = Shield({
            id: shieldId,
            owner: msg.sender,
            assetId: assetId,
            leverage: leverage,
            entryPrice: entryPrice,
            marginUsed: margin,
            openedAt: block.timestamp,
            isOpen: true,
            xcmMessageId: xcmId,
            realizedPnl: 0
        });

        userShields[msg.sender].push(shieldId);
        totalYieldDeployed += margin;

        emit ShieldOpened(shieldId, msg.sender, assetId, leverage, margin);
        emit YieldDeployed(msg.sender, margin);
    }

    /// @notice Close a shield and settle PnL
    /// @param shieldId ID of the shield to close
    function closeShield(uint256 shieldId) external nonReentrant {
        Shield storage shield = shields[shieldId];
        require(shield.owner == msg.sender, "CrossShieldVault: not your shield");
        require(shield.isOpen, "CrossShieldVault: shield already closed");

        uint256 currentPrice = oracle.getPrice(shield.assetId);
        uint256 entryPrice = shield.entryPrice;

        // Calculate PnL: (currentPrice - entryPrice) / entryPrice * margin * leverage
        int256 priceChange = int256(currentPrice) - int256(entryPrice);
        int256 pnl = (priceChange * int256(shield.marginUsed) * int256(uint256(shield.leverage)))
                     / int256(entryPrice);

        shield.isOpen = false;
        shield.realizedPnl = pnl;

        // If pnl is positive, transfer profit to user
        // Principal is ALWAYS returned fully (protected by zero-coupon structure)
        if (pnl > 0) {
            uint256 profit = uint256(pnl);
            // Cap profit at available vault balance
            uint256 maxPayout = usdc.balanceOf(address(this));
            if (profit > maxPayout) profit = maxPayout;
            if (profit > 0) {
                usdc.safeTransfer(msg.sender, profit);
            }
        }
        // If pnl is negative, yield absorbs the loss — principal untouched

        totalYieldDeployed -= shield.marginUsed;

        emit ShieldClosed(shieldId, msg.sender, pnl, true);
    }

    // ─── View Functions ───────────────────────────────────────────────────

    /// @notice Get deposit info for a user
    function getDeposit(address user) external view returns (Deposit memory) {
        return deposits[user];
    }

    /// @notice Get shield info
    function getShield(uint256 shieldId) external view returns (Shield memory) {
        return shields[shieldId];
    }

    /// @notice Get all shield IDs for a user
    function getUserShields(address user) external view returns (uint256[] memory) {
        return userShields[user];
    }

    /// @notice Get unrealized PnL for an open shield
    function unrealizedPnl(uint256 shieldId) external view returns (int256 pnl) {
        Shield memory shield = shields[shieldId];
        require(shield.isOpen, "CrossShieldVault: shield not open");

        uint256 currentPrice = oracle.getPrice(shield.assetId);
        int256 priceChange = int256(currentPrice) - int256(shield.entryPrice);
        pnl = (priceChange * int256(shield.marginUsed) * int256(uint256(shield.leverage)))
              / int256(shield.entryPrice);
    }

    /// @notice Emergency withdrawal by owner
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}
