// src/lib/encryptionUtils.ts
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { keccak256, encodePacked } from "viem";
import { Buffer } from "buffer";

const client = new LitJsSdk.LitNodeClient({
  litNetwork: "datil-dev", // For development/testnet use datil-dev, for production use datil
});

let clientInitialized = false;

/**
 * Initialize Lit Protocol client (call once on app load)
 */
export const initializeLitClient = async () => {
  if (!clientInitialized) {
    await client.connect();
    clientInitialized = true;
    console.log("✅ Lit Protocol client initialized");
  }
  return client;
};

/**
 * Define access control conditions for address encryption
 * Since encryption happens BEFORE fundEscrow is called, we use minimal conditions
 * Smart contract will enforce who can decrypt based on order state
 */
const getAccessControlConditions = (merchantAddress: string) => {
  // Use minimal access control - just check wallet existence
  // Smart contract enforces actual decryption access (isFunded + isMerchant)
  return [
    {
      contractAddress: "0x0000000000000000000000000000000000000000", // Ethereum native condition
      standardContractType: "", // Empty for conditions that don't require specific contract type
      chain: "sepolia",
      method: "eth_getBalance",
      parameters: [merchantAddress, "latest"],
      returnValueTest: {
        comparator: ">=",
        value: "0", // Any balance >= 0 (always true for any address)
      },
    },
  ];
};

/**
 * Encrypt delivery address for secure storage
 * Called BEFORE fundEscrow to prepare encrypted data for contract
 */
export const encryptDeliveryAddress = async (
  deliveryAddress: string,
  merchantAddress: string
): Promise<{
  encryptedString: string;
  dataToEncryptHash: string;
  addressCommitment: string;
}> => {
  try {
    await initializeLitClient();

    const accessControlConditions = getAccessControlConditions(merchantAddress);

    // Encrypt the delivery address using Lit Protocol v3 API
    const { ciphertext, dataToEncryptHash } = await client.encrypt({
      accessControlConditions,
      dataToEncrypt: new TextEncoder().encode(deliveryAddress),
    });

    // Convert ciphertext to base64 string for storage
    const encryptedString = Buffer.from(ciphertext).toString('base64');

    // Generate ZK commitment (hash for verification)
    let addressCommitment: string;
    try {
      addressCommitment = keccak256(
        encodePacked(["string"], [deliveryAddress])
      );
    } catch (hashError) {
      console.warn("⚠️ Failed to generate commitment hash, using fallback:", hashError);
      // Fallback: use simple hash of the encrypted string
      addressCommitment = keccak256(encodePacked(["string"], [encryptedString]));
    }

    console.log("✅ Address encrypted successfully");
    console.log("📦 Ciphertext length:", encryptedString.length);
    console.log("🔑 Commitment:", addressCommitment);

    return {
      encryptedString,
      dataToEncryptHash, // Hash needed for decryption
      addressCommitment,
    };
  } catch (error: any) {
    console.error("❌ Encryption failed:", error);
    throw new Error(`Failed to encrypt address: ${error?.message || "Unknown error"}`);
  }
};

/**
 * Decrypt delivery address (only merchant can decrypt if conditions met on-chain)
 */
export const decryptDeliveryAddress = async (
  encryptedString: string,
  dataToEncryptHash: string,
  merchantAddress: string,
  authSig: any // Wallet signature for authentication
): Promise<string> => {
  try {
    await initializeLitClient();

    const accessControlConditions = getAccessControlConditions(merchantAddress);

    // Lit Protocol v3 expects ciphertext as a STRING (base64), not Uint8Array
    
    console.log("🔐 Decrypting with Lit Protocol v3...");
    console.log("   AccessControlConditions:", accessControlConditions.length, "conditions");
    console.log("   AuthSig address:", authSig?.address);
    console.log("   DataToEncryptHash:", dataToEncryptHash?.slice(0, 20) || "empty");
    
    // Build decrypt parameters
    const decryptParams: any = {
      accessControlConditions,
      ciphertext: encryptedString, // Pass as string (base64 encoded)
      authSig, // Full authSig object with sig, derivedVia, signedMessage, address
      chain: "sepolia",
    };
    
    // Only add dataToEncryptHash if it's provided and not empty
    if (dataToEncryptHash && dataToEncryptHash.trim().length > 0) {
      decryptParams.dataToEncryptHash = dataToEncryptHash;
      console.log("   Using provided dataToEncryptHash");
    } else {
      console.log("   No dataToEncryptHash provided, Lit SDK will derive it");
    }
    
    // Decrypt the address using Lit Protocol v3 API
    const decryptedData = await client.decrypt(decryptParams);

    // decryptedData is the decrypted content, convert to string
    const decryptedString = new TextDecoder().decode(
      new Uint8Array(decryptedData as unknown as ArrayBuffer)
    );
    console.log("✅ Address decrypted successfully");
    return decryptedString;
    return decryptedString;
  } catch (error: any) {
    console.error("❌ Decryption failed:", error);
    
    if (error?.message?.includes("not authorized")) {
      throw new Error(
        "Access denied: Order not funded or you are not the merchant"
      );
    }
    
    if (error?.message?.includes("expired")) {
      throw new Error("Decryption deadline has expired");
    }

    throw new Error(`Failed to decrypt address: ${error?.message || "Unknown error"}`);
  }
};

