// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IUniqueProduct {
    struct Listing {
        address merchant;
        uint256 price;
    }

    // function listOfTokens(uint256 tokenId) external view returns (Listing memory);
    function getListing(uint256 tokenId) external view returns (address merchant, uint256 price);

    function isListed(uint256 tokenId) external view returns (bool);

    function isReedemed(uint256 tokenId) external view returns (bool);

    function buyNFT(uint256 tokenId, address _buyer) external;

    function listNFT(uint256 tokenId, uint256 price) external;

    function cancelListing(uint256 tokenId) external;

    function reedemNFT(uint256 tokenId, address _buyer) external;

    function refundNFT(uint256 tokenId, address _merchant, address _buyer) external;
}
