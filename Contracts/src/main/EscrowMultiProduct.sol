// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IMultiProduct} from "../interfaces/IMultiProduct.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract EscrowMultiProduct is ReentrancyGuard, Ownable {
    IMultiProduct public multiProduct;

    enum DeliveryStatus { Pending, InTransit, Delivered, Failed }

    constructor(address _multiProduct) Ownable(msg.sender) {
        multiProduct = IMultiProduct(_multiProduct);
    }

    uint256 public amountHeld;

    struct TraceNft {
        address buyer;
        address merchant;
        uint256 totalPrice;
        uint256 supply;
        uint256 tokenId;
        uint256 orderId;
        string productType;
        string deliveryPointHash;
        DeliveryStatus deliveryStatus;
        bool isDelivered;
        uint256 deliveryUpdatedAt;
        uint256 deliveryConfirmedAt;
    }

    mapping(uint256 => TraceNft) public details;
    mapping(uint256 => bool) public isFunded;
    mapping(uint256 => bool) public isReleased;
    mapping(uint256 => bool) public isRefunded;
    mapping(address => uint256) public merchantAmount;

    event EscrowFunded(uint256 indexed orderId, uint256 indexed tokenId, address indexed buyer, address merchant, uint256 totalPrice, uint256 supply);
    event FundReleased(uint256 indexed orderId, address buyer, address merchant, uint256 totalPrice);
    event FundRefunded(uint256 indexed orderId, address buyer, address merchant, uint256 totalPrice);
    event DeliveryStatusUpdated(uint256 indexed orderId, DeliveryStatus status);
    event DeliveryConfirmed(uint256 indexed orderId);

    function fundEscrow(uint256 tokenId, uint256 supply, string calldata deliveryPointHash) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "No ETH");
        require(supply >= 1, "Invalid supply");
        require(multiProduct.isProductListed(tokenId), "Not listed");

        (address merchant, uint256 pricePerUnit) = multiProduct.getListedProduct(tokenId);
        require(merchant != address(0), "Invalid merchant");

        uint256 totalPrice = pricePerUnit * supply;
        require(msg.value == totalPrice, "Wrong amount");

        uint256 orderId = multiProduct.createOrder(tokenId, msg.sender, supply, deliveryPointHash);
        string memory productType = multiProduct.mintedProduct(tokenId).productType;

        details[orderId] = TraceNft({
            buyer: msg.sender,
            merchant: merchant,
            totalPrice: totalPrice,
            supply: supply,
            tokenId: tokenId,
            orderId: orderId,
            productType: productType,
            deliveryPointHash: deliveryPointHash,
            deliveryStatus: DeliveryStatus.Pending,
            isDelivered: false,
            deliveryUpdatedAt: 0,
            deliveryConfirmedAt: 0
        });

        amountHeld += totalPrice;
        merchantAmount[merchant] += totalPrice;
        isFunded[orderId] = true;

        emit EscrowFunded(orderId, tokenId, msg.sender, merchant, totalPrice, supply);

        if (keccak256(bytes(productType)) == keccak256(bytes("virtual"))) {
            _releaseFunds(orderId);
        }

        return orderId;
    }

    function updateDelivery(uint256 orderId, DeliveryStatus status) external nonReentrant {
        TraceNft storage t = details[orderId];
        require(isFunded[orderId], "Not funded");
        require(msg.sender == t.merchant, "Not merchant");
        require(keccak256(bytes(t.productType)) == keccak256(bytes("physical")), "Not physical");

        multiProduct.updateDeliveryStatus(orderId, uint8(status));
        t.deliveryStatus = status;
        t.deliveryUpdatedAt = block.timestamp;

        emit DeliveryStatusUpdated(orderId, status);
    }

    function confirmDelivery(uint256 orderId) external nonReentrant {
        TraceNft storage t = details[orderId];
        require(isFunded[orderId], "Not funded");
        require(msg.sender == t.buyer, "Not buyer");
        require(keccak256(bytes(t.productType)) == keccak256(bytes("physical")), "Not physical");
        require(t.deliveryStatus == DeliveryStatus.InTransit, "Not in transit");

        multiProduct.confirmDelivery(orderId);
        t.deliveryStatus = DeliveryStatus.Delivered;
        t.isDelivered = true;
        t.deliveryConfirmedAt = block.timestamp;

        emit DeliveryConfirmed(orderId);
        _releaseFunds(orderId);
    }

    function releaseFundToMerchant(uint256 orderId) external nonReentrant {
        TraceNft storage t = details[orderId];
        require(isFunded[orderId], "Not funded");
        require(msg.sender == t.buyer, "Not buyer");
        require(keccak256(bytes(t.productType)) == keccak256(bytes("virtual")), "Use confirmDelivery");

        _releaseFunds(orderId);
    }

    function refundToBuyer(uint256 orderId) external nonReentrant {
        TraceNft storage t = details[orderId];
        require(isFunded[orderId], "Not funded");
        require(msg.sender == t.merchant, "Not merchant");
        require(!isRefunded[orderId], "Refunded");

        multiProduct.cancelOrder(orderId);
        uint256 amount = t.totalPrice;

        merchantAmount[t.merchant] -= amount;
        amountHeld -= amount;
        (bool sent, ) = payable(t.buyer).call{value: amount}("");
        require(sent, "Refund failed");

        isRefunded[orderId] = true;
        isFunded[orderId] = false;

        emit FundRefunded(orderId, t.buyer, t.merchant, amount);
    }

    function _releaseFunds(uint256 orderId) internal {
        TraceNft storage t = details[orderId];
        require(!isReleased[orderId], "Released");

        multiProduct.releaseOrder(orderId);
        uint256 amount = t.totalPrice;

        merchantAmount[t.merchant] -= amount;
        amountHeld -= amount;
        (bool sent, ) = payable(t.merchant).call{value: amount}("");
        require(sent, "Transfer failed");

        isReleased[orderId] = true;
        isFunded[orderId] = false;

        emit FundReleased(orderId, t.buyer, t.merchant, amount);
    }

    function emergencyWithdraw(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= address(this).balance, "Low balance");
        (bool sent, ) = payable(owner()).call{value: amount}("");
        require(sent, "Withdraw failed");
    }

    function getOrderDetails(uint256 orderId) external view returns (TraceNft memory) {
        return details[orderId];
    }
}