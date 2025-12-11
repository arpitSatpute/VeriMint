// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IEscrowMultiProduct {
    enum DeliveryStatus { Pending, InTransit, Delivered, Failed }

    struct TraceNft {
        address buyer;
        address merchant;
        uint256 totalPrice;
        uint256 supply;
        uint256 tokenId;
        uint256 orderId;
        DeliveryStatus deliveryStatus;
        bool isDelivered;
        uint256 deliveryUpdatedAt;
        uint256 deliveryConfirmedAt;
    }

    // ✅ NEW: Encrypted delivery data structure
    struct EncryptedDeliveryData {
        bytes encryptedAddress;
        bytes32 addressCommitment;
        uint256 decryptionDeadline;
        bool merchantDecrypted;
        uint256 merchantDecryptedAt;
        bool isEncrypted;
    }

    // ✅ UPDATED: Enhanced fundEscrow with encryption support
    function fundEscrow(
        uint256 tokenId,
        uint256 supply,
        bytes32 deliveryPointHash,
        bytes calldata encryptedAddress,
        bytes32 addressCommitment,
        bool useEncryption
    ) external payable returns (uint256);

    // ✅ BACKWARD COMPATIBLE: Original fundEscrow signature
    function fundEscrow(
        uint256 tokenId,
        uint256 supply,
        bytes32 deliveryPointHash
    ) external payable returns (uint256);

    // ✅ NEW: Decryption management functions
    function requestAddressDecryption(uint256 orderId) external;
    
    function getEncryptedDeliveryData(uint256 orderId) 
        external 
        view 
        returns (
            bytes memory encryptedAddress,
            bytes32 addressCommitment,
            uint256 decryptionDeadline,
            bool canDecrypt
        );
    
    function isDecryptionExpired(uint256 orderId) 
        external 
        view 
        returns (bool expired);
    
    function getDecryptionLog(uint256 orderId) 
        external 
        view 
        returns (bool accessed, uint256 timestamp);

    // Original functions (unchanged)
    function updateDelivery(uint256 orderId, DeliveryStatus status) external;
    function confirmDelivery(uint256 orderId) external;
    function releaseFundToMerchant(uint256 orderId) external;
    function refundToBuyer(uint256 orderId) external;
    function getOrderDetails(uint256 orderId) external view returns (TraceNft memory);
}