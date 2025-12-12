// src/lib/encryptionUtils.ts - Complete Fixed Version for Lit Protocol v7+

// ✅ Correct imports for Lit Protocol v7+
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_NETWORK, LIT_ABILITY } from "@lit-protocol/constants";
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
  litNetwork: 'datil-test', // Use enum - more stable than DatilDev
  debug: false,
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

    // ✅ Lit Protocol v7+ uses client.encrypt()
    const encryptResult = await client.encrypt({
      accessControlConditions,
      dataToEncrypt: new TextEncoder().encode(deliveryAddress),
    });

    console.log("📦 Encryption result:");
    console.log("   Ciphertext length:", encryptResult.ciphertext.length);
    console.log("   DataToEncryptHash:", encryptResult.dataToEncryptHash);

    // In v7+, ciphertext is already a base64 string
    const encryptedString = encryptResult.ciphertext;

    // Generate ZK commitment
    const addressCommitment = keccak256(
      encodePacked(["string"], [deliveryAddress])
    );

    console.log("✅ Address encrypted successfully");

    return {
      encryptedString,
      dataToEncryptHash: encryptResult.dataToEncryptHash,
      addressCommitment,
    };
  } catch (error: any) {
    console.error("❌ Encryption failed:", error);
    throw new Error(`Failed to encrypt address: ${error?.message || "Unknown error"}`);
  }
};

/**
 * ✅ Get session signatures with retry logic
 */
async function getSessionSigsWithRetry(
  authSig: any,
  maxRetries = 3
) {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔑 Getting session signatures (attempt ${attempt}/${maxRetries})...`);
      
      const sessionSigs = await client.getSessionSigs({
        chain: "sepolia",
        expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        resourceAbilityRequests: [],
        authNeededCallback: async () => {
          if (!authSig || !authSig.sig || !authSig.address) {
            throw new Error("Invalid auth signature");
          }
          return authSig;
        },
      });

      console.log("✅ Session signatures obtained");
      return sessionSigs;
      
    } catch (error: any) {
      lastError = error;
      console.warn(`⚠️ Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`⏳ Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
}

/**
 * ✅ Decrypt delivery address - Lit Protocol v7+ with retry
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
    console.log("   Network:", client.config.litNetwork);

    // Convert hex to base64
    const hexString = encryptedHexFromContract.startsWith('0x') 
      ? encryptedHexFromContract.slice(2) 
      : encryptedHexFromContract;
    
    const buffer = Buffer.from(hexString, "hex");
    const ciphertextBase64 = buffer.toString("base64");

    console.log("   Buffer length:", buffer.length, "bytes");

    // Get session signatures with retry
    const sessionSigs = await getSessionSigsWithRetry(authSig);

    // Decrypt
    console.log("📡 Calling decrypt()...");
    const decryptResult = await client.decrypt({
      accessControlConditions,
      ciphertext: ciphertextBase64,
      dataToEncryptHash,
      sessionSigs,
      chain: "sepolia",
    });

    console.log("✅ Decryption successful");
    
    // Decode the result
    const decryptedString = new TextDecoder().decode(decryptResult.decryptedData);

    return decryptedString;

  } catch (error: any) {
    console.error("❌ Decryption failed:", error);

    // Enhanced error messages
    if (error.message?.includes("not authorized")) {
      throw new Error("Access denied: You are not authorized to decrypt this address");
    }
    if (error.message?.includes("signing shares") || 
        error.message?.includes("NodeError") ||
        error.message?.includes("502") ||
        error.message?.includes("Bad Gateway")) {
      throw new Error(
        "🌐 Lit Protocol network is currently unavailable (502 Bad Gateway). " +
        "This is a temporary network issue. Please try again in a few minutes, or " +
        "enable VITE_USE_MOCK_DECRYPTION=true in your .env file for testing."
      );
    }
    if (error.message?.includes("session")) {
      throw new Error(
        "Failed to create session signatures. Possible causes: " +
        "(1) Lit Protocol nodes are down, " +
        "(2) Network connectivity issues. " +
        "Try again or enable mock mode (VITE_USE_MOCK_DECRYPTION=true)."
      );
    }

    throw new Error(`Failed to decrypt: ${error.message}`);
  }
};

/**
 * ✅ Get authentication signature
 */
export const getAuthSignature = async (): Promise<any> => {
  try {
    console.log("🔑 Getting authentication signature...");

    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error("No wallet found. Please install MetaMask.");
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
    
    // Create SIWE message
    const domain = window.location.host;
    const origin = window.location.origin;
    const statement = "Sign this message to decrypt the delivery address with Lit Protocol.";
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

    return {
      sig: signature,
      derivedVia: "web3.eth.personal.sign",
      signedMessage: siweMessage,
      address: address,
    };
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
    if (typeof LitNodeClient === "undefined") {
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
 */
export const formatEncryptedDataForContract = (encryptedData: {
  encryptedString: string;
  dataToEncryptHash: string;
  addressCommitment: string;
}) => {
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
  const hexString = encryptedBytes.slice(2);
  const buffer = Buffer.from(hexString, "hex");
  return buffer.toString("base64");
};