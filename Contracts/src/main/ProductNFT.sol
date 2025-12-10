// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IProductNFT.sol";

contract ProductNFT is ERC1155, Ownable, IProductNFT {
    uint256 public nextProductId;
    uint256[] public listedProducts;

    address public escrowAddress;

    mapping(uint256 => uint256) public reservedSupply;
    mapping(uint256 => Product) public products;
    mapping(uint256 => Listing) public listings;
    mapping(address => uint256[]) public merchantProducts;
    


    constructor() ERC1155("") Ownable(msg.sender) {}

    function setEscrow(address _escrow) external onlyOwner {
        require(_escrow != address(0), "Invalid escrow");
        escrowAddress = _escrow;
    }

    function mintProduct(
        uint256 supply,
        uint256 price,
        string calldata name,
        string calldata description,
        bytes32 productType,
        string calldata tokenURI
    ) external returns (uint256) {
        require(price > 0 && supply > 0, "Invalid");

        uint256 tokenId = ++nextProductId;

        _mint(msg.sender, tokenId, supply, "");

        products[tokenId] = Product(
            name,
            description,
            msg.sender,
            price,
            productType,
            tokenURI,
            block.timestamp
        );

        merchantProducts[msg.sender].push(tokenId);
        return tokenId;
    }

    function listProduct(uint256 tokenId) external {
        Product memory p = products[tokenId];
        require(msg.sender == p.merchant, "Not merchant");
        require(p.price > 0, "No price");

        listings[tokenId] = Listing(true, p.price, block.timestamp);
        listedProducts.push(tokenId);
    }

    function unlistProduct(uint256 tokenId) external {
        Product memory p = products[tokenId];
        require(msg.sender == p.merchant, "Not merchant");

        delete listings[tokenId];
        removeListedProduct(tokenId);
    }

    function removeListedProduct(uint256 tokenId) internal {
        uint256 len = listedProducts.length;
        for (uint256 i = 0; i < len; i++) {
            if (listedProducts[i] == tokenId) {
                listedProducts[i] = listedProducts[len - 1]; 
                listedProducts.pop(); 
                break;
            }
        }
    }

    function getAllListedProducts() 
        external 
        view 
        returns (uint256[] memory tokenIds, Product[] memory productData) 
    {
        uint256 count = 0;

        // First pass — count active listings
        for (uint256 i = 0; i < listedProducts.length; i++) {
            if (listings[listedProducts[i]].listed) {
                count++;
            }
        }

        tokenIds = new uint256[](count);
        productData = new Product[](count);

        uint256 index = 0;

        // Second pass — collect the product IDs & product data
        for (uint256 i = 0; i < listedProducts.length; i++) {
            uint256 tokenId = listedProducts[i];
            if (listings[tokenId].listed) {
                tokenIds[index] = tokenId;
                productData[index] = products[tokenId];
                index++;
            }
        }

        return (tokenIds, productData);
    }


    function adjustReserved(uint256 tokenId, uint256 supply, bool increase) external {
        require(msg.sender == escrowAddress, "Only escrow");

        if (increase) {
            reservedSupply[tokenId] += supply;
        } else {
            reservedSupply[tokenId] -= supply;
        }
    }

    function availableSupply(uint256 tokenId) external view returns (uint256) {
        Product memory p = products[tokenId];
        return balanceOf(p.merchant, tokenId) - reservedSupply[tokenId];
    }

    function getProduct(uint256 tokenId) external view returns (Product memory) {
        return products[tokenId];
    }

    function getListedProduct(uint256 tokenId) external view returns (address merchant, uint256 price) {
        Listing memory l = listings[tokenId];
        require(l.listed, "Not listed");
        return (products[tokenId].merchant, l.price);
    }

    function isProductListed(uint256 tokenId) external view returns (bool) {
        return listings[tokenId].listed;
    }

    // Called by Escrow to transfer NFTs
    function releaseFromMerchant(
        address from,
        address to,
        uint256 tokenId,
        uint256 amount,
        bytes memory data
    ) external {
        require(msg.sender == escrowAddress, "Only escrow");
        _safeTransferFrom(from, to, tokenId, amount, data);
    }
}