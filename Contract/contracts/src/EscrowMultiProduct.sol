// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IMultiProduct} from "../interfaces/IMultiProduct.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EscrowMultiProduct
 * @notice Escrow for MultiProduct marketplace, holding buyer payments securely until release/refund.
 */

contract EscrowMultiProduct is ReentrancyGuard, Ownable {
    IMultiProduct public multiProduct;
    address public admin;

    constructor(address _multiProduct) Ownable(msg.sender) {
        admin = msg.sender;
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
    }

    mapping(uint256 => TraceNft) public details;
    mapping(uint256 => bool) public isFunded;
    mapping(uint256 => bool) public isReleased;
    mapping(uint256 => bool) public isRefunded;
    mapping(address => uint256) public merchantAmount;

    event EscrowFunded(uint256 indexed orderId, uint256 indexed tokenId, address indexed buyer, address merchant, uint256 totalPrice, uint256 supply);
    event FundReleased(uint256 indexed orderId, address buyer, address merchant, uint256 totalPrice);
    event FundRefunded(uint256 indexed orderId, address buyer, address merchant, uint256 totalPrice);
    event EmergencyWithdrawal(address indexed owner, uint256 amount);

    function fundEscrow(uint256 tokenId, uint256 supply) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "Provide valid amount");
        require(supply >= 1, "Invalid supply");
        require(multiProduct.isProductListed(tokenId), "Not listed");

        (address merchant, uint256 pricePerUnit) = multiProduct.getListedProduct(tokenId);
        require(merchant != address(0), "Invalid merchant");

        uint256 totalPrice = pricePerUnit * supply;
        require(msg.value == totalPrice, "Incorrect payment");

        uint256 orderId = multiProduct.createOrder(tokenId, msg.sender, supply);

        details[orderId] = TraceNft({
            buyer: msg.sender,
            merchant: merchant,
            totalPrice: totalPrice,
            supply: supply,
            tokenId: tokenId,
            orderId: orderId
        });

        amountHeld += totalPrice;
        merchantAmount[merchant] += totalPrice;

        isFunded[orderId] = true;
        isReleased[orderId] = false;
        isRefunded[orderId] = false;

        emit EscrowFunded(orderId, tokenId, msg.sender, merchant, totalPrice, supply);
        return orderId;
    }

    function releaseFundToMerchant(uint256 orderId) external nonReentrant {
        require(isFunded[orderId], "Not funded");
        require(!isReleased[orderId], "Already released");
        require(!isRefunded[orderId], "Already refunded");

        TraceNft memory t = details[orderId];
        require(msg.sender == t.buyer, "Only buyer can release");

        multiProduct.releaseOrder(orderId);

        uint256 amount = t.totalPrice;
        address merchant = t.merchant;

        require(merchantAmount[merchant] >= amount, "Insufficient merchant balance");

        merchantAmount[merchant] -= amount;
        amountHeld -= amount;

        (bool sent, ) = payable(merchant).call{value: amount}("");
        require(sent, "ETH transfer failed");

        isReleased[orderId] = true;
        isFunded[orderId] = false;

        emit FundReleased(orderId, t.buyer, merchant, amount);
    }

    function refundToBuyer(uint256 orderId) external nonReentrant {
        require(isFunded[orderId], "Not funded");
        require(!isRefunded[orderId], "Already refunded");
        require(!isReleased[orderId], "Already released");

        TraceNft memory t = details[orderId];
        require(msg.sender == t.merchant, "Only merchant can refund");

        multiProduct.cancelOrder(orderId);

        uint256 amount = t.totalPrice;
        address merchant = t.merchant;

        require(merchantAmount[merchant] >= amount, "Insufficient merchant balance");

        merchantAmount[merchant] -= amount;
        amountHeld -= amount;

        (bool sent, ) = payable(t.buyer).call{value: amount}("");
        require(sent, "ETH refund failed");

        isRefunded[orderId] = true;
        isFunded[orderId] = false;

        emit FundRefunded(orderId, t.buyer, merchant, amount);
    }

    function emergencyWithdraw(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= address(this).balance, "Not enough balance");
        (bool sent, ) = payable(owner()).call{value: amount}("");
        require(sent, "Withdraw failed");
        emit EmergencyWithdrawal(owner(), amount);
    }

    function getOrderDetails(uint256 orderId) external view returns (TraceNft memory) {
        return details[orderId];
    }
}