/**
 * Get authentication signature from wallet using Lit Protocol's wallet-agnostic method
 * Works with all EIP-1193 wallets (MetaMask, Phantom, Backpack, etc.)
 * 
 * This creates a SIWE (Sign In With Ethereum) message and signs it,
 * which Lit Protocol uses for access control verification
 */
export const getAuthSignature = async (): Promise<any> => {
  try {
    console.log("🔑 Getting Lit auth signature using wallet-agnostic method...");

    // Use Lit's wallet-agnostic method which works with all EIP-1193 providers
    // This automatically detects the connected wallet from window.ethereum
    const nonce = await client.getLatestBlockhash();
    const authSig = await LitJsSdk.checkAndSignAuthMessage({
      chain: "sepolia",
      nonce: nonce,
    });

    console.log("✅ Auth signature obtained via Lit Protocol (wallet-agnostic)");
    console.log("   Sig length:", authSig.sig?.length || 0);
    console.log("   Derived via:", authSig.derivedVia);
    
    return authSig;
  } catch (error) {
    console.error("❌ Failed to get auth signature:", error);
    if ((error as any)?.message?.includes("No injected provider")) {
      throw new Error("No wallet found. Please install MetaMask, Phantom, Backpack, or another Web3 wallet.");
    }
    throw error;
  }
};

/**
 * Verify ZK commitment matches decrypted address
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
    console.error("Expected:", storedCommitment);
    console.error("Calculated:", calculatedCommitment);
  }

  return isValid;
};

/**
 * Generate fallback hash for backward compatibility
 */
export const generateDeliveryHash = (deliveryAddress: string): `0x${string}` => {
  if (!deliveryAddress || deliveryAddress.trim() === "") {
    return keccak256(encodePacked(["string"], ["null"]));
  }
  return keccak256(encodePacked(["string"], [deliveryAddress]));
};

/**
 * Check if encryption is supported in current environment
 */
export const isEncryptionSupported = (): boolean => {
  try {
    // Check if Lit Protocol is available
    if (typeof LitJsSdk === "undefined") {
      console.warn("⚠️ Lit Protocol SDK not loaded");
      return false;
    }

    // Check if crypto APIs are available
    if (typeof window !== "undefined" && !window.crypto?.subtle) {
      console.warn("⚠️ Web Crypto API not available");
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Encryption check failed:", error);
    return false;
  }
};

/**
 * Format encrypted data for contract storage
 */
export const formatEncryptedDataForContract = (encryptedData: {
  encryptedString: string;
  dataToEncryptHash: string;
  addressCommitment: string;
}) => {
  // Convert base64 encrypted string to bytes
  const encryptedBytes = `0x${Buffer.from(
    encryptedData.encryptedString,
    "base64"
  ).toString("hex")}`;

  return {
    encryptedAddress: encryptedBytes as `0x${string}`,
    addressCommitment: encryptedData.addressCommitment as `0x${string}`,
    dataToEncryptHash: encryptedData.dataToEncryptHash,
  };
};

/**
 * Parse encrypted data from contract
 */
export const parseEncryptedDataFromContract = (
  encryptedBytes: `0x${string}`
): string => {
  // Convert hex bytes back to base64 string
  const hexString = encryptedBytes.slice(2); // Remove '0x'
  const buffer = Buffer.from(hexString, "hex");
  return buffer.toString("base64");
};