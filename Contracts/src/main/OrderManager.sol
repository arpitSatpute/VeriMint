// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "../interfaces/IProductNFT.sol";
import "../interfaces/IOrderManager.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OrderManager is Ownable, IOrderManager {
    IProductNFT public productNFT;
    address public escrow;
    uint256 public nextOrderId;

    mapping(uint256 => Order) private orders;
    mapping(uint256 => OrderMeta) private orderMeta;
    mapping(address => uint256[]) public buyerOrders;
    mapping(address => uint256[]) public merchantOrders;

    constructor(address _productNFT) Ownable(msg.sender) {
        productNFT = IProductNFT(_productNFT);
    }

    modifier onlyEscrow() {
        require(msg.sender == escrow, "Only escrow");
        _;
    }

    function setEscrow(address _escrow) external onlyOwner {
        require(_escrow != address(0), "Invalid escrow");
        escrow = _escrow;
    }

    function createOrder(
        uint256 tokenId,
        address buyer,
        uint256 supply,
        uint256 totalPrice,
        bytes32 productType,
        bytes32 deliveryPointHash,
        address merchant
    ) external onlyEscrow returns (uint256) {

        uint256 orderId = nextOrderId++;

        orders[orderId] = Order({
            orderId: orderId,
            tokenId: tokenId,
            buyer: buyer,
            merchant: merchant,
            createdAt: block.timestamp,
            deliveryStatus: DeliveryStatus.Pending,
            state: OrderState.Created
        });

        orderMeta[orderId] = OrderMeta({
            supply: supply,
            totalPrice: totalPrice,
            productType: productType,
            deliveryPointHash: deliveryPointHash
        });

        // Map orders to buyer and merchant
        buyerOrders[buyer].push(orderId);
        merchantOrders[merchant].push(orderId);

        return orderId;
    }

    function updateStatus(uint256 orderId, DeliveryStatus status) external onlyEscrow {
        orders[orderId].deliveryStatus = status;
    }

    function confirmDelivered(uint256 orderId) external onlyEscrow {
        orders[orderId].deliveryStatus = DeliveryStatus.Delivered;
    }

    function markReleased(uint256 orderId) external onlyEscrow {
        orders[orderId].state = OrderState.Released;
    }

    function markCancelled(uint256 orderId) external onlyEscrow {
        orders[orderId].state = OrderState.Cancelled;
    }

    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    function getOrderMeta(uint256 orderId) external view returns (OrderMeta memory) {
        return orderMeta[orderId];
    }

    function getBuyerOrderCount(address buyer) external view returns (uint256) {
        return buyerOrders[buyer].length;
    }

    function getMerchantOrderCount(address merchant) external view returns (uint256) {
        return merchantOrders[merchant].length;
    }

    function getBuyerOrderIds(address buyer) external view returns (uint256[] memory) {
        return buyerOrders[buyer];
    }

    function getMerchantOrderIds(address merchant) external view returns (uint256[] memory) {
        return merchantOrders[merchant];
    }
}