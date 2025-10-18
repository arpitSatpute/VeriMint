// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IMultiProduct {
    function isProductListed(uint256 tokenId) external view returns (bool);
    function getMerchantProducts(address merchant) external view returns (uint256[] memory);
    function getListedProduct(uint256 tokenId) external view returns (address merchant, uint256 price);
    function createOrder(uint256 tokenId, address buyer, uint256 supply) external returns (uint256);
    function releaseOrder(uint256 orderId) external;
    function cancelOrder(uint256 orderId) external;
}
