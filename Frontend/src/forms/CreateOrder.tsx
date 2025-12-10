import { motion } from "framer-motion"
import { useState, useEffect, type ChangeEvent, type FormEvent, type ComponentType, type InputHTMLAttributes } from "react"
import { ShoppingCart, Hash, Layers, MapPin, AlertCircle, Package, X } from "lucide-react"
import DefaultLayout from "@/layouts/default";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { config } from "@/config/config";
import escrowMultiProductAbi from "@/abis/escrowMultiProduct.json";
import { parseEther } from "viem";
import { useAccount } from "wagmi";

type ElegantShapeProps = {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}

function ElegantShape({ className, delay = 0, width = 400, height = 100, rotate = 0, gradient = "from-white/[0.08]" }: ElegantShapeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate: rotate }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ width, height }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r to-transparent backdrop-blur-[2px] border-2 border-white/[0.15] shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]" style={{ backgroundImage: `linear-gradient(to right, ${gradient.replace('from-', '')}, transparent)` }} />
      </motion.div>
    </motion.div>
  )
}

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: ComponentType<React.SVGProps<SVGSVGElement>>
  required?: boolean
  error?: string
}

function FormInput({ label, icon: Icon, required, error, ...props }: FormInputProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-white/70">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
        {required && <span className="text-rose-400">*</span>}
      </label>
      <div className="relative">
        <input
          {...props}
          className={`w-full px-4 py-3 bg-white/[0.02] border rounded-xl text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
            error 
              ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' 
              : 'border-white/[0.08] focus:border-indigo-500/50 focus:ring-indigo-500/20'
          }`}
        />
      </div>
      {error && (
        <p className="text-xs text-rose-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  )
}

interface NFTDataType {
  tokenId: string
  name: string
  price: string
  type: string
  image: string
  description: string
  merchant: string
}

interface FormDataType {
  tokenId: string
  quantity: string
  needsShipping: boolean
  addressLine1: string
  addressLine2: string
  addressLine3: string
  addressLine4: string
}

interface ErrorsType {
  [key: string]: string
}

export default function CreateOrder() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { address } = useAccount();
  const [nftData, setNftData] = useState<NFTDataType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const ESCROW_MULTI_PRODUCT = import.meta.env.VITE_ESCROW_MULTI_PRODUCT_ADDRESS as `0x${string}`;

  const [formData, setFormData] = useState<FormDataType>({
    tokenId: id || '',
    quantity: '1',
    needsShipping: false,
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    addressLine4: '',
  })

  const [errors, setErrors] = useState<ErrorsType>({})

  useEffect(() => {
    // Get product data passed from ProductDetails page
    const productData = (location.state as any)?.productData;
    
    if (productData) {
      console.log("✅ Received product data:", productData);
      setNftData({
        tokenId: productData.tokenId,
        name: productData.name,
        description: productData.description,
        image: productData.image,
        price: productData.price,
        type: productData.type,
        merchant: productData.merchant,
      });
      
      setFormData(prev => ({
        ...prev,
        tokenId: productData.tokenId,
      }));
    } else {
      console.warn("⚠️ No product data passed");
      alert("Product data not found. Redirecting to marketplace...");
      navigate('/product');
    }
  }, [id, location.state, navigate]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.currentTarget
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: ErrorsType = {}
    const quantity = parseInt(formData.quantity || '0', 10) || 0

    if (quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1'
    }

    // Validate shipping address only if physical product AND shipping checkbox is checked
    if (nftData?.type === 'physical' && formData.needsShipping) {
      if (!formData.addressLine1.trim()) {
        newErrors.addressLine1 = 'Street address is required'
      }
      if (!formData.addressLine2.trim()) {
        newErrors.addressLine2 = 'City/State is required'
      }
      if (!formData.addressLine3.trim()) {
        newErrors.addressLine3 = 'Postal code is required'
      }
      if (!formData.addressLine4.trim()) {
        newErrors.addressLine4 = 'Country is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async(e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (submitting) return;
    
    try {
      setSubmitting(true);
      console.log("🚀 Starting order creation...");
      
      const quantity = parseInt(formData.quantity, 10);
      const unitPrice = parseFloat(nftData?.price || '0');
      const totalPriceEth = (unitPrice * quantity).toFixed(18);
      const totalWei = parseEther(totalPriceEth);
      
      // Build delivery point hash (address for physical products with shipping)
      let deliveryPointHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
      
      if (nftData?.type === 'physical' && formData.needsShipping) {
        // Concatenate address lines for delivery point
        const shippingAddress = [
          formData.addressLine1,
          formData.addressLine2,
          formData.addressLine3,
          formData.addressLine4
        ].filter(line => line.trim()).join(", ");
        
        // Create a simple hash by encoding the string
        const encoder = new TextEncoder();
        const data = encoder.encode(shippingAddress);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        deliveryPointHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        console.log("📦 Shipping address:", shippingAddress);
        console.log("🔐 Delivery point hash:", deliveryPointHash);
      }
      
      console.log("📊 Order details:", {
        tokenId: nftData?.tokenId,
        quantity,
        deliveryPointHash,
        totalPrice: totalPriceEth + " ETH",
        totalWei: totalWei.toString(),
      });

      // Call fundEscrow function
      const tx = await writeContract(config, {
        address: ESCROW_MULTI_PRODUCT,
        abi: escrowMultiProductAbi,
        functionName: "fundEscrow",
        args: [
          BigInt(nftData?.tokenId || '0'),
          BigInt(quantity),
          deliveryPointHash as `0x${string}`
        ],
        value: totalWei,
        gas: 500000n, // Set reasonable gas limit to avoid "tx gas limit too high" error
      });
      
      console.log("⏳ Transaction sent:", tx);
      alert(`Transaction submitted!\n\nHash: ${tx}\n\nWaiting for confirmation...`);
      
      const receipt = await waitForTransactionReceipt(config, { 
        hash: tx,
        confirmations: 1,
        timeout: 120_000, // 2 minutes
      });
      
      if (receipt.status === "success") {
        console.log("✅ Order created! Gas used:", receipt.gasUsed.toString());
        alert(`✅ Order placed successfully!\n\nTransaction: ${tx}\nTotal: ${totalPriceEth} ETH\nGas used: ${receipt.gasUsed.toString()}\n\nRedirecting to orders page...`);
        
        // Redirect to orders page after successful purchase
        setTimeout(() => {
          navigate('/order');
        }, 2000);
      } else {
        alert('❌ Transaction failed - check contract logs');
      }
      
    } catch (err: any) {
      console.error("❌ Order creation failed:", err);
      
      // Better error handling
      if (err?.message?.includes("user rejected") || err?.message?.includes("User denied")) {
        alert("❌ Transaction cancelled by user");
      } else if (err?.message?.includes("insufficient funds")) {
        alert("❌ Insufficient funds in wallet");
      } else if (err?.shortMessage) {
        alert(`❌ Transaction failed:\n${err.shortMessage}`);
      } else {
        alert(`❌ Failed to create order:\n${err?.message?.substring(0, 150) || 'Unknown error'}`);
      }
    } finally {
      setSubmitting(false);
      navigate('/product');
    }
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this order?')) {
      navigate(-1); // Go back to previous page
    }
  }

  if (!nftData) {
    return (
      <DefaultLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#030303]">
          <p className="text-white/60">Loading product details...</p>
        </div>
      </DefaultLayout>
    );
  }

  const totalPrice = (parseFloat(nftData.price) * (parseInt(formData.quantity, 10) || 0)).toFixed(4)

  return (
    <DefaultLayout>
    <div className="relative min-h-screen w-full bg-[#030303]">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ElegantShape
          delay={0.3}
          width={500}
          height={120}
          rotate={12}
          gradient="indigo-500/[0.12]"
          className="left-[-8%] top-[10%]"
        />
        <ElegantShape
          delay={0.5}
          width={400}
          height={100}
          rotate={-15}
          gradient="rose-500/[0.12]"
          className="right-[-5%] bottom-[15%]"
        />
        <ElegantShape
          delay={0.4}
          width={250}
          height={70}
          rotate={-8}
          gradient="violet-500/[0.12]"
          className="left-[8%] bottom-[8%]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6">
            <img src="https://kokonutui.com/logo.svg" alt="Logo" width={20} height={20} className="w-5 h-5" />
            <span className="text-sm text-white/60 tracking-wide">VeriMint</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
              Create Order
            </span>
          </h1>
          <p className="text-white/40 text-sm md:text-base">Complete your purchase details</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* NFT Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl overflow-hidden sticky top-6">
              <div className="relative aspect-square">
                <img
                  src={nftData.image}
                  alt={nftData.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md border capitalize ${
                    nftData.type === 'physical' 
                      ? 'bg-rose-500/20 border-rose-500/30 text-rose-200' 
                      : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-200'
                  }`}>
                    {nftData.type}
                  </span>
                </div>
              </div>
              
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white/90">
                    {nftData.name}
                  </h3>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.08] shrink-0">
                    <span className="text-xs text-white/40">#</span>
                    <span className="text-xs text-white/60 font-mono">{nftData.tokenId}</span>
                  </div>
                </div>

                <p className="text-sm text-white/50 line-clamp-2">{nftData.description}</p>

                <div className="pt-3 border-t border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Unit Price</span>
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300">
                      {nftData.price} ETH
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Order Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-indigo-400" />
                    Order Details
                  </h3>

                  <FormInput
                    label="Token ID"
                    icon={Hash}
                    name="tokenId"
                    value={formData.tokenId}
                    disabled
                    readOnly
                  />

                  <FormInput
                    label="Quantity"
                    icon={Layers}
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    type="number"
                    min="1"
                    placeholder="Enter quantity"
                    required
                    error={errors.quantity}
                  />
                </div>

                {/* Physical Product Shipping Option */}
                {nftData.type === 'physical' && (
                  <div className="space-y-4 pt-6 border-t border-white/[0.08]">
                    <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                      <input
                        type="checkbox"
                        id="needsShipping"
                        name="needsShipping"
                        checked={formData.needsShipping}
                        onChange={handleInputChange}
                        className="w-5 h-5 rounded border-rose-500/30 bg-white/[0.02] text-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      />
                      <label htmlFor="needsShipping" className="flex-1 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <Package className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-sm text-rose-200 font-medium">I need this product shipped to me</p>
                            <p className="text-xs text-rose-300/70">
                              Check this box if you want the physical product delivered to your address
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Shipping Address Fields */}
                    {formData.needsShipping && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-rose-400" />
                          Shipping Address
                        </h3>

                        <FormInput
                          label="Street Address"
                          icon={MapPin}
                          name="addressLine1"
                          value={formData.addressLine1}
                          onChange={handleInputChange}
                          placeholder="Building number, street name"
                          required
                          error={errors.addressLine1}
                        />

                        <FormInput
                          label="City / State"
                          icon={MapPin}
                          name="addressLine2"
                          value={formData.addressLine2}
                          onChange={handleInputChange}
                          placeholder="City, State/Province"
                          required
                          error={errors.addressLine2}
                        />

                        <FormInput
                          label="Postal Code"
                          icon={MapPin}
                          name="addressLine3"
                          value={formData.addressLine3}
                          onChange={handleInputChange}
                          placeholder="ZIP / Postal code"
                          required
                          error={errors.addressLine3}
                        />

                        <FormInput
                          label="Country"
                          icon={MapPin}
                          name="addressLine4"
                          value={formData.addressLine4}
                          onChange={handleInputChange}
                          placeholder="Country"
                          required
                          error={errors.addressLine4}
                        />
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Order Summary */}
                <div className="pt-6 border-t border-white/[0.08]">
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 space-y-3">
                    <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wide">Order Summary</h4>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/50">Unit Price</span>
                        <span className="text-white/80">{nftData.price} ETH</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/50">Quantity</span>
                        <span className="text-white/80">× {formData.quantity || 0}</span>
                      </div>
                      {nftData.type === 'physical' && formData.needsShipping && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/50">Shipping</span>
                          <span className="text-white/80">Included</span>
                        </div>
                      )}
                      <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                        <span className="text-base font-semibold text-white/90">Total</span>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300">
                          {totalPrice} ETH
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancel}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/[0.02] border border-white/[0.08] text-white/70 font-medium hover:border-white/[0.15] hover:text-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: submitting ? 1 : 1.02 }}
                    whileTap={{ scale: submitting ? 1 : 0.98 }}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-rose-500/20 border-2 border-white/[0.15] text-white font-semibold hover:from-indigo-500/30 hover:to-rose-500/30 transition-all shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Place Order
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
    </DefaultLayout>
  )
}