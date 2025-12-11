// Debug script to test contract response format
// Run this in browser console to see the exact structure

import { readContract } from "wagmi/actions";
import { config } from "@/config/config";
import ESCROW_ABI from "@/abis/escrowMultiProduct.json";

async function debugContractResponse(orderId: number) {
  const ESCROW_ADDRESS = import.meta.env.VITE_ESCROW_MULTI_PRODUCT_ADDRESS as `0x${string}`;

  console.log("🔍 Testing contract response for order:", orderId);
  console.log("📍 Escrow address:", ESCROW_ADDRESS);

  // Test 1: getOrderDetails
  try {
    console.log("\n=== Test 1: getOrderDetails ===");
    const result = await readContract(config, {
      address: ESCROW_ADDRESS,
      abi: ESCROW_ABI,
      functionName: "getOrderDetails",
      args: [BigInt(orderId)],
    });

    console.log("✅ Success!");
    console.log("Type:", typeof result);
    console.log("Constructor:", result?.constructor?.name);
    console.log("Is Array:", Array.isArray(result));
    console.log("Raw result:", result);
    
    if (result && typeof result === 'object') {
      console.log("Object keys:", Object.keys(result));
      console.log("Object values:", Object.values(result));
      
      // Try different access patterns
      console.log("\n--- Access Pattern Tests ---");
      console.log("result.buyer:", (result as any).buyer);
      console.log("result.merchant:", (result as any).merchant);
      console.log("result[0]:", (result as any)[0]);
      console.log("result[1]:", (result as any)[1]);
      console.log("result.result?.buyer:", (result as any).result?.buyer);
      console.log("result.result?.[0]:", (result as any).result?.[0]);
    }
  } catch (error: any) {
    console.error("❌ getOrderDetails failed:", error.message);
  }

  // Test 2: details mapping
  try {
    console.log("\n=== Test 2: details mapping ===");
    const result = await readContract(config, {
      address: ESCROW_ADDRESS,
      abi: ESCROW_ABI,
      functionName: "details",
      args: [BigInt(orderId)],
    });

    console.log("✅ Success!");
    console.log("Type:", typeof result);
    console.log("Constructor:", result?.constructor?.name);
    console.log("Is Array:", Array.isArray(result));
    console.log("Raw result:", result);
    
    if (result && typeof result === 'object') {
      console.log("Object keys:", Object.keys(result));
      console.log("Object values:", Object.values(result));
      
      console.log("\n--- Access Pattern Tests ---");
      console.log("result.buyer:", (result as any).buyer);
      console.log("result.merchant:", (result as any).merchant);
      console.log("result[0]:", (result as any)[0]);
      console.log("result[1]:", (result as any)[1]);
    }
  } catch (error: any) {
    console.error("❌ details mapping failed:", error.message);
  }

  // Test 3: encryptedDeliveries mapping
  try {
    console.log("\n=== Test 3: encryptedDeliveries mapping ===");
    const result = await readContract(config, {
      address: ESCROW_ADDRESS,
      abi: ESCROW_ABI,
      functionName: "encryptedDeliveries",
      args: [BigInt(orderId)],
    });

    console.log("✅ Success!");
    console.log("Type:", typeof result);
    console.log("Raw result:", result);
    
    if (result && typeof result === 'object') {
      console.log("Object keys:", Object.keys(result));
      console.log("\n--- Field Tests ---");
      console.log("encryptedAddress:", (result as any).encryptedAddress);
      console.log("addressCommitment:", (result as any).addressCommitment);
      console.log("dataToEncryptHash:", (result as any).dataToEncryptHash);
      console.log("isEncrypted:", (result as any).isEncrypted);
      console.log("Has encrypted data:", (result as any).encryptedAddress !== "0x");
    }
  } catch (error: any) {
    console.error("❌ encryptedDeliveries failed:", error.message);
  }

  console.log("\n✅ Debug complete!");
}

// Usage in browser console:
// import { debugContractResponse } from './debug-contract-response';
// await debugContractResponse(17);

export { debugContractResponse };