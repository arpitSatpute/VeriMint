// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IOrderManager {
    enum DeliveryStatus { Pending, InTransit, Delivered, Failed }
    enum OrderState { Created, Released, Cancelled }

    struct Order {
        uint256 orderId;
        uint256 tokenId;
        address buyer;
        address merchant;
        uint256 createdAt;
        DeliveryStatus deliveryStatus;
        OrderState state;
    }

    struct OrderMeta {
        uint256 supply;
        uint256 totalPrice;
        bytes32 productType;
        bytes32 deliveryPointHash;
    }

    function createOrder(
        uint256 tokenId,
        address buyer,
        uint256 supply,
        uint256 totalPrice,
        bytes32 productType,
        bytes32 deliveryPointHash,
        address merchant
    ) external returns (uint256);

    function getOrder(uint256 orderId) external view returns (Order memory);
    function getOrderMeta(uint256 orderId) external view returns (OrderMeta memory);

    function updateStatus(uint256 orderId, DeliveryStatus status) external;
    function confirmDelivered(uint256 orderId) external;
    function markReleased(uint256 orderId) external;
    function markCancelled(uint256 orderId) external;
}