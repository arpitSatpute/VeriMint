// Required imports for Lit Protocol v7+
// Add these to your encryptionUtils.ts

import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import { 
  LitAbility, 
  LitAccessControlConditionResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";
import { keccak256, encodePacked, getAddress } from "viem";
import { Buffer } from "buffer";

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
// ✅ Initialize client for Lit Protocol v7+
const client = new LitNodeClient({
  litNetwork: "datil-dev", // Use string literal instead of LitNetwork.DatilDev
  debug: true, // Enable debug logs
});

let clientInitialized = false;

export const initializeLitClient = async () => {
  if (!clientInitialized) {
    await client.connect();
    clientInitialized = true;
    console.log("✅ Lit Protocol v7 client initialized");
    console.log("   Network:", client.config.litNetwork);
  }
  return client;
};

/**
 * Access control conditions for v7+
 * Simpler format in newer versions
 */
const getAccessControlConditions = (merchantAddress: string) => {
  return [
    {
      contractAddress: "",
      standardContractType: "",
      chain: "sepolia",
      method: "eth_getBalance",
      parameters: [":userAddress", "latest"],
      returnValueTest: {
        comparator: ">=",
        value: "0",
      },
    },
  ];
};

/**
 * ✅ Encrypt delivery address - Lit Protocol v7+ format
 * v7 uses a different API: encryptString() instead of encrypt()
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

    console.log("🔐 Encrypting delivery address with Lit v7+...");
    console.log("   Data to encrypt:", deliveryAddress);
    console.log("   Merchant address:", merchantAddress);

    // ✅ Lit Protocol v7+ uses client.encrypt()
    const encryptResult = await client.encrypt({
      accessControlConditions,
      dataToEncrypt: new TextEncoder().encode(deliveryAddress),
    });

    console.log("📦 Encryption result:");
    console.log("   Type:", typeof encryptResult);
    console.log("   Keys:", Object.keys(encryptResult));

    // v7+ returns { ciphertext: string, dataToEncryptHash: string }
    const { ciphertext, dataToEncryptHash } = encryptResult;

    console.log("   Ciphertext length:", ciphertext.length);
    console.log("   DataToEncryptHash:", dataToEncryptHash);

    // In v7+, ciphertext is already a base64 string
    const encryptedString = ciphertext;

    // Generate ZK commitment
    const addressCommitment = keccak256(
      encodePacked(["string"], [deliveryAddress])
    );

    console.log("✅ Address encrypted successfully");
    console.log("🔑 Commitment:", addressCommitment);

    return {
      encryptedString,
      dataToEncryptHash,
      addressCommitment,
    };
  } catch (error: any) {
    console.error("❌ Encryption failed:", error);
    console.error("   Error details:", {
      message: error.message,
      name: error.name,
      code: error.code,
    });
    throw new Error(`Failed to encrypt address: ${error?.message || "Unknown error"}`);
  }
};

/**
 * ✅ Decrypt delivery address - Lit Protocol v7+ format
 * v7 uses decryptToString() instead of decrypt()
 */
export const decryptDeliveryAddress = async (
  encryptedHexFromContract: string,
  dataToEncryptHash: string,
  merchantAddress: string,
  authSig: any
): Promise<string> => {
  try {
    await initializeLitClient();

    const accessControlConditions = getAccessControlConditions(merchantAddress);

    console.log("🔐 Decrypting with Lit Protocol v7+...");
    console.log("   Merchant address:", merchantAddress);

    // Convert hex to base64
    const hexString = encryptedHexFromContract.startsWith('0x') 
      ? encryptedHexFromContract.slice(2) 
      : encryptedHexFromContract;
    
    const buffer = Buffer.from(hexString, "hex");
    const ciphertextBase64 = buffer.toString("base64");

    console.log("   Ciphertext analysis:");
    console.log("     Hex length:", encryptedHexFromContract.length);
    console.log("     Buffer length:", buffer.length, "bytes");
    console.log("     Base64 length:", ciphertextBase64.length);

    // Get session signatures (required for v7+)
    console.log("🔑 Getting session signatures...");
    const sessionSigs = await client.getSessionSigs({
      chain: "sepolia",
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
      resourceAbilityRequests: [
        {
          resource: new LitAccessControlConditionResource("*"),
          ability: "lit-action-execution" as any, // Use string literal for ability
        },
      ],
      authNeededCallback: async () => authSig,
    });

    console.log("✅ Session signatures obtained");

    // ✅ Lit Protocol v7+ uses client.decrypt()
    console.log("📡 Calling decrypt()...");
    const decryptResult = await client.decrypt({
      accessControlConditions,
      ciphertext: ciphertextBase64,
      dataToEncryptHash,
      sessionSigs,
      chain: "sepolia",
    });

    console.log("✅ Decryption successful");
    console.log("   Result type:", typeof decryptResult);
    
    // Decode the decrypted data from Uint8Array to string
    const decryptedString = new TextDecoder().decode(decryptResult.decryptedData);
    console.log("   Result length:", decryptedString.length);

    return decryptedString;

  } catch (error: any) {
    console.error("❌ Decryption failed:", error);
    console.error("   Error details:", {
      message: error.message,
      name: error.name,
      code: error.code,
      details: error.details,
    });

    // Enhanced error messages
    if (error.message?.includes("not authorized")) {
      throw new Error("Access denied: You are not authorized to decrypt this address");
    }
    if (error.message?.includes("expired")) {
      throw new Error("Decryption deadline has expired");
    }
    if (error.message?.includes("session")) {
      throw new Error("Failed to create session signatures. Please try reconnecting your wallet.");
    }
    if (error.message?.includes("48 bytes")) {
      const hexStr = encryptedHexFromContract.startsWith('0x') 
        ? encryptedHexFromContract.slice(2) 
        : encryptedHexFromContract;
      const bufferLength = Buffer.from(hexStr, "hex").length;
      throw new Error(
        "Ciphertext format mismatch. The data may have been encrypted with a different Lit Protocol version. " +
        `Got ${bufferLength} bytes. Try re-encrypting with the current version.`
      );
    }

    throw new Error(`Failed to decrypt: ${error.message}`);
  }
};

/**
 * ✅ Get authentication signature - v7+ compatible
 * v7+ uses a different SIWE format
 */
export const getAuthSignature = async (): Promise<any> => {
  try {
    console.log("🔑 Getting authentication signature for Lit v7+...");

    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error("No wallet found. Please install MetaMask or another Web3 wallet.");
    }

    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    }) as string[];
    
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please connect your wallet.");
    }

    const address = getAddress(accounts[0]);

    // Get latest blockhash for nonce
    const latestBlockhash = await client.getLatestBlockhash();
    
    // Create SIWE message for v7+
    const domain = window.location.host;
    const origin = window.location.origin;
    const statement = "Sign this message to decrypt the delivery address with Lit Protocol.";
    
    // v7+ requires this specific format
    const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const issuedAt = new Date().toISOString();
    
    const siweMessage = `${domain} wants you to sign in with your Ethereum account:
${address}

${statement}

URI: ${origin}
Version: 1
Chain ID: 11155111
Nonce: ${latestBlockhash}
Issued At: ${issuedAt}
Expiration Time: ${expirationTime}`;

    console.log("📝 SIWE message created");

    // Request signature
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [siweMessage, address],
    }) as string;

    console.log("✅ Signature obtained");

    // Return in Lit v7+ format
    const authSig = {
      sig: signature,
      derivedVia: "web3.eth.personal.sign",
      signedMessage: siweMessage,
      address: address,
    };

    return authSig;
  } catch (error) {
    console.error("❌ Failed to get auth signature:", error);
    throw error;
  }
};

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

export const generateDeliveryHash = (deliveryAddress: string): `0x${string}` => {
  if (!deliveryAddress || deliveryAddress.trim() === "") {
    return keccak256(encodePacked(["string"], ["null"]));
  }
  return keccak256(encodePacked(["string"], [deliveryAddress]));
};

export const isEncryptionSupported = (): boolean => {
  try {
    if (typeof LitJsSdk === "undefined") {
      console.warn("⚠️ Lit Protocol SDK not loaded");
      return false;
    }

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
 * In v7+, ciphertext is already base64, so we convert to hex
 */
export const formatEncryptedDataForContract = (encryptedData: {
  encryptedString: string;
  dataToEncryptHash: string;
  addressCommitment: string;
}) => {
  // encryptedString is base64 in v7+
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
 * Converts hex bytes back to base64 string for Lit Protocol v7+
 */
export const parseEncryptedDataFromContract = (
  encryptedBytes: `0x${string}`
): string => {
  const hexString = encryptedBytes.slice(2);
  const buffer = Buffer.from(hexString, "hex");
  return buffer.toString("base64");
};