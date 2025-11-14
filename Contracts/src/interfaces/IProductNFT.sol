// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IProductNFT {
    struct Product {
        string name;
        string description;
        address merchant;
        uint256 price;
        bytes32 productType;
        string tokenURI;
        uint256 mintedAt;
    }

    struct Listing {
        bool listed;
        uint256 price;
        uint256 listedAt;
    }

    function mintProduct(
        uint256 supply,
        uint256 price,
        string calldata name,
        string calldata description,
        bytes32 productType,
        string calldata tokenURI
    ) external returns (uint256);

    function listProduct(uint256 tokenId) external;
    function unlistProduct(uint256 tokenId) external;

    function getProduct(uint256 tokenId) external view returns (Product memory);
    function getListedProduct(uint256 tokenId) external view returns (address merchant, uint256 price);
    function isProductListed(uint256 tokenId) external view returns (bool);

    function adjustReserved(uint256 tokenId, uint256 supply, bool increase) external;
    function availableSupply(uint256 tokenId) external view returns (uint256);

    function escrowAddress() external view returns(address escrowAddress);

    // Escrow release
    function releaseFromMerchant(
        address from,
        address to,
        uint256 tokenId,
        uint256 amount,
        bytes memory data
    ) external;
}