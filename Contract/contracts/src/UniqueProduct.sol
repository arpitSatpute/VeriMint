// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { IUniqueProduct } from "../interfaces/IUniqueProduct.sol";

contract UniqueProduct is Ownable, ERC721, ERC721URIStorage, IUniqueProduct {

    event NftMinted(uint256 tokenId, address owner, string uri);
    event NftListed(uint256 tokenId, address merchant, uint256 price);
    event NftPurchased(address merchant, address buyer, uint256 price);
    event NftRefunded(address owner, uint256 tokenId);
    event NftCanceled(uint256 tokenId);
    event NftBurned(uint256 tokenId);

    uint256 private _nextTokenId;

    // save listed token id
    uint256[] private listedToken;

    // mapping merchant and Nft price with tokenid
    mapping(uint256 => Listing) public listOfTokens;
    mapping(uint256 => bool) public isListed;
    mapping(uint256 => bool) public isRedeemed;
    mapping(address => uint256[]) private merchantProducts;
    mapping(address => uint256[]) private buyerProducts;

    constructor() Ownable(msg.sender) ERC721("Veri", "VER") {}

    function safeMintNft(string memory uri) public returns (uint256) {
        uint256 tokenId = ++_nextTokenId;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        merchantProducts[msg.sender].push(tokenId);
        emit NftMinted(tokenId, msg.sender, uri);
        return tokenId;
    }

    function listNft(uint256 tokenId, uint256 price) external override {
        require(!isListed[tokenId], "Nft already listed");
        require(ownerOf(tokenId) == msg.sender, "Not Owner");
        require(price > 0, "Set Valid Price for Nft");

        listOfTokens[tokenId] = Listing(msg.sender, price);
        listedToken.push(tokenId);
        isListed[tokenId] = true;
        isRedeemed[tokenId] = false;


        emit NftListed(tokenId, msg.sender, price);
    }

    function buyNft(uint256 tokenId, address _buyer) external override {
        require(_buyer != address(0), "Invalid Address");
        Listing memory list = listOfTokens[tokenId];

        delete listOfTokens[tokenId];
        removeTokenFromList(tokenId);
        isListed[tokenId] = false;

        _transfer(list.merchant, _buyer, tokenId);
        emit NftPurchased(list.merchant, _buyer, list.price);
    }

    function cancelListing(uint256 tokenId) external override {
        Listing memory list = listOfTokens[tokenId];
        require(list.merchant == msg.sender, "Not Owner of Nft");

        delete listOfTokens[tokenId];
        removeTokenFromList(tokenId);
        isListed[tokenId] = false;
        emit NftCanceled(tokenId);
    }

    function burnNft(uint256 tokenId) external {
        require(!isListed[tokenId], "Listed Nft, Cancel First");
        _burn(tokenId);
        emit NftBurned(tokenId);
    }

    function redeemNft(uint256 tokenId, address _buyer) external override {
        require(_buyer == ownerOf(tokenId), "Not an owner");
        require(!isRedeemed[tokenId], "Already redeemed");
        isRedeemed[tokenId] = true;
    }

    function refundNft(uint256 tokenId, address _merchant, address _buyer) external override {
        require(_buyer == ownerOf(tokenId), "Not an owner");
    require(!isRedeemed[tokenId], "Already redeemed");
        _transfer(_buyer, _merchant, tokenId);

        emit NftRefunded(_merchant, tokenId);
    }

    function getBuyerProducts() external view returns (uint256[] memory) {
        return buyerProducts[msg.sender];
    }

    function getAllListings() external view returns (Listing[] memory, uint256[] memory) {
        uint256 count = listedToken.length;
        Listing[] memory activeListing = new Listing[](count);
        uint256[] memory tokenIds = new uint256[](count);

        for (uint i = 0; i < count; i++) {
            uint256 tokenId = listedToken[i];
            activeListing[i] = listOfTokens[tokenId];
            tokenIds[i] = tokenId;
        }

        return (activeListing, tokenIds);
    }

    function getListing(uint256 tokenId) external view override returns (address merchant, uint256 price) {
        Listing memory listing = listOfTokens[tokenId];
        return (listing.merchant, listing.price);
    }

    function getMerchantProducts() external view returns (uint256[] memory) {
        return merchantProducts[msg.sender];
    }

    function getMerchantProductsListing() external view returns (Listing[] memory, uint256[] memory) {
        uint256[] memory tokens = merchantProducts[msg.sender];
        uint256 count = 0;

        for (uint256 i = 0; i < tokens.length; i++) {
            if (isListed[tokens[i]]) {
                count++;
            }
        }

        Listing[] memory listings = new Listing[](count);
        uint256[] memory tokenIds = new uint256[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < tokens.length; i++) {
            if (isListed[tokens[i]]) {
                listings[index] = listOfTokens[tokens[i]];
                tokenIds[index] = tokens[i];
                index++;
            }
        }

        return (listings, tokenIds);
    }

    function removeTokenFromList(uint256 tokenId) internal {
        for (uint256 i = 0; i < listedToken.length; i++) {
            if (listedToken[i] == tokenId) {
                listedToken[i] = listedToken[listedToken.length - 1];
                listedToken.pop();
                break;
            }
        }
    }

    // overrides required by Solidity
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
