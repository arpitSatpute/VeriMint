import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Unlock, Eye, EyeOff, AlertTriangle, Clock, CheckCircle, Loader2, MapPin } from "lucide-react";
import { readContract, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { config } from "@/config/config";
import { useAccount } from "wagmi";
import {
  decryptDeliveryAddressUnified as decryptDeliveryAddress,
  getAuthSignature,
  verifyAddressCommitment,
} from "@/lib/unifiedEncryption";
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
  const [showBlackScreen, setShowBlackScreen] = useState(false);

  const ESCROW_ADDRESS = import.meta.env.VITE_ESCROW_MULTI_PRODUCT_ADDRESS as `0x${string}`;

  // Screenshot prevention - black screen on Command/Windows key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Command (Mac) or Windows/Meta key
      if (e.metaKey || e.key === 'Meta' || e.key === 'OS') {
        setShowBlackScreen(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Remove black screen when key is released
      if (e.key === 'Meta' || e.key === 'OS' || !e.metaKey) {
        setShowBlackScreen(false);
      }
    };

    // Handle window blur (when user switches apps while holding key)
    const handleBlur = () => {
      setShowBlackScreen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Copy/Cut prevention for privacy
  useEffect(() => {
    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      console.log('📋 Copy attempt blocked for privacy');
    };

    const preventCut = (e: ClipboardEvent) => {
      e.preventDefault();
      console.log('✂️ Cut attempt blocked for privacy');
    };

    const preventDragStart = (e: DragEvent) => {
      e.preventDefault();
      console.log('🚫 Drag attempt blocked for privacy');
    };

    window.addEventListener('copy', preventCopy);
    window.addEventListener('cut', preventCut);
    window.addEventListener('dragstart', preventDragStart);

    return () => {
      window.removeEventListener('copy', preventCopy);
      window.removeEventListener('cut', preventCut);
      window.removeEventListener('dragstart', preventDragStart);
    };
  }, []);

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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8"
      >
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          <span className="text-white/60 text-lg">Loading delivery information...</span>
        </div>
      </motion.div>
    );
  }

  if (!hasEncryptedData) {
    return (
      <div className="space-y-4">
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/30 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0" />
              </div>
              <div>
                <p className="text-lg font-semibold text-rose-300 mb-2">Access Denied</p>
                <p className="text-sm md:text-base text-rose-400/80 leading-relaxed">{error}</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 text-white/50 justify-center py-4">
              <AlertTriangle className="w-5 h-5" />
              <span>No encrypted delivery data available for this order</span>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Encryption Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 md:p-8 hover:border-white/[0.12] transition-all"
      >
        <div className="flex items-start gap-4 md:gap-6">
          {/* Icon */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30"
          >
            <Lock className="w-7 h-7 text-indigo-300" />
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <motion.h3 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl font-bold mb-3"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
                🔐 Encrypted Delivery Address
              </span>
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm md:text-base text-white/70 mb-6 leading-relaxed"
            >
              The delivery address is encrypted with Lit Protocol. You can decrypt it once the order is funded.
            </motion.p>

            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.08] rounded-xl p-4 hover:border-white/[0.12] transition-all"
              >
                <div className="text-xs text-white/50 mb-2 font-semibold uppercase tracking-wider">Access Status</div>
                <div className="flex items-center gap-2">
                  {canDecrypt ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm md:text-base text-emerald-300 font-semibold">Can Decrypt</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 text-amber-400" />
                      <span className="text-sm md:text-base text-amber-300 font-semibold">Locked</span>
                    </>
                  )}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.08] rounded-xl p-4 hover:border-white/[0.12] transition-all"
              >
                <div className="text-xs text-white/50 mb-2 font-semibold uppercase tracking-wider">Deadline</div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-sm md:text-base text-blue-300 font-semibold">{getTimeRemaining()}</span>
                </div>
              </motion.div>
            </div>

            {/* Decryption Log */}
            {decryptionLog?.accessed && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-xl p-4 mb-6"
              >
                <div className="flex items-center gap-3 text-amber-300">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium text-sm md:text-base">
                    Address accessed on {formatTimestamp(decryptionLog.timestamp)}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Decrypt Button or Address Display */}
            {!decryptedAddress ? (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: canDecrypt && !decrypting ? 1.02 : 1 }}
                whileTap={{ scale: canDecrypt && !decrypting ? 0.98 : 1 }}
                onClick={handleDecrypt}
                disabled={!canDecrypt || decrypting}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/30 text-white font-semibold text-sm md:text-base hover:from-indigo-500/30 hover:to-purple-500/30 hover:border-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/10"
              >
                {decrypting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Decrypting with Lit Protocol...
                  </>
                ) : (
                  <>
                    <Unlock className="w-6 h-6" />
                    Decrypt Delivery Address
                  </>
                )}
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg md:text-xl text-white/90 font-bold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-400" />
                    Delivery Address
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddress(!showAddress)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] transition-all text-sm font-medium text-white/80"
                  >
                    {showAddress ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Hide Address
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Show Address
                      </>
                    )}
                  </motion.button>
                </div>

                {showAddress && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.15] rounded-xl p-6 shadow-xl"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg border border-indigo-500/30">
                          <MapPin className="w-6 h-6 text-indigo-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs md:text-sm font-semibold text-white/60 mb-3 uppercase tracking-wide">Shipping Address</h4>
                          <div className="text-base md:text-lg text-white/95 leading-relaxed font-medium whitespace-pre-wrap break-words select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none', msUserSelect: 'none' }}>
                            {decryptedAddress}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 pt-4 border-t border-white/[0.1]">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs md:text-sm font-medium text-rose-300/80">
                          <Lock className="w-4 h-4" />
                          Copy Disabled for Privacy
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 rounded-xl p-5"
                >
                  <div className="flex items-start gap-3 text-emerald-300">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <div className="text-sm md:text-base">
                      <p className="font-semibold mb-2">✓ Successfully Decrypted & Verified</p>
                      <p className="text-emerald-400/80 text-xs md:text-sm leading-relaxed">
                        Address authenticity verified via commitment hash. Decryption was logged on-chain for transparency.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3 text-amber-300">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="text-xs md:text-sm">
                      <p className="font-semibold mb-2">🔒 Security Reminder</p>
                      <p className="text-amber-400/70 leading-relaxed">
                        Delete this address from your records after creating the shipping label. Never store decrypted addresses in unsecured databases.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/30 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-500/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0" />
            </div>
            <div>
              <p className="text-base md:text-lg font-semibold text-rose-300 mb-2">Decryption Failed</p>
              <p className="text-sm text-rose-400/80 leading-relaxed">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Security Notice */}
      

      {/* Black Screen Overlay - Screenshot Prevention */}
      {showBlackScreen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh'
          }}
        >
          <div className="text-center text-white p-8">
            <Lock className="w-16 h-16 mx-auto mb-4 text-white/80" />
            <p className="text-2xl font-bold mb-2">Screen Protected</p>
            <p className="text-white/70">Release the key to continue viewing</p>
          </div>
        </div>
      )}
    </div>
  );
}