// Frontend/src/components/MerchantAddressDecrypt.tsx

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

      console.log("🔍 Checking authorization for order:", orderId);
      console.log("📱 Connected wallet:", address);

      // First, verify this user is authorized (merchant or buyer)
      // Get order details to check merchant
      let orderDetailsRaw: any;
      try {
        orderDetailsRaw = await readContract(config, {
          address: ESCROW_ADDRESS,
          abi: ESCROW_ABI,
          functionName: "getOrderDetails",
          args: [BigInt(orderId)],
        });
        console.log("✅ Raw order details response:", orderDetailsRaw);
      } catch (detailsError: any) {
        console.error("Failed to fetch order details:", detailsError);
        throw new Error("Could not retrieve order details. Order may not exist.");
      }

      // The return is a tuple: [buyer, merchant, totalPrice, supply, tokenId, orderId, deliveryStatus, isDelivered, deliveryUpdatedAt, deliveryConfirmedAt]
      let buyerAddress = orderDetailsRaw?.[0];
      let merchantAddress = orderDetailsRaw?.[1];
      
      // Try alternative access methods
      if (!buyerAddress) buyerAddress = orderDetailsRaw?.buyer;
      if (!merchantAddress) merchantAddress = orderDetailsRaw?.merchant;

      console.log("📋 Extracted addresses:");
      console.log("   Buyer (index 0):", buyerAddress);
      console.log("   Merchant (index 1):", merchantAddress);
      console.log("   Type of buyer:", typeof buyerAddress);
      console.log("   Type of merchant:", typeof merchantAddress);

      if (!merchantAddress || !buyerAddress) {
        console.error("Invalid addresses:", { buyerAddress, merchantAddress });
        throw new Error("Could not retrieve valid order details (invalid addresses)");
      }

      // Normalize all addresses
      const normalizedCurrent = address.toLowerCase();
      const normalizedMerchant = String(merchantAddress).toLowerCase();
      const normalizedBuyer = String(buyerAddress).toLowerCase();

      console.log("📊 Normalized comparison:");
      console.log("   Connected:", normalizedCurrent);
      console.log("   Merchant:", normalizedMerchant);
      console.log("   Buyer:", normalizedBuyer);
      console.log("   Match merchant?", normalizedCurrent === normalizedMerchant);
      console.log("   Match buyer?", normalizedCurrent === normalizedBuyer);

      const isMerchant = normalizedCurrent === normalizedMerchant;
      const isBuyer = normalizedCurrent === normalizedBuyer;
      const isAuthorized = isMerchant || isBuyer;

      console.log("✅ Authorization check result:", { isAuthorized, isMerchant, isBuyer });

      if (!isAuthorized) {
        const errorMsg = `Not authorized. Your wallet doesn't match the order's merchant or buyer.`;
        console.error(errorMsg);
        setError(errorMsg);
        setHasEncryptedData(false);
        return;
      }

      // Now we're authorized, get the encrypted delivery data
      console.log("🔓 Fetching encrypted delivery data from contract...");
      console.log("   Using account:", address);
      let encryptedData: any;
      try {
        encryptedData = await readContract(config, {
          address: ESCROW_ADDRESS,
          abi: ESCROW_ABI,
          functionName: "getEncryptedDeliveryData",
          args: [BigInt(orderId)],
          account: address, // ⚠️ CRITICAL: Pass account so msg.sender is set correctly
        }) as [string, string, string, bigint, boolean];
        
        console.log("✅ Encrypted data retrieved successfully");
        console.log("   Data:", encryptedData);
      } catch (encryptError: any) {
        console.error("❌ Contract rejected getEncryptedDeliveryData call:", encryptError);
        console.error("   This means the contract's authorization check failed");
        console.error("   Even though frontend authorization passed");
        throw new Error(`Contract authorization failed. Make sure you are the merchant or buyer of this order.`);
      }

      const [encryptedAddress, addressCommitment, dataToEncryptHash, decryptionDeadline, canDecryptNow] = encryptedData;

      console.log("✅ Encrypted data extracted");
      console.log("   Has encrypted address:", encryptedAddress && encryptedAddress !== "0x");
      console.log("   Can decrypt now:", canDecryptNow);

      if (encryptedAddress && encryptedAddress !== "0x") {
        setHasEncryptedData(true);
        setCanDecrypt(canDecryptNow);
        setDeadline(Number(decryptionDeadline));
        console.log("   dataToEncryptHash length:", (dataToEncryptHash as string)?.length || 0);
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
          account: address, // Pass account for msg.sender context
        }) as [boolean, bigint];

        setDecryptionLog({
          accessed: log[0],
          timestamp: Number(log[1]),
        });
      } catch (logError) {
        // Log might not exist yet
        console.warn("Could not fetch decryption log:", logError);
      }


    } catch (error: any) {
      console.error("❌ Failed to load encrypted data:", error);
      
      if (error.message?.includes("Could not retrieve order details")) {
        setError("This order does not exist");
      } else if (error.message?.includes("Not authorized")) {
        setError("You are not authorized to view this delivery address. Only the merchant or buyer can access it.");
      } else if (error.message?.includes("No encrypted data")) {
        setError("No encrypted delivery address found for this order");
      } else if (error.message?.includes("revert")) {
        setError("Contract error: " + (error.message?.slice(0, 100) || "Unknown error"));
      } else {
        setError(error.message || "Failed to load encrypted data");
      }
      
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
      // Step 1: Request decryption access on-chain (logs access)
      console.log("📝 Requesting decryption access on-chain...");
      const requestTx = await writeContract(config, {
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "requestAddressDecryption",
        args: [BigInt(orderId)],
        gas: 200000n, // Set reasonable gas limit (200k should be enough for this simple function)
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

      // Convert hex bytes to base64 string for Lit Protocol
      const encryptedString = parseEncryptedDataFromContract(encryptedAddressHex as `0x${string}`);

      // Step 3: Get authentication signature from wallet (wallet-agnostic, works with all wallets)
      console.log("🔑 Getting authentication signature...");
      const authSig = await getAuthSignature();

      // Step 4: Decrypt using Lit Protocol
      console.log("🔓 Decrypting address with Lit Protocol...");
      const decrypted = await decryptDeliveryAddress(
        encryptedString,
        dataToEncryptHash,
        address, // merchantAddress
        authSig
      );

      // Step 5: Verify commitment
      console.log("✓ Verifying address commitment...");
      const isValid = verifyAddressCommitment(decrypted, addressCommitment);

      if (!isValid) {
        throw new Error("Address verification failed! Data may be corrupted.");
      }

      console.log("✅ Address decrypted and verified successfully");
      setDecryptedAddress(decrypted);
      
      // Reload log to show access
      await loadEncryptedData();

    } catch (error: any) {
      console.error("❌ Decryption failed:", error);
      
      let errorMessage = "Failed to decrypt address";
      
      if (error.message?.includes("not authorized")) {
        errorMessage = "Access denied: Order not funded or you are not the merchant";
      } else if (error.message?.includes("expired")) {
        errorMessage = "Decryption deadline has expired";
      } else if (error.message?.includes("Already decrypted")) {
        errorMessage = "You have already requested decryption for this order";
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
                        Decryption was logged on-chain at block #{Date.now()}
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