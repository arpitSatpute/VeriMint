// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { IUniqueProduct } from "../interfaces/IUniqueProduct.sol";

contract UniqueProduct is Ownable, ERC721, ERC721URIStorage, IUniqueProduct {

    event NFTMinted(uint256 tokenId, address owner, string uri);
    event NFTListed(uint256 tokenId, address merchant, uint256 price);
    event NFTPurchased(address merchant, address buyer, uint256 price);
    event NFTRefunded(address owner, uint256 tokenId);
    event NFTCanceled(uint256 tokenId);
    event NFTBurned(uint256 tokenId);

    uint256 private _nextTokenId;

    // save listed token id
    uint256[] private listedToken;

    // mapping merchant and nft price with tokenid
    mapping(uint256 => Listing) public listOfTokens;
    mapping(uint256 => bool) public isListed;
    mapping(uint256 => bool) public isReedemed;

    constructor() Ownable(msg.sender) ERC721("Veri", "VER") {}

    function safeMintNFT(string memory uri) public returns (uint256) {
        uint256 tokenId = ++_nextTokenId;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        emit NFTMinted(tokenId, msg.sender, uri);
        return tokenId;
    }

    function listNFT(uint256 tokenId, uint256 price) external override {
        require(!isListed[tokenId], "NFT already listed");
        require(ownerOf(tokenId) == msg.sender, "Not Owner");
        require(price > 0, "Set Valid Price for NFT");

        listOfTokens[tokenId] = Listing(msg.sender, price);
        listedToken.push(tokenId);
        isListed[tokenId] = true;
        emit NFTListed(tokenId, msg.sender, price);
    }

    function buyNFT(uint256 tokenId, address _buyer) external override {
        require(_buyer != address(0), "Invalid Address");
        Listing memory list = listOfTokens[tokenId];

        delete listOfTokens[tokenId];
        removeTokenFromList(tokenId);
        isListed[tokenId] = false;

        _transfer(list.merchant, _buyer, tokenId);
        emit NFTPurchased(list.merchant, _buyer, list.price);
    }

    function cancelListing(uint256 tokenId) external override {
        Listing memory list = listOfTokens[tokenId];
        require(list.merchant == msg.sender, "Not Owner of NFT");

        delete listOfTokens[tokenId];
        removeTokenFromList(tokenId);
        isListed[tokenId] = false;
        emit NFTCanceled(tokenId);
    }

    function burnNFT(uint256 tokenId) external {
        require(!isListed[tokenId], "Listed NFT, Cancel First");
        _burn(tokenId);
        emit NFTBurned(tokenId);
    }

    function reedemNFT(uint256 tokenId, address _buyer) external override {
        require(_buyer == ownerOf(tokenId), "Not an owner");
        require(!isReedemed[tokenId], "Already reedemed");
        isReedemed[tokenId] = true;
    }

    function refundNFT(uint256 tokenId, address _merchant, address _buyer) external override {
        require(_buyer == ownerOf(tokenId), "Not an owner");
        require(!isReedemed[tokenId], "Already reedemed");
        _transfer(_buyer, _merchant, tokenId);

        emit NFTRefunded(_merchant, tokenId);
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
