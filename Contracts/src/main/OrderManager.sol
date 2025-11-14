// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "../interfaces/IProductNFT.sol";
import "../interfaces/IOrderManager.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OrderManager is Ownable, IOrderManager {
    IProductNFT public productNFT;
    uint256 public nextOrderId;

    mapping(uint256 => Order) private orders;
    mapping(uint256 => OrderMeta) private orderMeta;

    constructor(address _productNFT) Ownable(msg.sender) {
        productNFT = IProductNFT(_productNFT);
    }

    function createOrder(
        uint256 tokenId,
        address buyer,
        uint256 supply,
        uint256 totalPrice,
        bytes32 productType,
        bytes32 deliveryPointHash,
        address merchant
    ) external returns (uint256) {
        require(msg.sender == productNFT.escrowAddress(), "Only escrow");

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

        return orderId;
    }

    function updateStatus(uint256 orderId, DeliveryStatus status) external onlyOwner {
        orders[orderId].deliveryStatus = status;
    }

    function confirmDelivered(uint256 orderId) external onlyOwner {
        orders[orderId].deliveryStatus = DeliveryStatus.Delivered;
    }

    function markReleased(uint256 orderId) external onlyOwner {
        orders[orderId].state = OrderState.Released;
    }

    function markCancelled(uint256 orderId) external onlyOwner {
        orders[orderId].state = OrderState.Cancelled;
    }

    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    function getOrderMeta(uint256 orderId) external view returns (OrderMeta memory) {
        return orderMeta[orderId];
    }
}