// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155URIStorage} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";

contract MultiProduct is Ownable, ERC1155URIStorage {
    uint256 private _nextProductId;
    uint256 private _nextOrderId;
    address public escrowAddress;

    enum DeliveryStatus { Pending, InTransit, Delivered, Failed }

    event ProductMinted(
        uint256 indexed tokenId,
        address indexed merchant,
        uint256 supply,
        uint256 pricePerUnit,
        string name,
        string description,
        string productType,
        string tokenURI
    );
    event ProductListed(uint256 indexed tokenId, address indexed merchant, uint256 pricePerUnit, uint256 listedAt);
    event OrderCreated(uint256 indexed orderId, uint256 indexed tokenId, address buyer, uint256 supply, uint256 totalPrice, address merchant);
    event OrderReleased(uint256 indexed orderId);
    event OrderCancelled(uint256 indexed orderId);
    event DeliveryUpdated(uint256 indexed orderId, DeliveryStatus status, uint256 timestamp);
    event DeliveryConfirmed(uint256 indexed orderId, uint256 timestamp);

    struct Product {
        string name;
        string description;
        address merchant;
        uint256 price;
        string productType;
        string deliveryPointHash;
        uint256 mintedAt;
    }

    struct Order {
        uint256 tokenId;
        string productType;
        uint256 supply;
        uint256 price;
        address merchant;
        address buyer;
        uint256 createdAt;
        uint256 releasedAt;
        uint256 cancelledAt;
        DeliveryStatus deliveryStatus;
        uint256 deliveryUpdatedAt;
        uint256 deliveryConfirmedAt;
    }

    struct ListingProduct {
        address merchant;
        uint256 price;
    }

    mapping(uint256 => Product) public mintedProduct;
    mapping(uint256 => ListingProduct) public listedProduct;
    mapping(uint256 => bool) public isProductListed;
    uint256[] private listedProductTokens;
    mapping(address => uint256[]) private merchantProducts;
    mapping(uint256 => Order) public orderListed;
    mapping(uint256 => uint256) public reservedSupply;
    mapping(uint256 => uint256) public listedAt;

    modifier onlyEscrow() {
        require(msg.sender == escrowAddress, "Only escrow");
        _;
    }

    constructor() ERC1155("") Ownable(msg.sender) {}

    function setEscrowAddress(address _escrow) external onlyOwner {
        escrowAddress = _escrow;
    }

    function mintProductNft(
        uint256 supply,
        uint256 price,
        string calldata name,
        string calldata description,
        string calldata productType,
        string calldata deliveryPointHash,
        string calldata tokenURI
    ) external returns (uint256) {
        require(price > 0, "Invalid price");
        require(supply > 0, "Invalid supply");
        bytes32 typeHash = keccak256(bytes(productType));
        require(
            typeHash == keccak256(bytes("virtual")) || typeHash == keccak256(bytes("physical")),
            "Invalid type"
        );

        uint256 tokenId = ++_nextProductId;
        _mint(msg.sender, tokenId, supply, "");
        _setURI(tokenId, tokenURI);
        merchantProducts[msg.sender].push(tokenId);

        mintedProduct[tokenId] = Product({
            name: name,
            description: description,
            merchant: msg.sender,
            price: price,
            productType: productType,
            deliveryPointHash: typeHash == keccak256(bytes("physical")) ? deliveryPointHash : "",
            mintedAt: block.timestamp
        });

        emit ProductMinted(tokenId, msg.sender, supply, price, name, description, productType, tokenURI);
        return tokenId;
    }

    function getMerchantProducts(address merchant) external view returns (uint256[] memory) {
        return merchantProducts[merchant];
    }

    function listProduct(uint256 tokenId) external {
        Product memory p = mintedProduct[tokenId];
        require(p.merchant == msg.sender, "Not merchant");
        require(!isProductListed[tokenId], "Already listed");

        listedProduct[tokenId] = ListingProduct({merchant: msg.sender, price: p.price});
        listedProductTokens.push(tokenId);
        isProductListed[tokenId] = true;
        listedAt[tokenId] = block.timestamp;

        emit ProductListed(tokenId, msg.sender, p.price, block.timestamp);
    }

    function getUnlistedProductsMerchant() external view returns (uint256[] memory) {
        uint256[] memory products = merchantProducts[msg.sender];
        uint256[] memory result = new uint256[](products.length);
        uint256 count = 0;
        for (uint256 i = 0; i < products.length; i++) {
            if (!isProductListed[products[i]]) {
                result[count++] = products[i];
            }
        }
        assembly { mstore(result, count) }
        return result;
    }

    function cancelProductListing(uint256 tokenId) external {
        ListingProduct memory listing = listedProduct[tokenId];
        require(listing.merchant == msg.sender, "Not owner");
        delete listedProduct[tokenId];
        _removeProductFromList(tokenId);
        isProductListed[tokenId] = false;
        listedAt[tokenId] = 0;
    }

    function _removeProductFromList(uint256 tokenId) internal {
        for (uint256 i = 0; i < listedProductTokens.length; i++) {
            if (listedProductTokens[i] == tokenId) {
                listedProductTokens[i] = listedProductTokens[listedProductTokens.length - 1];
                listedProductTokens.pop();
                break;
            }
        }
    }

    function getAllListing() external view returns (ListingProduct[] memory, uint256[] memory, Product[] memory) {
        uint256 count = listedProductTokens.length;
        ListingProduct[] memory listings = new ListingProduct[](count);
        uint256[] memory tokenIds = new uint256[](count);
        Product[] memory products = new Product[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 id = listedProductTokens[i];
            listings[i] = listedProduct[id];
            tokenIds[i] = id;
            products[i] = mintedProduct[id];
        }
        return (listings, tokenIds, products);
    }

    function getListedProduct(uint256 tokenId) external view returns (address, uint256) {
        ListingProduct memory p = listedProduct[tokenId];
        return (p.merchant, p.price);
    }

    function createOrder(uint256 tokenId, address buyer, uint256 supply) external onlyEscrow returns (uint256) {
        require(isProductListed[tokenId], "Not listed");
        ListingProduct memory listing = listedProduct[tokenId];
        require(balanceOf(listing.merchant, tokenId) - reservedSupply[tokenId] >= supply, "Low supply");

        reservedSupply[tokenId] += supply;
        uint256 totalPrice = listing.price * supply;
        uint256 orderId = ++_nextOrderId;
        string memory pType = mintedProduct[tokenId].productType;

        orderListed[orderId] = Order({
            tokenId: tokenId,
            productType: pType,
            supply: supply,
            price: totalPrice,
            merchant: listing.merchant,
            buyer: buyer,
            createdAt: block.timestamp,
            releasedAt: 0,
            cancelledAt: 0,
            deliveryStatus: DeliveryStatus.Pending,
            deliveryUpdatedAt: 0,
            deliveryConfirmedAt: 0
        });

        emit OrderCreated(orderId, tokenId, buyer, supply, totalPrice, listing.merchant);
        return orderId;
    }

    function releaseOrder(uint256 orderId) external onlyEscrow {
        Order storage ord = orderListed[orderId];
        require(ord.buyer != address(0), "Invalid");
        require(ord.releasedAt == 0 && ord.cancelledAt == 0, "Processed");

        reservedSupply[ord.tokenId] -= ord.supply;
        _safeTransferFrom(ord.merchant, ord.buyer, ord.tokenId, ord.supply, "");
        ord.releasedAt = block.timestamp;

        emit OrderReleased(orderId);
    }

    function cancelOrder(uint256 orderId) external onlyEscrow {
        Order storage ord = orderListed[orderId];
        require(ord.buyer != address(0), "Invalid");
        require(ord.releasedAt == 0 && ord.cancelledAt == 0, "Processed");

        reservedSupply[ord.tokenId] -= ord.supply;
        ord.cancelledAt = block.timestamp;

        emit OrderCancelled(orderId);
    }

    function updateDeliveryStatus(uint256 orderId, uint8 status) external onlyEscrow {
        Order storage ord = orderListed[orderId];
        require(ord.buyer != address(0), "Invalid");
        require(keccak256(bytes(ord.productType)) == keccak256(bytes("physical")), "Not physical");
        require(ord.releasedAt == 0 && ord.cancelledAt == 0, "Closed");
        require(status <= uint8(DeliveryStatus.Failed), "Invalid status");

        ord.deliveryStatus = DeliveryStatus(status);
        ord.deliveryUpdatedAt = block.timestamp;

        emit DeliveryUpdated(orderId, DeliveryStatus(status), block.timestamp);
    }

    function confirmDelivery(uint256 orderId) external onlyEscrow {
        Order storage ord = orderListed[orderId];
        require(ord.buyer != address(0), "Invalid");
        require(keccak256(bytes(ord.productType)) == keccak256(bytes("physical")), "Not physical");
        require(ord.deliveryStatus == DeliveryStatus.InTransit, "Not in transit");
        require(ord.deliveryConfirmedAt == 0, "Confirmed");

        ord.deliveryStatus = DeliveryStatus.Delivered;
        ord.deliveryConfirmedAt = block.timestamp;

        emit DeliveryConfirmed(orderId, block.timestamp);
    }

    function uri(uint256 tokenId) public view override(ERC1155URIStorage) returns (string memory) {
        return super.uri(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}