import { useParams } from "react-router-dom";
import DefaultLayout from "@/layouts/default";
import MerchantAddressDecrypt from "./MerchantAddressDecrypt";
import { ChevronLeft, Lock, Shield, Key, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ElegantShapes from "@/components/ElegantShapes";
import { motion } from "framer-motion";

export default function DecryptPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  if (!orderId) {
    return (
      <DefaultLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#030303]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <Lock className="w-8 h-8 text-rose-400" />
            </div>
            <p className="text-white/70 text-lg">Order ID not found</p>
          </motion.div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="relative min-h-screen w-full bg-[#030303] pb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
        
        <ElegantShapes variant="default" />
        
        <div className="relative z-10 container mx-auto px-4 md:px-6 py-8 md:py-12">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            {/* Back Button */}
            <motion.button
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/order")}
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/[0.02] border border-white/[0.08] rounded-lg text-white/70 hover:text-white hover:border-white/[0.15] transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Orders
            </motion.button>

            {/* Logo Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6">
              <img src="https://kokonutui.com/logo.svg" alt="Logo" width={20} height={20} className="w-5 h-5" />
              <span className="text-sm text-white/60 tracking-wide">VeriMint</span>
            </div>

            {/* Title Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold mb-3">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
                    Decrypt Delivery Address
                  </span>
                </h1>
                <p className="text-white/50 text-sm md:text-base">
                  Securely decrypt and view the encrypted delivery address for order #{orderId}
                </p>
              </div>

              {/* Security Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30"
              >
                <Shield className="w-5 h-5 text-indigo-300" />
                <div className="text-left">
                  <div className="text-xs text-indigo-400 font-semibold">Encrypted by</div>
                  <div className="text-xs text-indigo-300">Lit Protocol</div>
                </div>
              </motion.div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl p-4 hover:border-white/[0.12] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Key className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-xs text-white/40 mb-1">Order ID</div>
                    <div className="font-mono text-sm text-white/90">#{orderId}</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl p-4 hover:border-white/[0.12] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-500/10 rounded-lg">
                    <Lock className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <div className="text-xs text-white/40 mb-1">Encryption</div>
                    <div className="text-sm text-white/90">End-to-End</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl p-4 hover:border-white/[0.12] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs text-white/40 mb-1">Security</div>
                    <div className="text-sm text-white/90">Blockchain Verified</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Warning Banner - Auto Refund */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="max-w-4xl mx-auto mb-6"
          >
            <div className="bg-gradient-to-r from-amber-500/10 to-rose-500/10 backdrop-blur-sm border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-200 mb-1">
                    Deadline Notice
                  </h3>
                  <p className="text-xs text-amber-100/80 leading-relaxed mb-2">
                    You have <strong>7 days</strong> from order creation to decrypt this delivery address. 
                    If you don't decrypt within the deadline, the buyer can claim an automatic refund.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-amber-200/70">
                    <Shield className="w-3 h-3" />
                    <span>Buyer protection policy enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Decrypt Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <MerchantAddressDecrypt orderId={orderId} />
          </motion.div>
        </div>

        {/* Bottom Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#030303] to-transparent pointer-events-none" />
      </div>
    </DefaultLayout>
  );
}

