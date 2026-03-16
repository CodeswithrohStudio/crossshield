// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title RWAOracle
/// @notice Mock price oracle for 25 real-world assets including commodities, crypto, and real estate indexes
/// @dev Prices have 8 decimal places (e.g., $3200.00 = 320000000000)
contract RWAOracle is Ownable {
    struct AssetInfo {
        string name;
        string symbol;
        uint256 price;
        uint256 lastUpdated;
    }

    mapping(uint8 => AssetInfo) private assets;
    uint8 public constant ASSET_COUNT = 25;

    event PriceUpdated(uint8 indexed assetId, uint256 oldPrice, uint256 newPrice);

    constructor() Ownable(msg.sender) {
        _initializePrices();
    }

    /// @notice Initialize all 25 asset prices
    function _initializePrices() internal {
        _setAsset(0,  "Gold",             "XAU", 320000000000);
        _setAsset(1,  "Silver",           "XAG",   3200000000);
        _setAsset(2,  "Crude Oil",        "WTI",   7800000000);
        _setAsset(3,  "Natural Gas",      "NG",     350000000);
        _setAsset(4,  "Bitcoin",          "BTC", 8500000000000);
        _setAsset(5,  "Ethereum",         "ETH",  220000000000);
        _setAsset(6,  "Solana",           "SOL",   14500000000);
        _setAsset(7,  "XRP",              "XRP",      55000000);
        _setAsset(8,  "Miami RE",         "MIA",   48500000000);
        _setAsset(9,  "Austin RE",        "AUS",   42000000000);
        _setAsset(10, "NYC RE",           "NYC",   82000000000);
        _setAsset(11, "LA RE",            "LAX",   72000000000);
        _setAsset(12, "Chicago RE",       "CHI",   31000000000);
        _setAsset(13, "Phoenix RE",       "PHX",   38000000000);
        _setAsset(14, "Denver RE",        "DEN",   49000000000);
        _setAsset(15, "Seattle RE",       "SEA",   62000000000);
        _setAsset(16, "Portland RE",      "PDX",   44500000000);
        _setAsset(17, "Nashville RE",     "BNA",   39000000000);
        _setAsset(18, "Charlotte RE",     "CLT",   34000000000);
        _setAsset(19, "Atlanta RE",       "ATL",   36000000000);
        _setAsset(20, "Dallas RE",        "DAL",   35000000000);
        _setAsset(21, "Houston RE",       "HOU",   29000000000);
        _setAsset(22, "Boston RE",        "BOS",   58000000000);
        _setAsset(23, "San Francisco RE", "SFO",   78000000000);
        _setAsset(24, "Las Vegas RE",     "LAS",   38000000000);
    }

    function _setAsset(uint8 id, string memory name, string memory symbol, uint256 price) internal {
        assets[id] = AssetInfo(name, symbol, price, block.timestamp);
    }

    /// @notice Get current price of an asset
    /// @param assetId Asset ID (0–24)
    /// @return price Price with 8 decimal places
    function getPrice(uint8 assetId) external view returns (uint256 price) {
        require(assetId < ASSET_COUNT, "RWAOracle: invalid asset ID");
        return assets[assetId].price;
    }

    /// @notice Update asset price (owner only, mock updater)
    /// @param assetId Asset ID (0–24)
    /// @param price New price with 8 decimals
    function updatePrice(uint8 assetId, uint256 price) external onlyOwner {
        require(assetId < ASSET_COUNT, "RWAOracle: invalid asset ID");
        require(price > 0, "RWAOracle: price must be positive");
        uint256 oldPrice = assets[assetId].price;
        assets[assetId].price = price;
        assets[assetId].lastUpdated = block.timestamp;
        emit PriceUpdated(assetId, oldPrice, price);
    }

    /// @notice Get the name of an asset
    /// @param assetId Asset ID (0–24)
    /// @return name Human-readable asset name
    function assetName(uint8 assetId) external view returns (string memory name) {
        require(assetId < ASSET_COUNT, "RWAOracle: invalid asset ID");
        return assets[assetId].name;
    }

    /// @notice Get the symbol of an asset
    /// @param assetId Asset ID (0–24)
    function assetSymbol(uint8 assetId) external view returns (string memory) {
        require(assetId < ASSET_COUNT, "RWAOracle: invalid asset ID");
        return assets[assetId].symbol;
    }

    /// @notice Get full asset info
    function getAssetInfo(uint8 assetId) external view returns (AssetInfo memory) {
        require(assetId < ASSET_COUNT, "RWAOracle: invalid asset ID");
        return assets[assetId];
    }
}
