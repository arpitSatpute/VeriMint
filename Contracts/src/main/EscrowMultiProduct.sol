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

    // ✅ NEW: Enhanced delivery data structure
    struct EncryptedDeliveryData {
        bytes encryptedAddress;           // Lit Protocol encrypted address
        bytes32 addressCommitment;        // ZK proof commitment for verification
        string dataToEncryptHash;         // Lit SDK hash required for decryption
        uint256 decryptionDeadline;       // Time limit for decryption (7 days default)
        bool merchantDecrypted;           // Track if merchant accessed address
        uint256 merchantDecryptedAt;      // Timestamp of decryption
        bool isEncrypted;                 // Flag to check if using encryption
    }

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
    
    // ✅ NEW: Encrypted delivery data mapping
    mapping(uint256 => EncryptedDeliveryData) public encryptedDeliveries;

    event EscrowFunded(uint256 indexed orderId, uint256 indexed tokenId, address indexed buyer, address merchant, uint256 totalPrice, uint256 supply);
    event FundReleased(uint256 indexed orderId, address buyer, address merchant, uint256 totalPrice);
    event FundRefunded(uint256 indexed orderId, address buyer, address merchant, uint256 totalPrice);
    event DeliveryStatusUpdated(uint256 indexed orderId, IOrderManager.DeliveryStatus status);
    event DeliveryConfirmed(uint256 indexed orderId);
    
    // ✅ NEW: Security events
    event EncryptedAddressStored(uint256 indexed orderId, bytes32 addressCommitment, uint256 decryptionDeadline);
    event AddressDecryptionRequested(uint256 indexed orderId, address indexed merchant, uint256 timestamp);
    event DecryptionDeadlineExpired(uint256 indexed orderId);

    constructor(address _orderManager, address _productNFT) Ownable(msg.sender) {
        require(_orderManager != address(0) && _productNFT != address(0), "Invalid addresses");
        orderManager = IOrderManager(_orderManager);
        productNFT = IProductNFT(_productNFT);
    }

    /**
     * @notice Enhanced fundEscrow with optional encryption support
     * @param tokenId Product token ID
     * @param supply Quantity to purchase
     * @param deliveryPointHash Original hash (for backward compatibility)
     * @param encryptedAddress Lit Protocol encrypted delivery address (optional)
     * @param addressCommitment ZK proof commitment (optional)
     * @param dataToEncryptHash Hash returned by Lit SDK (needed for decryption)
     * @param useEncryption Flag to enable encryption features
     */
    function fundEscrow(
        uint256 tokenId,
        uint256 supply,
        bytes32 deliveryPointHash,
        bytes calldata encryptedAddress,
        bytes32 addressCommitment,
        string calldata dataToEncryptHash,
        bool useEncryption
    ) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "No ETH");
        require(supply >= 1, "Invalid supply");
        require(productNFT.isProductListed(tokenId), "Not listed");

        (address merchant, uint256 pricePerUnit) = productNFT.getListedProduct(tokenId);
        require(merchant != address(0), "Invalid merchant");
        require(msg.value == pricePerUnit * supply, "Wrong amount");
        require(productNFT.availableSupply(tokenId) >= supply, "Insufficient supply");

        IProductNFT.Product memory product = productNFT.getProduct(tokenId);
        require(product.merchant == merchant, "Merchant mismatch");

        productNFT.adjustReserved(tokenId, supply, true);

        uint256 orderId = orderManager.createOrder(
            tokenId,
            msg.sender,
            supply,
            msg.value,
            product.productType,
            deliveryPointHash,
            merchant
        );

        details[orderId] = TraceNft({
            buyer: msg.sender,
            merchant: merchant,
            totalPrice: msg.value,
            supply: supply,
            tokenId: tokenId,
            orderId: orderId,
            deliveryStatus: IOrderManager.DeliveryStatus.Pending,
            isDelivered: false,
            deliveryUpdatedAt: 0,
            deliveryConfirmedAt: 0
        });

        amountHeld += msg.value;
        merchantAmount[merchant] += msg.value;
        isFunded[orderId] = true;

        // Store encrypted delivery data if encryption is enabled
        if (useEncryption && encryptedAddress.length > 0) {
            _storeEncryptedDeliveryData(
                orderId,
                encryptedAddress,
                addressCommitment,
                dataToEncryptHash,
                product.productType
            );
        }

        emit EscrowFunded(orderId, tokenId, msg.sender, merchant, msg.value, supply);

        // Auto-unlist if sold out
        if (productNFT.availableSupply(tokenId) == 0) {
            productNFT.autoUnlist(tokenId);
        }

        // Auto-release for virtual products or no delivery
        if (
            product.productType == keccak256(abi.encodePacked("virtual")) ||
            deliveryPointHash == keccak256(abi.encodePacked("null"))
        ) {
            _releaseFunds(orderId);
        }

        return orderId;
    }

    /**
     * @notice Backward compatible fundEscrow without encryption
     * @dev Maintains original function signature for existing integrations
     */
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
        require(msg.value == pricePerUnit * supply, "Wrong amount");
        require(productNFT.availableSupply(tokenId) >= supply, "Insufficient supply");

        IProductNFT.Product memory product = productNFT.getProduct(tokenId);
        require(product.merchant == merchant, "Merchant mismatch");

        productNFT.adjustReserved(tokenId, supply, true);

        uint256 orderId = orderManager.createOrder(
            tokenId,
            msg.sender,
            supply,
            msg.value,
            product.productType,
            deliveryPointHash,
            merchant
        );

        details[orderId] = TraceNft({
            buyer: msg.sender,
            merchant: merchant,
            totalPrice: msg.value,
            supply: supply,
            tokenId: tokenId,
            orderId: orderId,
            deliveryStatus: IOrderManager.DeliveryStatus.Pending,
            isDelivered: false,
            deliveryUpdatedAt: 0,
            deliveryConfirmedAt: 0
        });

        amountHeld += msg.value;
        merchantAmount[merchant] += msg.value;
        isFunded[orderId] = true;

        emit EscrowFunded(orderId, tokenId, msg.sender, merchant, msg.value, supply);

        // Auto-unlist if sold out
        if (productNFT.availableSupply(tokenId) == 0) {
            productNFT.autoUnlist(tokenId);
        }

        // Auto-release for virtual products or no delivery
        if (
            product.productType == keccak256(abi.encodePacked("virtual")) ||
            deliveryPointHash == keccak256(abi.encodePacked("null"))
        ) {
            _releaseFunds(orderId);
        }

        return orderId;
    }

    /**
     * @notice Store encrypted delivery data with time-lock
     * @param orderId Order ID
     * @param encryptedAddress Lit Protocol encrypted address
     * @param addressCommitment ZK proof commitment
     * @param dataToEncryptHash Hash returned by Lit SDK (required for decrypt)
     * @param productType Type of product (physical/virtual)
     */
    function _storeEncryptedDeliveryData(
        uint256 orderId,
        bytes calldata encryptedAddress,
        bytes32 addressCommitment,
        string calldata dataToEncryptHash,
        bytes32 productType
    ) internal {
        require(encryptedAddress.length > 0, "Empty encrypted data");
        require(bytes(dataToEncryptHash).length > 0, "Empty dataToEncryptHash");
        
        // Set decryption deadline (7 days for physical products)
        uint256 deadline = productType == keccak256(abi.encodePacked("physical"))
            ? block.timestamp + 7 days
            : block.timestamp + 1 days;

        encryptedDeliveries[orderId] = EncryptedDeliveryData({
            encryptedAddress: encryptedAddress,
            addressCommitment: addressCommitment,
            dataToEncryptHash: dataToEncryptHash,
            decryptionDeadline: deadline,
            merchantDecrypted: false,
            merchantDecryptedAt: 0,
            isEncrypted: true
        });

        emit EncryptedAddressStored(orderId, addressCommitment, deadline);
    }

    /**
     * @notice Merchant requests address decryption (logged on-chain)
     * @param orderId Order ID
     */
    function requestAddressDecryption(uint256 orderId) 
        external 
        nonReentrant 
    {
        TraceNft storage t = details[orderId];
        EncryptedDeliveryData storage encrypted = encryptedDeliveries[orderId];
        
        require(isFunded[orderId], "Not funded");
        require(msg.sender == t.merchant, "Not merchant");
        require(encrypted.isEncrypted, "No encrypted data");
        require(!encrypted.merchantDecrypted, "Already decrypted");
        require(block.timestamp <= encrypted.decryptionDeadline, "Decryption expired");

        // Mark as decrypted (actual decryption happens off-chain via Lit Protocol)
        encrypted.merchantDecrypted = true;
        encrypted.merchantDecryptedAt = block.timestamp;

        emit AddressDecryptionRequested(orderId, msg.sender, block.timestamp);
    }

    /**
     * @notice Get encrypted delivery data for off-chain decryption
     * @param orderId Order ID
     * @return encryptedAddress Encrypted address bytes
     * @return addressCommitment ZK commitment
     * @return dataToEncryptHash Hash required by Lit for decryption
     * @return decryptionDeadline Time limit
     * @return canDecrypt Whether merchant can decrypt
     */
    function getEncryptedDeliveryData(uint256 orderId) 
        external 
        view 
        returns (
            bytes memory encryptedAddress,
            bytes32 addressCommitment,
            string memory dataToEncryptHash,
            uint256 decryptionDeadline,
            bool canDecrypt
        ) 
    {
        TraceNft storage t = details[orderId];
        EncryptedDeliveryData storage encrypted = encryptedDeliveries[orderId];
        
        require(encrypted.isEncrypted, "No encrypted data");
        
        // Only merchant or buyer can access
        require(
            msg.sender == t.merchant || msg.sender == t.buyer,
            "Not authorized"
        );

        bool canMerchantDecrypt = msg.sender == t.merchant 
            && isFunded[orderId] 
            && block.timestamp <= encrypted.decryptionDeadline;

        return (
            encrypted.encryptedAddress,
            encrypted.addressCommitment,
            encrypted.dataToEncryptHash,
            encrypted.decryptionDeadline,
            canMerchantDecrypt || msg.sender == t.buyer
        );
    }

    /**
     * @notice Check if decryption deadline has expired
     * @param orderId Order ID
     * @return expired Whether deadline has passed
     */
    function isDecryptionExpired(uint256 orderId) 
        external 
        view 
        returns (bool expired) 
    {
        EncryptedDeliveryData storage encrypted = encryptedDeliveries[orderId];
        
        if (!encrypted.isEncrypted) return false;
        
        return block.timestamp > encrypted.decryptionDeadline;
    }

    /**
     * @notice Get decryption access log
     * @param orderId Order ID
     * @return accessed Whether merchant accessed the address
     * @return timestamp When it was accessed (0 if not accessed)
     */
    function getDecryptionLog(uint256 orderId) 
        external 
        view 
        returns (bool accessed, uint256 timestamp) 
    {
        EncryptedDeliveryData storage encrypted = encryptedDeliveries[orderId];
        return (encrypted.merchantDecrypted, encrypted.merchantDecryptedAt);
    }

    // ========== ORIGINAL FUNCTIONS (UNCHANGED) ==========

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