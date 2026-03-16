// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockUSDC
/// @notice Mock USDC token for testnet deployment
/// @dev 6 decimals to match real USDC
contract MockUSDC is ERC20, Ownable {
    uint8 private constant DECIMALS = 6;

    constructor() ERC20("USD Coin", "USDC") Ownable(msg.sender) {
        // Mint 10M USDC to deployer for testing
        _mint(msg.sender, 10_000_000 * 10 ** DECIMALS);
    }

    /// @notice Mint USDC to any address (testnet only)
    /// @param to Recipient address
    /// @param amount Amount in USDC (with 6 decimals)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Public faucet — anyone can claim 10,000 USDC
    function faucet() external {
        _mint(msg.sender, 10_000 * 10 ** DECIMALS);
    }

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
}
