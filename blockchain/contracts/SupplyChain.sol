// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SupplyChain - EVehicle Supply Chain Management
/// @notice Records every sale transaction immutably on the blockchain
contract SupplyChain {
    address public owner;

    struct Sale {
        uint256 saleId;
        uint256 productId;
        string  productName;
        uint256 qty;
        uint256 price;       // price in smallest unit (paise/cents)
        address seller;
        uint256 timestamp;
        bool    exists;
    }

    mapping(uint256 => Sale) private sales;
    uint256[] private saleIds;

    event SaleRecorded(
        uint256 indexed saleId,
        uint256 indexed productId,
        string  productName,
        uint256 qty,
        uint256 price,
        address indexed seller,
        uint256 timestamp
    );

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "SupplyChain: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Record a new sale transaction on chain
    /// @param saleId The DB sale ID for cross-reference
    /// @param productId The product ID from the database
    /// @param productName Human-readable product name
    /// @param qty Quantity sold
    /// @param price Total sale price (in smallest currency unit)
    function recordSale(
        uint256 saleId,
        uint256 productId,
        string memory productName,
        uint256 qty,
        uint256 price
    ) external {
        require(!sales[saleId].exists, "SupplyChain: sale ID already recorded");
        require(qty > 0, "SupplyChain: quantity must be > 0");
        require(price > 0, "SupplyChain: price must be > 0");

        sales[saleId] = Sale({
            saleId:      saleId,
            productId:   productId,
            productName: productName,
            qty:         qty,
            price:       price,
            seller:      msg.sender,
            timestamp:   block.timestamp,
            exists:      true
        });

        saleIds.push(saleId);

        emit SaleRecorded(saleId, productId, productName, qty, price, msg.sender, block.timestamp);
    }

    /// @notice Get a recorded sale by its ID
    function getSale(uint256 saleId) external view returns (
        uint256 _saleId,
        uint256 _productId,
        string memory _productName,
        uint256 _qty,
        uint256 _price,
        address _seller,
        uint256 _timestamp
    ) {
        require(sales[saleId].exists, "SupplyChain: sale not found");
        Sale memory s = sales[saleId];
        return (s.saleId, s.productId, s.productName, s.qty, s.price, s.seller, s.timestamp);
    }

    /// @notice Get all recorded sale IDs
    function getAllSaleIds() external view returns (uint256[] memory) {
        return saleIds;
    }

    /// @notice Total number of recorded sales
    function totalSales() external view returns (uint256) {
        return saleIds.length;
    }

    /// @notice Transfer contract ownership
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "SupplyChain: new owner is zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
