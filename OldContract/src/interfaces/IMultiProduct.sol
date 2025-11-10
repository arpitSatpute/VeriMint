// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IMultiProduct {
    function isProductListed(uint256 tokenId) external view returns (bool);
    function getListedProduct(uint256 tokenId) external view returns (address, uint256);
    function createOrder(uint256 tokenId, address buyer, uint256 supply) external returns (uint256);
    function releaseOrder(uint256 orderId) external;
    function cancelOrder(uint256 orderId) external;
    function updateDeliveryStatus(uint256 orderId, uint8 status) external;
    function confirmDelivery(uint256 orderId) external;

    struct Product {
        string name;
        string description;
        address merchant;
        uint256 price;
        string productType;
        string deliveryPointHash;
        uint256 mintedAt;
    }
    function mintedProduct(uint256 tokenId) external view returns (Product memory);
}