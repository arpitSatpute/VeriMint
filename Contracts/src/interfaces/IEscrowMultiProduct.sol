// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IEscrowMultiProduct {
    enum DeliveryStatus { Pending, InTransit, Delivered, Failed }

    struct TraceNft {
        address buyer;
        address merchant;
        uint256 totalPrice;
        uint256 supply;
        uint256 tokenId;
        uint256 orderId;
        DeliveryStatus deliveryStatus;
        bool isDelivered;
        uint256 deliveryUpdatedAt;
        uint256 deliveryConfirmedAt;
    }

    function fundEscrow(
        uint256 tokenId,
        uint256 supply,
        bytes32 deliveryPointHash
    ) external payable returns (uint256);

    function updateDelivery(uint256 orderId, DeliveryStatus status) external;
    function confirmDelivery(uint256 orderId) external;
    function releaseFundToMerchant(uint256 orderId) external;
    function refundToBuyer(uint256 orderId) external;

    function getOrderDetails(uint256 orderId) external view returns (TraceNft memory);
}