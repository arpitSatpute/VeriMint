import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export default function LoadingOverlay({ 
  isVisible, 
  message = "Processing transaction..." 
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backdropFilter: "blur(8px)" }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" />
          
          {/* Loading Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="relative z-10 flex flex-col items-center gap-4 p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/[0.08] backdrop-blur-xl"
          >
            {/* Spinner */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            >
              <Loader2 className="w-12 h-12 text-white/80" strokeWidth={1.5} />
            </motion.div>
            
            {/* Message */}
            {message && (
              <p className="text-xs text-white/50 font-medium text-center max-w-xs">
                {message}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
