// src/lib/unifiedEncryption.ts
// Unified encryption system - uses Web3-native encryption directly

import {
  encryptDeliveryAddressWeb3,
  decryptDeliveryAddressWeb3,
  formatEncryptedDataForContractWeb3,
  isWeb3EncryptionSupported,
  getAuthSignature,
  verifyAddressCommitment
} from "./web3EncryptionUtils";

import { keccak256, encodePacked } from "viem";

/**
 * Encrypt delivery address using Web3-native encryption
 * Always uses symmetric key derivation (Lit Protocol not required)
 */
export async function encryptDeliveryAddressUnified(
  deliveryAddress: string,
  merchantAddress: string
): Promise<{
  encryptedString: string;
  dataToEncryptHash: string;
  addressCommitment: string;
  method: 'web3';
}> {
  const useMock = import.meta.env.VITE_USE_MOCK_DECRYPTION === 'true';
  
  if (useMock) {
    console.log("🧪 Mock encryption enabled");
    return {
      encryptedString: btoa(deliveryAddress), // Simple base64 for mock
      dataToEncryptHash: keccak256(encodePacked(["string"], [deliveryAddress])),
      addressCommitment: keccak256(encodePacked(["string"], [deliveryAddress])),
      method: 'web3'
    };
  }

  // Always use Web3-native encryption
  try {
    console.log("🔐 Using Web3-native encryption directly...");
    
    if (!isWeb3EncryptionSupported()) {
      throw new Error("Web3 encryption not supported in this browser");
    }

    const result = await encryptDeliveryAddressWeb3(
      deliveryAddress,
      merchantAddress
    );
    
    console.log("✅ Web3-native encryption successful");
    
    return {
      encryptedString: result.encryptedString,
      dataToEncryptHash: result.dataToEncryptHash,
      addressCommitment: result.addressCommitment,
      method: 'web3' as const
    };
  } catch (error: any) {
    console.error("❌ Encryption failed:", error);
    throw new Error(
      `Failed to encrypt address: ${error?.message || "Unknown error"}`
    );
  }
}

/**
 * Decrypt delivery address using Web3-native encryption
 */
export async function decryptDeliveryAddressUnified(
  encryptedHex: string,
  dataToEncryptHash: string,
  merchantAddress: string,
  authSig: any,
  method?: 'web3' // Always web3 in this version
): Promise<string> {
  const useMock = import.meta.env.VITE_USE_MOCK_DECRYPTION === 'true';
  
  if (useMock) {
    console.log("🧪 Mock decryption enabled");
    try {
      // Safe mock decryption: decode hex to UTF-8
      const hexString = encryptedHex.startsWith('0x') 
        ? encryptedHex.slice(2) 
        : encryptedHex;
      const bytes = Buffer.from(hexString, 'hex');
      const decoded = bytes.toString('utf-8');
      
      // If decoding fails or is empty, return mock address
      if (!decoded || decoded.trim() === "") {
        return "123 Mock Street, Test City, TC 12345";
      }
      return decoded;
    } catch (e) {
      console.warn("⚠️ Mock decoding failed, returning placeholder");
      return "123 Mock Street, Test City, TC 12345";
    }
  }

  // Always use Web3-native decryption
  try {
    console.log("🔓 Using Web3-native decryption...");

    // Convert hex to base64 for CryptoJS
    const hexString = encryptedHex.startsWith('0x') 
      ? encryptedHex.slice(2) 
      : encryptedHex;
    
    const base64String = Buffer.from(hexString, 'hex').toString('base64');

    console.log("📦 Decryption parameters:");
    console.log("   Encrypted data length:", hexString.length / 2, "bytes");
    console.log("   DataToEncryptHash:", dataToEncryptHash);
    console.log("   Merchant address:", merchantAddress);

    const result = await decryptDeliveryAddressWeb3(
      base64String,              // Encrypted data in base64
      "",                        // ephemeralPublicKey (unused in symmetric mode)
      dataToEncryptHash,
      merchantAddress,
      authSig
    );

    console.log("✅ Decryption successful");
    return result;
  } catch (error: any) {
    console.error("❌ Decryption failed:", error);
    throw new Error(
      `Failed to decrypt: ${error?.message || "Unknown error"}`
    );
  }
}

/**
 * Format encrypted data for contract (Web3 only)
 */
export function formatEncryptedDataForContractUnified(
  encryptedData: {
    encryptedString: string;
    dataToEncryptHash: string;
    addressCommitment: string;
    method: 'web3';
  }
) {
  return formatEncryptedDataForContractWeb3({
    ...encryptedData,
    ephemeralPublicKey: "" // Not used in symmetric mode
  });
}

// Re-export utilities
export { getAuthSignature, verifyAddressCommitment };

/**
 * Generate delivery hash
 */
export const generateDeliveryHash = (deliveryAddress: string): `0x${string}` => {
  if (!deliveryAddress || deliveryAddress.trim() === "") {
    return keccak256(encodePacked(["string"], ["null"]));
  }
  return keccak256(encodePacked(["string"], [deliveryAddress]));
};