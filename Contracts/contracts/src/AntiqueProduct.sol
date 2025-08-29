// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract AntiqueProduct is Ownable, ERC721, ERC721URIStorage{


    event NFTMinted(uint256 tokenId, address owner, string uri);
    event NFTListed(uint256 tokenId, address merchant, uint256 price);
    event NFTPurchased(address merchant, address buyer, uint256 price);
    event NFTCanceled(uint256 tokenId);
    event NFTBurned(uint256 tokenId);

    uint256 private _nextTokenId;

    struct Listing{
        address merchant;
        uint256 price;
    }
    
    // save listed token id
    uint256[] private listedToken;

    // mapping merchant and nft price with tokenid
    mapping (uint256 => Listing) public listOfTokens;
    mapping (uint256 => bool) public isListed;

    constructor () Ownable(msg.sender) ERC721("Veri", "VER"){

    }

    function safeMintNFT(string memory uri) public returns(uint256) {
        uint256 tokenId = ++_nextTokenId;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        emit NFTMinted(tokenId, msg.sender, uri);
        return tokenId;
    }
    

    function listNFT(uint256 tokenId, uint256 price) external {
        require(!isListed[tokenId], "NFT already listed");
        require(ownerOf(tokenId) == msg.sender, "Not Owner");
        require(price > 0, "Set Valid Price for NFT");
        listOfTokens[tokenId] = Listing(msg.sender, price);
        listedToken.push(tokenId);
        isListed[tokenId] = true;
        emit NFTListed(tokenId, msg.sender, price);
    }

    function buyNFT(uint256 tokenId) external {
        // check escrow contract to tract payment is done by buyer for nft with token id or not
        Listing memory list = listOfTokens[tokenId];

        delete(listOfTokens[tokenId]);
        removeTokenFromList(tokenId);
        isListed[tokenId] = false;
        _transfer(list.merchant, msg.sender, tokenId);
        emit NFTPurchased(list.merchant, msg.sender, list.price);
    }

    function cancelListing(uint256 tokenId) external {
        Listing memory list = listOfTokens[tokenId];
        require(list.merchant == msg.sender, "Not Owner of NFT");
        
        delete(listOfTokens[tokenId]);
        removeTokenFromList(tokenId);
        isListed[tokenId] = false;
        emit NFTCanceled(tokenId);
    }

    function burnNFT(uint256 tokenId) external {
        require(!isListed[tokenId], "Listed NFT, Cancel First");
        _burn(tokenId);
        emit NFTBurned(tokenId);
    }

    function getAllListings() external view returns(Listing[] memory , uint256[] memory) {
        uint256 count = listedToken.length;
        Listing[] memory activeListing = new Listing[](count);
        uint256[] memory tokenIds = new uint256[](count);

        for(uint i=0; i<count; i++) {
            uint256 tokenId = listedToken[i];
            activeListing[i] = listOfTokens[tokenId];
            tokenIds[i] = tokenId;
        }

        return (activeListing, tokenIds);

    }

    function removeTokenFromList(uint256 tokenId) internal {
        for(uint256 i=0; i<listedToken.length; i++) {
            if(listedToken[i] == tokenId) {
                listedToken[i] = listedToken[listedToken.length-1];
                listedToken.pop();
                break;
            }
        }
    }



    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns(string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns(bool) {
        return super.supportsInterface(interfaceId);
    }

}