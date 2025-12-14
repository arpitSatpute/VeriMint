import { keccak256, encodePacked, getAddress } from "viem";
import CryptoJS from "crypto-js";

/**
 * Web3-native encryption system using symmetric encryption
 * Derives a symmetric key from the merchant address for AES encryption
 * ⚠️ NOTE: This is a fallback encryption method suitable for testing only.
 * For production, use Lit Protocol which provides true end-to-end encryption.
 */

/**
 * Derive symmetric encryption key from merchant address
 * ⚠️ WARNING: This is NOT secure for production use!
 * The key is deterministic and derivable by anyone with the merchant address.
 * Use only as a fallback when Lit Protocol is unavailable.
 */
function deriveSymmetricKey(merchantAddress: string): string {
  const key = keccak256(
    encodePacked(["string"], [merchantAddress])
  );
  console.warn("⚠️ Using weak symmetric encryption key derived from merchant address. NOT suitable for production.");
  return key;
}

/**
 * Encrypt delivery address using symmetric key
 */
export async function encryptDeliveryAddressWeb3(
  deliveryAddress: string,
  merchantAddress: string
): Promise<{
  encryptedString: string;
  dataToEncryptHash: string;
  addressCommitment: string;
  ephemeralPublicKey: string;
}> {
  try {
    console.log("🔐 Encrypting with Web3-native (symmetric) encryption...");
    console.warn("⚠️ Using FALLBACK encryption - suitable for testing only, NOT production!");

    // Derive symmetric encryption key from merchant address
    const symmetricKey = deriveSymmetricKey(merchantAddress);
    
    // Encrypt the delivery address using AES-256
    const encrypted = CryptoJS.AES.encrypt(
      deliveryAddress,
      symmetricKey
    ).toString();
    
    // Generate commitment hash for verification
    const addressCommitment = keccak256(
      encodePacked(["string"], [deliveryAddress])
    );
    
    // Generate data hash for integrity check
    const dataToEncryptHash = keccak256(
      encodePacked(
        ["string", "bytes32"],
        [deliveryAddress, addressCommitment]
      )
    );

    console.log("✅ Web3 encryption complete");
    console.log("   Encrypted length:", encrypted.length);
    console.log("   Note: ephemeralPublicKey is empty (symmetric encryption)");

    return {
      encryptedString: encrypted,
      dataToEncryptHash,
      addressCommitment,
      ephemeralPublicKey: "" // Not used in symmetric mode
    };
  } catch (error: any) {
    console.error("❌ Web3 encryption failed:", error);
    throw new Error(`Failed to encrypt: ${error?.message || "Unknown error"}`);
  }
}

/**
 * Decrypt delivery address using symmetric key
 */
export async function decryptDeliveryAddressWeb3(
  encryptedData: string,
  ephemeralPublicKey: string, // Unused in symmetric mode
  dataToEncryptHash: string,
  merchantAddress: string,
  authSig: any // Wallet signature for authentication
): Promise<string> {
  try {
    console.log("🔓 Decrypting with Web3-native (symmetric) encryption...");

    // Verify the merchant is authorized (address must match)
    if (!authSig || authSig.address.toLowerCase() !== merchantAddress.toLowerCase()) {
      throw new Error("Unauthorized: Invalid authentication signature");
    }

    // Derive the same symmetric key from merchant address
    const symmetricKey = deriveSymmetricKey(merchantAddress);
    
    // Decrypt using AES-256
    const decryptedBytes = CryptoJS.AES.decrypt(
      encryptedData,
      symmetricKey
    );
    
    const decryptedAddress = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedAddress || decryptedAddress.trim() === "") {
      throw new Error("Decryption failed: Invalid key or corrupted data");
    }

    console.log("✅ Web3 decryption successful");
    
    return decryptedAddress;
  } catch (error: any) {
    console.error("❌ Web3 decryption failed:", error);
    throw new Error(`Failed to decrypt: ${error?.message || "Unknown error"}`);
  }
}

/**
 * Verify address commitment
 */
export const verifyAddressCommitment = (
  decryptedAddress: string,
  storedCommitment: string
): boolean => {
  const calculatedCommitment = keccak256(
    encodePacked(["string"], [decryptedAddress])
  );
  
  const isValid = calculatedCommitment.toLowerCase() === storedCommitment.toLowerCase();
  
  if (!isValid) {
    console.error("⚠️ Address commitment verification failed!");
  }

  return isValid;
};

/**
 * Format encrypted data for contract storage
 */
export const formatEncryptedDataForContractWeb3 = (encryptedData: {
  encryptedString: string;
  dataToEncryptHash: string;
  addressCommitment: string;
  ephemeralPublicKey: string;
}) => {
  // Convert base64 encrypted string to hex bytes
  const encryptedBytes = `0x${Buffer.from(
    encryptedData.encryptedString,
    "base64"
  ).toString("hex")}` as `0x${string}`;

  return {
    encryptedAddress: encryptedBytes,
    addressCommitment: encryptedData.addressCommitment as `0x${string}`,
    dataToEncryptHash: encryptedData.dataToEncryptHash,
    ephemeralPublicKey: encryptedData.ephemeralPublicKey
  };
};

/**
 * Get authentication signature
 */
export const getAuthSignature = async (): Promise<any> => {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error("No wallet found");
    }

    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    }) as string[];
    
    const address = getAddress(accounts[0]);
    const timestamp = Date.now();
    
    const message = `Sign to decrypt delivery address\nAddress: ${address}\nTimestamp: ${timestamp}`;
    
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address],
    }) as string;

    return {
      sig: signature,
      address: address,
      signedMessage: message,
      timestamp
    };
  } catch (error) {
    console.error("❌ Failed to get auth signature:", error);
    throw error;
  }
};

/**
 * Check if Web3 encryption is supported
 */
export const isWeb3EncryptionSupported = (): boolean => {
  try {
    return typeof window !== "undefined" && 
           typeof CryptoJS !== "undefined";
  } catch (error) {
    return false;
  }
};