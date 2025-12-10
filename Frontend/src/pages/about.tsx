import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { config } from "@/config/config";
import ESCROW_ABI from "@/abis/escrowMultiProduct.json";
import { motion } from "framer-motion";

export default function DocsPage() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const ESCROW_ADDRESS = import.meta.env.VITE_ESCROW_MULTI_PRODUCT_ADDRESS as `0x${string}`;

  const handleEmergencyWithdraw = async () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet first");
      return;
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const amountInWei = BigInt(Math.floor(parseFloat(withdrawAmount) * 1e18));
      
      writeContract(
        {
          address: ESCROW_ADDRESS,
          abi: ESCROW_ABI,
          functionName: "emergencyWithdraw",
          args: [amountInWei],
        },
        {
          onSuccess: () => {
            setSuccess(`Successfully withdrew ${withdrawAmount} ETH`);
            setWithdrawAmount("");
            setIsLoading(false);
          },
          onError: (error: any) => {
            setError(error?.message || "Withdrawal failed");
            setIsLoading(false);
          },
        }
      );
    } catch (err: any) {
      setError(err?.message || "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>About</h1>
        </div>
      </section>

      {/* Emergency Withdraw Section */}
      <motion.section 
        className="flex flex-col items-center justify-center gap-6 py-8 md:py-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-md bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            🚨 Emergency Withdraw
          </h2>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Only the contract owner can withdraw funds from the escrow account in emergency situations.
          </p>

          {!isConnected ? (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded mb-4 text-sm">
              Please connect your wallet to proceed
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (ETH)
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.5"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <button
                  onClick={handleEmergencyWithdraw}
                  disabled={isLoading || !isConnected || !withdrawAmount}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block animate-spin">⏳</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      💸 Withdraw Funds
                    </>
                  )}
                </button>
              </div>

              {error && (
                <motion.div
                  className="mt-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-800 dark:text-red-200 px-4 py-3 rounded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  className="mt-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-800 dark:text-green-200 px-4 py-3 rounded"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <p className="text-sm">✅ {success}</p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.section>
    </DefaultLayout>
  );
}
