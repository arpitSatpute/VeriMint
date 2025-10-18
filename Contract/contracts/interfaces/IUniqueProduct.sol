// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IUniqueProduct {
    struct Listing {
        address merchant;
        uint256 price;
    }

    function getListing(uint256 tokenId) external view returns (address merchant, uint256 price);

    function isListed(uint256 tokenId) external view returns (bool);

    function isRedeemed(uint256 tokenId) external view returns (bool);

    function buyNft(uint256 tokenId, address _buyer) external;

    function listNft(uint256 tokenId, uint256 price) external;

    function cancelListing(uint256 tokenId) external;

    function redeemNft(uint256 tokenId, address _buyer) external;

    function refundNft(uint256 tokenId, address _merchant, address _buyer) external;
}
