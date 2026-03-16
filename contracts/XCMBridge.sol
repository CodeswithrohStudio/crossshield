// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title XCMBridge
/// @notice Simulates XCM cross-chain messaging to Polkadot parachains
/// @dev In production, uses Polkadot Hub XCM precompile at 0x0000000000000000000000000000000000000401
///      For the hackathon, the interface is correct but calls are mocked
contract XCMBridge is Ownable {
    // XCM precompile address on Polkadot Hub (production)
    address public constant XCM_PRECOMPILE = 0x0000000000000000000000000000000000000401;

    struct XCMMessage {
        bytes32 destination;
        bytes payload;
        uint256 sentAt;
        bool settled;
        bool success;
        uint256 pnl;
    }

    mapping(bytes32 => XCMMessage) public messages;
    mapping(bytes32 => address) public messageSenders;

    // Authorized relayer addresses
    mapping(address => bool) public relayers;

    event XCMMessageSent(bytes32 indexed messageId, bytes32 destination, bytes payload, address sender);
    event XCMResultReceived(bytes32 indexed messageId, bool success, uint256 pnl);

    modifier onlyRelayer() {
        require(relayers[msg.sender] || msg.sender == owner(), "XCMBridge: not authorized relayer");
        _;
    }

    constructor() Ownable(msg.sender) {
        relayers[msg.sender] = true;
    }

    /// @notice Add an authorized relayer
    function addRelayer(address relayer) external onlyOwner {
        relayers[relayer] = true;
    }

    /// @notice Send an XCM message to a parachain
    /// @param destination Parachain destination (bytes32 encoded parachain ID)
    /// @param payload Encoded message payload
    /// @return messageId Unique identifier for tracking the message
    function sendXCMMessage(bytes32 destination, bytes calldata payload)
        external
        returns (bytes32 messageId)
    {
        messageId = keccak256(abi.encodePacked(destination, payload, msg.sender, block.timestamp));
        messages[messageId] = XCMMessage({
            destination: destination,
            payload: payload,
            sentAt: block.timestamp,
            settled: false,
            success: false,
            pnl: 0
        });
        messageSenders[messageId] = msg.sender;
        emit XCMMessageSent(messageId, destination, payload, msg.sender);
    }

    /// @notice Receive result from parachain via relayer
    /// @param messageId The original message ID
    /// @param success Whether the cross-chain operation succeeded
    /// @param pnl Profit or loss from the operation (scaled by 1e6 for USDC)
    function receiveXCMResult(bytes32 messageId, bool success, uint256 pnl)
        external
        onlyRelayer
    {
        require(messages[messageId].sentAt > 0, "XCMBridge: message not found");
        require(!messages[messageId].settled, "XCMBridge: already settled");
        messages[messageId].settled = true;
        messages[messageId].success = success;
        messages[messageId].pnl = pnl;
        emit XCMResultReceived(messageId, success, pnl);
    }

    /// @notice Get message details
    function getMessage(bytes32 messageId) external view returns (XCMMessage memory) {
        return messages[messageId];
    }

    /// @notice Check if a message has been settled
    function isSettled(bytes32 messageId) external view returns (bool) {
        return messages[messageId].settled;
    }
}
