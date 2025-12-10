// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IOrderManager.sol";
import "../interfaces/IProductNFT.sol";

contract EscrowMultiProduct is ReentrancyGuard, Ownable {
    IProductNFT public productNFT;
    IOrderManager public orderManager;

    uint256 public amountHeld;

    struct TraceNft {
        address buyer;
        address merchant;
        uint256 totalPrice;
        uint256 supply;
        uint256 tokenId;
        uint256 orderId;
        IOrderManager.DeliveryStatus deliveryStatus;
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
    event DeliveryStatusUpdated(uint256 indexed orderId, IOrderManager.DeliveryStatus status);
    event DeliveryConfirmed(uint256 indexed orderId);

    constructor(address _orderManager, address _productNFT) Ownable(msg.sender) {
        require(_orderManager != address(0) && _productNFT != address(0), "Invalid addresses");
        orderManager = IOrderManager(_orderManager);
        productNFT = IProductNFT(_productNFT);
    }

    function fundEscrow(
        uint256 tokenId,
        uint256 supply,
        bytes32 deliveryPointHash
    ) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "No ETH");
        require(supply >= 1, "Invalid supply");
        require(productNFT.isProductListed(tokenId), "Not listed");

        (address merchant, uint256 pricePerUnit) = productNFT.getListedProduct(tokenId);
        require(merchant != address(0), "Invalid merchant");

        uint256 totalPrice = pricePerUnit * supply;
        require(msg.value == totalPrice, "Wrong amount");

        IProductNFT.Product memory product = productNFT.getProduct(tokenId);
        require(product.merchant == merchant, "Merchant mismatch");

        uint256 orderId = orderManager.createOrder(
            tokenId,
            msg.sender,
            supply,
            totalPrice,
            product.productType,
            deliveryPointHash,
            merchant
        );

        details[orderId] = TraceNft({
            buyer: msg.sender,
            merchant: merchant,
            totalPrice: totalPrice,
            supply: supply,
            tokenId: tokenId,
            orderId: orderId,
            deliveryStatus: IOrderManager.DeliveryStatus.Pending,
            isDelivered: false,
            deliveryUpdatedAt: 0,
            deliveryConfirmedAt: 0
        });

        productNFT.adjustReserved(tokenId, supply, true);

        amountHeld += totalPrice;
        merchantAmount[merchant] += totalPrice;
        isFunded[orderId] = true;

        emit EscrowFunded(orderId, tokenId, msg.sender, merchant, totalPrice, supply);

        // Auto-release for virtual or no delivery point
        if (
            product.productType == keccak256(abi.encodePacked("virtual")) ||
            deliveryPointHash == bytes32(0)
        ) {
            _releaseFunds(orderId);
        }

        return orderId;
    }

    function updateDelivery(uint256 orderId, IOrderManager.DeliveryStatus status) external nonReentrant {
        TraceNft storage t = details[orderId];
        require(isFunded[orderId], "Not funded");
        require(msg.sender == t.merchant, "Not merchant");

        IProductNFT.Product memory product = productNFT.getProduct(t.tokenId);
        require(product.productType == keccak256(abi.encodePacked("physical")), "Not physical");

        orderManager.updateStatus(orderId, status);
        t.deliveryStatus = status;
        t.deliveryUpdatedAt = block.timestamp;

        emit DeliveryStatusUpdated(orderId, status);
    }

    function confirmDelivery(uint256 orderId) external nonReentrant {
        TraceNft storage t = details[orderId];
        require(isFunded[orderId], "Not funded");
        require(msg.sender == t.buyer, "Not buyer");

        IProductNFT.Product memory product = productNFT.getProduct(t.tokenId);
        require(product.productType == keccak256(abi.encodePacked("physical")), "Not physical");
        require(t.deliveryStatus == IOrderManager.DeliveryStatus.InTransit, "Not in transit");

        orderManager.confirmDelivered(orderId);
        t.deliveryStatus = IOrderManager.DeliveryStatus.Delivered;
        t.isDelivered = true;
        t.deliveryConfirmedAt = block.timestamp;

        emit DeliveryConfirmed(orderId);
        _releaseFunds(orderId);
    }

    function releaseFundToMerchant(uint256 orderId) external nonReentrant {
        TraceNft storage t = details[orderId];
        require(isFunded[orderId], "Not funded");
        require(msg.sender == t.buyer, "Not buyer");

        IProductNFT.Product memory product = productNFT.getProduct(t.tokenId);
        require(product.productType == keccak256(abi.encodePacked("virtual")), "Use confirmDelivery");

        _releaseFunds(orderId);
    }

    function refundToBuyer(uint256 orderId) external nonReentrant {
        TraceNft storage t = details[orderId];
        require(isFunded[orderId], "Not funded");
        require(msg.sender == t.merchant, "Not merchant");
        require(!isRefunded[orderId], "Already refunded");

        orderManager.markCancelled(orderId);

        uint256 amount = t.totalPrice;
        merchantAmount[t.merchant] -= amount;
        amountHeld -= amount;

        productNFT.adjustReserved(t.tokenId, t.supply, false);

        (bool sent, ) = payable(t.buyer).call{value: amount}("");
        require(sent, "Refund failed");

        isRefunded[orderId] = true;
        isFunded[orderId] = false;

        emit FundRefunded(orderId, t.buyer, t.merchant, amount);
    }

    function _releaseFunds(uint256 orderId) internal {
        TraceNft storage t = details[orderId];
        require(!isReleased[orderId], "Already released");
        require(isFunded[orderId], "Not funded");

        productNFT.releaseFromMerchant(t.merchant, t.buyer, t.tokenId, t.supply, "");

        orderManager.markReleased(orderId);

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