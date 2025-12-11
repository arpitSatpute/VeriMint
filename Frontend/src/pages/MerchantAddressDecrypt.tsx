import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Unlock, Eye, EyeOff, AlertTriangle, Clock, CheckCircle, Loader2 } from "lucide-react";
import { readContract, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { config } from "@/config/config";
import { useAccount } from "wagmi";
import {
  decryptDeliveryAddress,
  getAuthSignature,
  verifyAddressCommitment,
  parseEncryptedDataFromContract,
} from "@/lib/encryptionUtils";
import ESCROW_ABI from "@/abis/escrowMultiProduct.json";

interface MerchantAddressDecryptProps {
  orderId: string;
}

export default function MerchantAddressDecrypt({ orderId }: MerchantAddressDecryptProps) {
  const { address } = useAccount();
  const [loading, setLoading] = useState(true);
  const [decrypting, setDecrypting] = useState(false);
  const [hasEncryptedData, setHasEncryptedData] = useState(false);
  const [canDecrypt, setCanDecrypt] = useState(false);
  const [decryptedAddress, setDecryptedAddress] = useState<string | null>(null);
  const [showAddress, setShowAddress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decryptionLog, setDecryptionLog] = useState<{
    accessed: boolean;
    timestamp: number;
  } | null>(null);
  const [deadline, setDeadline] = useState<number>(0);

  const ESCROW_ADDRESS = import.meta.env.VITE_ESCROW_MULTI_PRODUCT_ADDRESS as `0x${string}`;

  useEffect(() => {
    loadEncryptedData();
  }, [orderId, address]);

  const loadEncryptedData = async () => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Loading encrypted data for order:", orderId);

      // Try to get order details with multiple fallback patterns
      let buyerAddress: string | undefined;
      let merchantAddress: string | undefined;
      let orderDetailsRaw: any;

      // Method 1: Try getOrderDetails first
      try {
        orderDetailsRaw = await readContract(config, {
          address: ESCROW_ADDRESS,
          abi: ESCROW_ABI,
          functionName: "getOrderDetails",
          args: [BigInt(orderId)],
        });

        console.log("📋 getOrderDetails response:", orderDetailsRaw);
        console.log("   Type:", typeof orderDetailsRaw);
        console.log("   Is Array:", Array.isArray(orderDetailsRaw));
        console.log("   Keys:", Object.keys(orderDetailsRaw || {}));

        // Try multiple access patterns
        // Pattern 1: Named fields
        if (orderDetailsRaw?.buyer && orderDetailsRaw?.merchant) {
          buyerAddress = orderDetailsRaw.buyer;
          merchantAddress = orderDetailsRaw.merchant;
          console.log("   ✓ Using named fields (buyer, merchant)");
        }
        // Pattern 2: Array indices
        else if (orderDetailsRaw?.[0] && orderDetailsRaw?.[1]) {
          buyerAddress = orderDetailsRaw[0];
          merchantAddress = orderDetailsRaw[1];
          console.log("   ✓ Using array indices [0], [1]");
        }
        // Pattern 3: Nested result
        else if (orderDetailsRaw?.result?.buyer && orderDetailsRaw?.result?.merchant) {
          buyerAddress = orderDetailsRaw.result.buyer;
          merchantAddress = orderDetailsRaw.result.merchant;
          console.log("   ✓ Using nested result.buyer, result.merchant");
        }
        // Pattern 4: Array destructuring
        else if (Array.isArray(orderDetailsRaw) && orderDetailsRaw.length >= 2) {
          [buyerAddress, merchantAddress] = orderDetailsRaw;
          console.log("   ✓ Using array destructuring");
        }
      } catch (getDetailsError: any) {
        console.warn("⚠️ getOrderDetails failed, trying direct mapping access:", getDetailsError.message);
      }

      // Method 2: Fallback to direct mapping access if above methods failed
      if (!buyerAddress || !merchantAddress) {
        console.log("🔄 Trying direct mapping access: details[orderId]");
        try {
          const detailsRaw = await readContract(config, {
            address: ESCROW_ADDRESS,
            abi: ESCROW_ABI,
            functionName: "details",
            args: [BigInt(orderId)],
          });

          console.log("📋 details mapping response:", detailsRaw);
          
          if (detailsRaw) {
            buyerAddress = (detailsRaw as any).buyer || (detailsRaw as any)[0];
            merchantAddress = (detailsRaw as any).merchant || (detailsRaw as any)[1];
            console.log("   ✓ Extracted from details mapping");
          }
        } catch (detailsError) {
          console.warn("⚠️ details mapping also failed:", detailsError);
        }
      }

      // Final validation
      console.log("🔍 Final extracted addresses:");
      console.log("   Buyer:", buyerAddress);
      console.log("   Merchant:", merchantAddress);

      if (!merchantAddress || !buyerAddress) {
        console.error("❌ Could not extract addresses from any method");
        console.error("   Raw response was:", orderDetailsRaw);
        throw new Error(
          "Could not retrieve valid order details. Order may not exist or contract ABI may be incompatible."
        );
      }

      // Check for null/zero addresses (uninitialized order)
      const zeroAddress = "0x0000000000000000000000000000000000000000";
      if (
        merchantAddress.toLowerCase() === zeroAddress.toLowerCase() ||
        buyerAddress.toLowerCase() === zeroAddress.toLowerCase()
      ) {
        throw new Error("Order exists but has not been initialized. Please fund the escrow first.");
      }

      // Check authorization
      const normalizedCurrent = address.toLowerCase();
      const normalizedMerchant = String(merchantAddress).toLowerCase();
      const normalizedBuyer = String(buyerAddress).toLowerCase();

      const isMerchant = normalizedCurrent === normalizedMerchant;
      const isBuyer = normalizedCurrent === normalizedBuyer;
      const isAuthorized = isMerchant || isBuyer;

      console.log("✓ Authorization check:");
      console.log("   Your address:", normalizedCurrent);
      console.log("   Merchant:", normalizedMerchant);
      console.log("   Buyer:", normalizedBuyer);
      console.log("   Is merchant:", isMerchant);
      console.log("   Is buyer:", isBuyer);
      console.log("   Is authorized:", isAuthorized);

      if (!isAuthorized) {
        throw new Error(
          `Not authorized to view this delivery address. You must be either the buyer or merchant of this order.`
        );
      }

      // Get encrypted delivery data
      console.log("📦 Fetching encrypted delivery data...");
      const encryptedData = await readContract(config, {
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "getEncryptedDeliveryData",
        args: [BigInt(orderId)],
        account: address,
      }) as [string, string, string, bigint, boolean];

      const [encryptedAddress, addressCommitment, dataToEncryptHash, decryptionDeadline, canDecryptNow] = encryptedData;

      console.log("✓ Encrypted data retrieved:");
      console.log("  Encrypted address hex length:", encryptedAddress.length);
      console.log("  Has encrypted data:", encryptedAddress !== "0x");
      console.log("  Can decrypt now:", canDecryptNow);

      if (encryptedAddress && encryptedAddress !== "0x") {
        setHasEncryptedData(true);
        setCanDecrypt(canDecryptNow);
        setDeadline(Number(decryptionDeadline));
      } else {
        setError("No encrypted delivery data found for this order");
        setHasEncryptedData(false);
        return;
      }

      // Get decryption log
      try {
        const log = await readContract(config, {
          address: ESCROW_ADDRESS,
          abi: ESCROW_ABI,
          functionName: "getDecryptionLog",
          args: [BigInt(orderId)],
          account: address,
        }) as [boolean, bigint];

        setDecryptionLog({
          accessed: log[0],
          timestamp: Number(log[1]),
        });
      } catch (logError) {
        console.warn("Could not fetch decryption log:", logError);
      }

    } catch (error: any) {
      console.error("❌ Failed to load encrypted data:", error);
      console.error("   Full error details:", {
        message: error.message,
        cause: error.cause,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      });
      
      let errorMessage = "Failed to load encrypted data";
      
      if (error.message?.includes("Could not retrieve valid order details")) {
        errorMessage = `Order #${orderId} does not exist or has not been initialized. Please check the order ID.`;
      } else if (error.message?.includes("not been initialized")) {
        errorMessage = "Order exists but has not been funded yet. Please fund the escrow first.";
      } else if (error.message?.includes("Not authorized")) {
        errorMessage = "You are not authorized to view this delivery address. Only the buyer or merchant can access it.";
      } else if (error.message?.includes("No encrypted data")) {
        errorMessage = "No encrypted delivery address found for this order.";
      } else if (error.message?.includes("ABI")) {
        errorMessage = "Contract ABI mismatch. Please ensure you're using the latest contract version.";
      } else if (error.message?.includes("execution reverted")) {
        errorMessage = `Contract rejected the request. Order #${orderId} may not exist.`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setHasEncryptedData(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    setDecrypting(true);
    setError(null);

    try {
      // ✅ DEVELOPMENT MODE: Check for mock decryption flag
      const USE_MOCK_DECRYPTION = import.meta.env.VITE_USE_MOCK_DECRYPTION === 'true';

      if (USE_MOCK_DECRYPTION) {
        console.log("🧪 Using MOCK decryption mode");
        
        // Step 1: Still log access on-chain for testing
        try {
          console.log("📝 Logging access on-chain...");
          const requestTx = await writeContract(config, {
            address: ESCROW_ADDRESS,
            abi: ESCROW_ABI,
            functionName: "requestAddressDecryption",
            args: [BigInt(orderId)],
            gas: 200000n,
          });
          await waitForTransactionReceipt(config, { hash: requestTx });
          console.log("✅ Access logged on-chain");
        } catch (logError) {
          console.warn("⚠️ Could not log on-chain (skipping in mock mode):", logError);
        }

        // Step 2: Use mock decryption
        const mockDecryptDeliveryAddress = async (orderId: string, userAddress: string) => {
          return `123 Mock Street, Test City, TC 12345 (Order ${orderId}, User: ${userAddress.slice(0, 6)}...)`;
        };
        const decrypted = await mockDecryptDeliveryAddress(orderId, address);
        
        console.log("✅ Mock decryption complete");
        setDecryptedAddress(decrypted);
        await loadEncryptedData();
        return;
      }

      // ✅ PRODUCTION MODE: Real Lit Protocol decryption
      console.log("🔐 Using REAL Lit Protocol decryption");

      // Step 1: Request decryption access on-chain (logs access)
      console.log("📝 Requesting decryption access on-chain...");
      const requestTx = await writeContract(config, {
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "requestAddressDecryption",
        args: [BigInt(orderId)],
        gas: 200000n,
      });

      await waitForTransactionReceipt(config, { hash: requestTx });
      console.log("✅ Access request logged on-chain");

      // Step 2: Get encrypted data from contract
      const encryptedData = await readContract(config, {
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "getEncryptedDeliveryData",
        args: [BigInt(orderId)],
        account: address,
      }) as [string, string, string, bigint, boolean];

      const [encryptedAddressHex, addressCommitment, dataToEncryptHash] = encryptedData;

      console.log("📦 Encrypted data retrieved from contract:");
      console.log("   Encrypted address (hex):", encryptedAddressHex.slice(0, 50) + "...");
      console.log("   Hex length:", encryptedAddressHex.length);
      console.log("   DataToEncryptHash:", dataToEncryptHash);
      console.log("   Address commitment:", addressCommitment);

      // Validate we have data
      if (!encryptedAddressHex || encryptedAddressHex === "0x" || encryptedAddressHex.length < 10) {
        throw new Error("No encrypted data found in contract. Order may not have encrypted address.");
      }

      // Step 3: Get authentication signature from wallet
      console.log("🔑 Getting authentication signature from wallet...");
      const authSig = await getAuthSignature();
      console.log("✅ Authentication signature obtained");

      // Step 4: Decrypt using Lit Protocol
      console.log("🔓 Decrypting address with Lit Protocol...");
      console.log("   Passing to decrypt:");
      console.log("   - encryptedHex:", encryptedAddressHex.slice(0, 50) + "...");
      console.log("   - dataToEncryptHash:", dataToEncryptHash);
      console.log("   - merchantAddress:", address);
      
      const decrypted = await decryptDeliveryAddress(
        encryptedAddressHex,     // Pass the hex string directly from contract
        dataToEncryptHash,        // Hash used during encryption
        address,                  // Current user address (merchant or buyer)
        authSig                   // Wallet signature
      );

      console.log("✅ Decryption completed");
      console.log("   Decrypted length:", decrypted.length);

      // Step 5: Verify commitment
      console.log("✓ Verifying address commitment...");
      const isValid = verifyAddressCommitment(decrypted, addressCommitment);

      if (!isValid) {
        throw new Error("Address verification failed! Decrypted data does not match commitment. Data may be corrupted.");
      }

      console.log("✅ Address decrypted and verified successfully");
      setDecryptedAddress(decrypted);
      
      // Reload to show access log
      await loadEncryptedData();

    } catch (error: any) {
      console.error("❌ Decryption failed:", error);
      console.error("   Full error object:", {
        message: error?.message,
        name: error?.name,
        cause: error?.cause,
        stack: error?.stack?.split('\n').slice(0, 5).join('\n')
      });
      
      let errorMessage = "Failed to decrypt address";
      
      if (error.message?.includes("not authorized")) {
        errorMessage = "Access denied: Order not funded or you are not the merchant";
      } else if (error.message?.includes("expired")) {
        errorMessage = "Decryption deadline has expired";
      } else if (error.message?.includes("Already decrypted")) {
        errorMessage = "You have already requested decryption for this order";
      } else if (error.message?.includes("InvalidParamType") || 
                 error.message?.includes("Ciphertext format error")) {
        errorMessage = error.message + "\n\n💡 Tip: Enable VITE_USE_MOCK_DECRYPTION=true in .env for testing without Lit Protocol";
      } else if (error.message?.includes("No encrypted data")) {
        errorMessage = "No encrypted delivery address found for this order";
      } else if (error.message?.includes("verification failed")) {
        errorMessage = "Decryption succeeded but verification failed. The data may have been tampered with.";
      } else if (error.message?.includes("User rejected")) {
        errorMessage = "Wallet signature was rejected. Please approve the signature request to decrypt.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setDecrypting(false);
    }
  };


  const formatTimestamp = (timestamp: number) => {
    if (timestamp === 0) return "Never";
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getTimeRemaining = () => {
    if (deadline === 0) return "No deadline";
    const now = Math.floor(Date.now() / 1000);
    if (now > deadline) return "Expired";
    
    const remaining = deadline - now;
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    
    return `${days}d ${hours}h remaining`;
  };

  if (loading) {
    return (
      <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl p-6">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
          <span className="text-white/60">Loading delivery information...</span>
        </div>
      </div>
    );
  }

  if (!hasEncryptedData) {
    return (
      <div className="space-y-4">
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-rose-300 mb-1">Access Denied</p>
                <p className="text-sm text-rose-400/80">{error}</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl p-6">
            <div className="flex items-center gap-3 text-white/50">
              <AlertTriangle className="w-5 h-5" />
              <span>No encrypted delivery data available for this order</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Encryption Status Card */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-lg">
            <Lock className="w-6 h-6 text-indigo-300" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-indigo-300 mb-2">
              🔐 Encrypted Delivery Address
            </h3>
            <p className="text-sm text-white/70 mb-4">
              The delivery address is encrypted with Lit Protocol. You can decrypt it once the order is funded.
            </p>

            {/* Status Indicators */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/[0.05] rounded-lg p-3">
                <div className="text-xs text-white/50 mb-1">Access Status</div>
                <div className="flex items-center gap-2">
                  {canDecrypt ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400 font-medium">Can Decrypt</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-amber-400 font-medium">Locked</span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white/[0.05] rounded-lg p-3">
                <div className="text-xs text-white/50 mb-1">Deadline</div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-400 font-medium">{getTimeRemaining()}</span>
                </div>
              </div>
            </div>

            {/* Decryption Log */}
            {decryptionLog?.accessed && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-amber-300 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">
                    Address accessed on {formatTimestamp(decryptionLog.timestamp)}
                  </span>
                </div>
              </div>
            )}

            {/* Decrypt Button or Address Display */}
            {!decryptedAddress ? (
              <motion.button
                whileHover={{ scale: canDecrypt && !decrypting ? 1.02 : 1 }}
                whileTap={{ scale: canDecrypt && !decrypting ? 0.98 : 1 }}
                onClick={handleDecrypt}
                disabled={!canDecrypt || decrypting}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/30 text-white font-semibold hover:from-indigo-500/30 hover:to-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {decrypting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Decrypting...
                  </>
                ) : (
                  <>
                    <Unlock className="w-5 h-5" />
                    Decrypt Delivery Address
                  </>
                )}
              </motion.button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70 font-medium">Decrypted Address:</span>
                  <button
                    onClick={() => setShowAddress(!showAddress)}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-all text-sm"
                  >
                    {showAddress ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Show
                      </>
                    )}
                  </button>
                </div>

                {showAddress && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white/[0.05] border border-white/[0.1] rounded-lg p-4"
                  >
                    <p className="text-white/90 leading-relaxed">{decryptedAddress}</p>
                  </motion.div>
                )}

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <div className="flex items-start gap-2 text-green-300 text-xs">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">✓ Address verified successfully</p>
                      <p className="text-green-400/70">
                        Decryption was logged on-chain
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-rose-300 mb-1">Decryption Failed</p>
              <p className="text-xs text-rose-400/80">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Security Notice */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-white/60">
            <p className="font-medium text-white/80 mb-1">Privacy & Security Notice</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>All decryption attempts are logged on-chain for transparency</li>
              <li>Delete the plaintext address after creating shipping label</li>
              <li>Never store decrypted addresses in unsecured databases</li>
              <li>Access expires after the delivery deadline</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}