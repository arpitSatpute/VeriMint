// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title MultiProduct
 * @notice ERC1155-based product marketplace supporting multiple merchants and escrow integration.
 */

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155URIStorage} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";

// ERC1155URIStorage already inherits ERC1155, so inherit only ERC1155URIStorage here
contract MultiProduct is Ownable, ERC1155URIStorage {
    uint256 private _nextProductId;
    uint256 private _nextOrderId;

    address public escrowAddress; // escrow contract set by owner

    event ProductMinted(
        uint256 indexed tokenId,
        address indexed merchant,
        uint256 supply,
        uint256 pricePerUnit,
        string name,
        string description,
        string tokenURI
    );

    event ProductListed(uint256 indexed tokenId, address indexed merchant, uint256 pricePerUnit);
    event OrderCreated(uint256 indexed orderId, uint256 indexed tokenId, address buyer, uint256 supply, uint256 totalPrice, address merchant);
    event OrderReleased(uint256 indexed orderId);
    event OrderCancelled(uint256 indexed orderId);

    // ✅ FIXED: no argument to Ownable
    constructor() ERC1155("Veri") Ownable(msg.sender) {
    }

    struct Product {
        string name;
        string description;
        address merchant;
        uint256 price;
    }

    struct Order {
        uint256 tokenId;
        uint256 supply;
        uint256 price;
        address merchant;
        address buyer;
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
    mapping(uint256 => bool) public isOrderRedeemed;
    mapping(uint256 => uint256) public reservedSupply;

    modifier onlyEscrow() {
        require(msg.sender == escrowAddress, "Only escrow can call");
        _;
    }

    // --- ADMIN ---
    function setEscrowAddress(address _escrow) external onlyOwner {
        escrowAddress = _escrow;
    }

    // --- MINTING ---
    function mintProductNft(
        uint256 supply,
        uint256 _price,
        string calldata _name,
        string calldata _description,
        string calldata tokenURI
    ) public returns (uint256) {
        require(_price > 0, "Invalid price");
        require(supply > 0, "Invalid supply");

        uint256 tokenId = ++_nextProductId;
        _mint(msg.sender, tokenId, supply, "");
        _setURI(tokenId, tokenURI);
        merchantProducts[msg.sender].push(tokenId);
        mintedProduct[tokenId] = Product({
            name: _name,
            description: _description,
            merchant: msg.sender,
            price: _price
        });

        emit ProductMinted(tokenId, msg.sender, supply, _price, _name, _description, tokenURI);
        return tokenId;
    }

    function getMerchantProducts(address merchant) external view returns (uint256[] memory) {
        return merchantProducts[merchant];
    }

    // --- LISTING ---
    function listProduct(uint256 tokenId, uint256 pricePerUnit) external {
        require(mintedProduct[tokenId].merchant == msg.sender, "Not merchant");
        require(pricePerUnit > 0, "Invalid price");

        listedProduct[tokenId] = ListingProduct({merchant: msg.sender, price: pricePerUnit});
        listedProductTokens.push(tokenId);
        isProductListed[tokenId] = true;

        emit ProductListed(tokenId, msg.sender, pricePerUnit);
    }

    function cancelProductListing(uint256 tokenId) external {
        ListingProduct memory listing = listedProduct[tokenId];
        require(listing.merchant == msg.sender, "Not your product");

        delete listedProduct[tokenId];
        _removeProductFromList(tokenId);
        isProductListed[tokenId] = false;
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

    // --- VIEW LISTINGS ---
    function getAllListing() external view returns (ListingProduct[] memory, uint256[] memory) {
        uint256 count = listedProductTokens.length;
        ListingProduct[] memory listings = new ListingProduct[](count);
        uint256[] memory tokenIds = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 id = listedProductTokens[i];
            listings[i] = listedProduct[id];
            tokenIds[i] = id;
        }
        return (listings, tokenIds);
    }

    function getListedProduct(uint256 tokenId) external view returns (address merchant, uint256 price) {
        ListingProduct memory p = listedProduct[tokenId];
        return (p.merchant, p.price);
    }

    // --- ORDER MANAGEMENT (Escrow Only) ---
    function createOrder(uint256 tokenId, address buyer, uint256 supply) external onlyEscrow returns (uint256) {
        require(isProductListed[tokenId], "Not listed");
        ListingProduct memory listing = listedProduct[tokenId];
        address merchant = listing.merchant;

        require(balanceOf(merchant, tokenId) - reservedSupply[tokenId] >= supply, "Insufficient supply");

        reservedSupply[tokenId] += supply;
        uint256 totalPrice = listing.price * supply;
        uint256 orderId = ++_nextOrderId;

        orderListed[orderId] = Order({
            tokenId: tokenId,
            supply: supply,
            price: totalPrice,
            merchant: merchant,
            buyer: buyer
        });

        emit OrderCreated(orderId, tokenId, buyer, supply, totalPrice, merchant);
        return orderId;
    }

    function releaseOrder(uint256 orderId) external onlyEscrow {
        Order storage ord = orderListed[orderId];
        require(ord.buyer != address(0), "Invalid order");
        require(!isOrderRedeemed[orderId], "Already redeemed");

        reservedSupply[ord.tokenId] -= ord.supply;
        _safeTransferFrom(ord.merchant, ord.buyer, ord.tokenId, ord.supply, "");
        isOrderRedeemed[orderId] = true;

        emit OrderReleased(orderId);
    }

    function cancelOrder(uint256 orderId) external onlyEscrow {
        Order storage ord = orderListed[orderId];
        require(ord.buyer != address(0), "Invalid order");
        require(!isOrderRedeemed[orderId], "Already redeemed");

        reservedSupply[ord.tokenId] -= ord.supply;
        delete orderListed[orderId];

        emit OrderCancelled(orderId);
    }

    // --- ERC1155 OVERRIDES ---
    function uri(uint256 tokenId)
        public
        view
        override(ERC1155URIStorage)
        returns (string memory)
    {
        return super.uri(tokenId);
    }

    // ✅ FIXED override clause
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
