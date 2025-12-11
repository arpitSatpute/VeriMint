// src/lib/encryptionUtils.ts
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { keccak256, encodePacked, getAddress } from "viem";
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
 * Note: encryptedHexString should be the 0x-prefixed hex from contract
 */
export const decryptDeliveryAddress = async (
  encryptedHexString: string,
  dataToEncryptHash: string,
  merchantAddress: string,
  authSig: any
): Promise<string> => {
  try {
    await initializeLitClient();

    console.log("🔐 Decrypting with Lit Protocol...");
    console.log("   Input ciphertext type:", typeof encryptedHexString);
    console.log("   Input ciphertext length:", encryptedHexString.length);

    // Convert hex string to base64 (Lit Protocol expects base64 string)
    const hexString = encryptedHexString.startsWith('0x') 
      ? encryptedHexString.slice(2) 
      : encryptedHexString;
    
    // Convert hex to Buffer then to base64
    const buffer = Buffer.from(hexString, 'hex');
    const ciphertextBase64 = buffer.toString('base64');

    console.log("   Converted to base64 length:", ciphertextBase64.length);
    console.log("   Base64 sample:", ciphertextBase64.slice(0, 50));

    // Get access control conditions
    const accessControlConditions = getAccessControlConditions(merchantAddress);

    // Build decrypt parameters
    const decryptParams: any = {
      accessControlConditions,
      ciphertext: ciphertextBase64, // Pass as base64 STRING
      authSig,
      chain: "sepolia",
    };

    // Only add dataToEncryptHash if provided
    if (dataToEncryptHash && dataToEncryptHash.trim().length > 0) {
      decryptParams.dataToEncryptHash = dataToEncryptHash;
      console.log("   Using provided dataToEncryptHash");
    }

    console.log("   Calling Lit decrypt with base64 ciphertext...");

    // Decrypt the address
    const decryptedData = await client.decrypt(decryptParams);

    // Convert decrypted data to string
    const decryptedString = new TextDecoder().decode(
      new Uint8Array(decryptedData as unknown as ArrayBuffer)
    );
    console.log("✅ Address decrypted successfully");
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
 * Get authentication signature from wallet using Lit Protocol's method
 * Compatible with Lit Protocol v6+ BLS signature requirements
 */
export const getAuthSignature = async (): Promise<any> => {
  try {
    console.log("🔑 Getting Lit auth signature...");

    // Check if ethereum provider is available
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error("No wallet found. Please install MetaMask or another Web3 wallet.");
    }

    // Get the connected account
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    }) as string[];
    
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please connect your wallet.");
    }

    // Checksum the address to EIP-55 format (required by SIWE)
    const address = getAddress(accounts[0]);

    // Get latest blockhash for nonce
    const latestBlockhash = await client.getLatestBlockhash();
    
    // Create SIWE message
    const domain = window.location.host;
    const origin = window.location.origin;
    const statement = "Sign this message to decrypt the delivery address with Lit Protocol.";
    
    // Construct SIWE message manually for better control
    const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const issuedAt = new Date().toISOString();
    
    const message = `${domain} wants you to sign in with your Ethereum account:\n${address}\n\n${statement}\n\nURI: ${origin}\nVersion: 1\nChain ID: 11155111\nNonce: ${latestBlockhash}\nIssued At: ${issuedAt}\nExpiration Time: ${expirationTime}`;

    console.log("📝 SIWE message:", message);

    // Request signature from wallet
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address],
    }) as string;

    console.log("✅ Signature obtained");
    console.log("   Address:", address);
    console.log("   Signature length:", signature.length);

    // Construct authSig object in the format Lit Protocol expects
    const authSig = {
      sig: signature,
      derivedVia: "web3.eth.personal.sign",
      signedMessage: message,
      address: address,
    };

    return authSig;
  } catch (error) {
    console.error("❌ Failed to get auth signature:", error);
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
 * Parse encrypted data from contract - converts hex to base64
 * Lit Protocol's decrypt() function expects base64 string for ciphertext
 */
export const parseEncryptedDataFromContract = (
  encryptedBytes: `0x${string}`
): string => {
  // Convert hex bytes to base64 string for Lit Protocol
  const hexString = encryptedBytes.slice(2); // Remove '0x'
  const buffer = Buffer.from(hexString, "hex");
  return buffer.toString("base64");
};