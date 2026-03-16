// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title TxInterceptor
/// @notice Pre-transaction safety layer — on-chain component of CrossShield's risk system
/// @dev Bridges to PVM risk_interceptor contract for AI-powered analysis
///      Inspired by TxShield's transaction interception pattern
contract TxInterceptor is Ownable {
    enum RiskLevel { LOW, MEDIUM, HIGH, CRITICAL }

    struct RiskReport {
        uint8 score;          // 0–100, higher = riskier
        RiskLevel level;
        string summary;
        uint256 timestamp;
    }

    struct ContractRecord {
        bool verified;
        string name;
        uint256 registeredAt;
    }

    // ENS-style node → address resolution (simplified)
    mapping(bytes32 => address) private ensRegistry;

    // Verified contract registry
    mapping(address => ContractRecord) public contractRegistry;

    // Risk history per user
    mapping(address => RiskReport[]) private riskHistory;

    // PVM bridge address (would be the precompile in production)
    address public pvmBridge;

    event TransactionAnalyzed(
        address indexed user,
        address indexed target,
        uint8 riskScore,
        string riskLevel
    );
    event ContractVerified(address indexed contractAddr, string name);

    constructor() Ownable(msg.sender) {}

    /// @notice Set the PVM bridge address for calling the ink! risk_interceptor
    function setPVMBridge(address bridge) external onlyOwner {
        pvmBridge = bridge;
    }

    /// @notice Analyze a transaction before execution
    /// @param to Target contract address
    /// @param data Calldata to analyze
    /// @param value ETH value being sent
    /// @return riskScore 0–100 risk score
    /// @return riskLevel Human-readable risk level string
    function analyzeTransaction(
        address to,
        bytes calldata data,
        uint256 value
    ) external returns (uint8 riskScore, string memory riskLevel) {
        // On-chain heuristics
        riskScore = _computeOnChainRisk(to, data, value);
        riskLevel = _riskLevelString(riskScore);

        RiskReport memory report = RiskReport({
            score: riskScore,
            level: _scoreToEnum(riskScore),
            summary: riskLevel,
            timestamp: block.timestamp
        });
        riskHistory[msg.sender].push(report);

        emit TransactionAnalyzed(msg.sender, to, riskScore, riskLevel);
    }

    /// @notice Compute risk score based on on-chain heuristics
    function _computeOnChainRisk(
        address to,
        bytes calldata data,
        uint256 value
    ) internal view returns (uint8) {
        uint8 score = 10; // baseline

        // Unverified contract adds risk
        if (!contractRegistry[to].verified) score += 20;

        // High value transfer adds risk
        if (value > 1 ether) score += 15;
        if (value > 10 ether) score += 15;

        // Empty calldata with value = likely ETH transfer
        if (data.length == 0 && value > 0) score += 5;

        // Long calldata = complex operation
        if (data.length > 1000) score += 10;

        // Cap at 100
        if (score > 100) score = 100;
        return score;
    }

    /// @notice Register a verified contract
    /// @param contractAddr The contract address
    /// @param name Human-readable name
    function registerVerifiedContract(address contractAddr, string calldata name)
        external onlyOwner
    {
        contractRegistry[contractAddr] = ContractRecord({
            verified: true,
            name: name,
            registeredAt: block.timestamp
        });
        emit ContractVerified(contractAddr, name);
    }

    /// @notice Check if a contract is verified
    /// @param target Contract address to check
    function isContractVerified(address target) external view returns (bool) {
        return contractRegistry[target].verified;
    }

    /// @notice Resolve an ENS-style node to an address
    /// @param node keccak256 of the domain name
    function resolveENS(bytes32 node) external view returns (address) {
        return ensRegistry[node];
    }

    /// @notice Register an ENS mapping (owner only)
    function setENS(bytes32 node, address addr) external onlyOwner {
        ensRegistry[node] = addr;
    }

    /// @notice Get risk history for a user
    function getRiskHistory(address user) external view returns (RiskReport[] memory) {
        return riskHistory[user];
    }

    function _riskLevelString(uint8 score) internal pure returns (string memory) {
        if (score < 25) return "LOW";
        if (score < 50) return "MEDIUM";
        if (score < 75) return "HIGH";
        return "CRITICAL";
    }

    function _scoreToEnum(uint8 score) internal pure returns (RiskLevel) {
        if (score < 25) return RiskLevel.LOW;
        if (score < 50) return RiskLevel.MEDIUM;
        if (score < 75) return RiskLevel.HIGH;
        return RiskLevel.CRITICAL;
    }
}
