import { motion } from "framer-motion"
import { useState, useEffect, type ChangeEvent, type FormEvent, type ComponentType, type InputHTMLAttributes } from "react"
import { ShoppingCart, Hash, Layers, MapPin, CheckCircle, AlertCircle, Package } from "lucide-react"
import DefaultLayout from "@/layouts/default";
import { useParams } from "react-router-dom";
import { readContract, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { config } from "@/config/config";
import MULTI_PRODUCT_ABI from "@/abis/multiProduct.json";
import escrowMultiProductAbi from "@/abis/escrowMultiProduct.json"; // ✅ Add import
import { parseEther, formatEther } from "viem"; // ✅ Add formatEther

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

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}

interface NFTDataType {
  tokenId: string
  name: string
  price: string
  type: string
  availableSupply: string
  image: string
  description: string
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

export default function CreateOrderForm() {
  const { id } = useParams<{ id: string }>();
  const [nftData, setNftData] = useState<NFTDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const MULTI_PRODUCT_ADDRESS = import.meta.env.VITE_MULTI_PRODUCT_ADDRESS as `0x${string}`;
  const ESCROW_MULTI_PRODUCT = import.meta.env.VITE_ESCROW_MULTI_PRODUCT_ADDRESS as `0x${string}`; // ✅ Add this

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
    if (id) {
      loadNFTDetails(id);
    }
  }, [id]);

  const loadNFTDetails = async (tokenId: string) => {
    setLoading(true);
    try {
      console.log("🔍 Loading NFT details for order creation");

      // Get token URI
      const uri = (await readContract(config, {
        address: MULTI_PRODUCT_ADDRESS,
        abi: MULTI_PRODUCT_ABI,
        functionName: "uri",
        args: [BigInt(tokenId)],
      })) as string;

      // Get product details from contract
      const product = (await readContract(config, {
        address: MULTI_PRODUCT_ADDRESS,
        abi: MULTI_PRODUCT_ABI,
        functionName: "mintedProduct",
        args: [BigInt(tokenId)],
      })) as any;

      console.log("📊 Raw product data from contract:", {
        price: product.price?.toString(),
        priceType: typeof product.price,
        productType: product.productType
      });

      // Normalize IPFS URI
      let metadataUrl = uri;
      if (uri.startsWith("ipfs://")) {
        metadataUrl = uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
      } else if (!uri.startsWith("http")) {
        metadataUrl = `https://gateway.pinata.cloud/ipfs/${uri}`;
      }

      // Fetch JSON metadata
      const response = await fetch(metadataUrl);
      if (!response.ok) throw new Error("Failed to fetch metadata");
      const metadata: NFTMetadata = await response.json();

      // Normalize image URL
      let imageUrl = metadata.image || "";
      if (imageUrl.startsWith("ipfs://")) {
        imageUrl = imageUrl.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
      }

      // Extract attributes
      const priceAttr = metadata.attributes?.find((a) => a.trait_type === "Price (ETH)");
      const typeAttr = metadata.attributes?.find((a) => a.trait_type === "Type");
      const supplyAttr = metadata.attributes?.find((a) => a.trait_type === "Total Supply");

      // ✅ Check if contract price is in Wei and convert it
      let priceInEth: string;
      if (product.price && product.price > 1000000000000000n) { // If price seems to be in Wei (> 0.001 ETH in Wei)
        priceInEth = formatEther(product.price);
        console.log("💰 Price was in Wei, converted to ETH:", priceInEth);
      } else {
        priceInEth = priceAttr?.value?.toString() || product.price?.toString() || "0";
        console.log("💰 Price from metadata:", priceInEth);
      }

      console.log("✅ Final price to use:", priceInEth + " ETH");

      setNftData({
        tokenId,
        name: metadata.name || `Token #${tokenId}`,
        description: metadata.description || "No description available",
        image: imageUrl,
        price: priceInEth,
        availableSupply: supplyAttr?.value?.toString() || "0",
        type: typeAttr?.value?.toString() || product.productType || "virtual",
      });

      console.log("✅ NFT details loaded for order");
    } catch (error) {
      console.error("❌ Failed to load NFT details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.currentTarget
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user starts typing
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

    const availableSupply = parseInt(nftData?.availableSupply || '0', 10);
    if (quantity > availableSupply) {
      newErrors.quantity = `Only ${availableSupply} available`
    }

    // Only validate shipping if physical product AND shipping checkbox is checked
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
    
    if (validateForm()) {
      try {
        console.log("🚀 Starting order creation...");
        
        const quantity = parseInt(formData.quantity, 10);
        const unitPrice = parseFloat(nftData?.price || '0');
        const totalPriceEth = (unitPrice * quantity).toFixed(18);
        const totalWei = parseEther(totalPriceEth);
        
        // Shipping address
        let shippingAddress = "";
        if (nftData?.type === 'physical' && formData.needsShipping) {
          shippingAddress = [
            formData.addressLine1,
            formData.addressLine2,
            formData.addressLine3,
            formData.addressLine4
          ].filter(line => line.trim()).join(", ");
        }
        
        console.log("📦 Order details:", {
          tokenId: nftData?.tokenId,
          quantity,
          shippingAddress: shippingAddress || "No shipping",
          totalPrice: totalPriceEth + " ETH",
        });

        // ✅ Try with manual gas limit first
        const tx = await writeContract(config, {
          address: ESCROW_MULTI_PRODUCT,
          abi: escrowMultiProductAbi,
          functionName: "fundEscrow",
          args: [
            BigInt(nftData?.tokenId || '0'),
            BigInt(quantity),
            shippingAddress || ""
          ],
          value: totalWei,
          gas: 1000000n, // Try 1M gas
        });
        
        console.log("⏳ Transaction sent:", tx);
        alert(`Transaction submitted!\nHash: ${tx}\n\nWaiting for confirmation...`);
        
        const receipt = await waitForTransactionReceipt(config, { 
          hash: tx,
          confirmations: 1,
          timeout: 60_000, // 60 seconds
        });
        
        if (receipt.status === "success") {
          console.log("✅ Order created! Gas used:", receipt.gasUsed.toString());
          alert(`✅ Order placed successfully!\n\nTransaction: ${tx}\nTotal: ${totalPriceEth} ETH\nGas used: ${receipt.gasUsed.toString()}`);
        } else {
          alert('❌ Transaction failed - check contract logs');
        }
        
      } catch (err: any) {
        console.error("❌ Order creation failed:", err);
        
        // Better error handling
        if (err?.message?.includes("user rejected") || err?.message?.includes("User denied")) {
          alert("❌ Transaction cancelled");
        } else if (err?.message?.includes("insufficient funds")) {
          alert("❌ Insufficient funds in wallet");
        } else if (err?.message?.includes("out of memory") || err?.message?.includes("out of gas")) {
          alert("❌ Contract Error: Out of gas\n\nThis is a smart contract issue - the fundEscrow function is using too much gas. Please contact the contract owner to fix this.");
        } else if (err?.shortMessage) {
          alert(`❌ Transaction failed:\n${err.shortMessage}`);
        } else {
          alert(`❌ Failed to create order:\n${err?.message?.substring(0, 150) || 'Unknown error'}`);
        }
      }
    }
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this order?')) {
      window.history.back()
    }
  }

  if (loading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#030303]">
          <p className="text-white/60">Loading product details...</p>
        </div>
      </DefaultLayout>
    );
  }

  if (!nftData) {
    return (
      <DefaultLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#030303]">
          <p className="text-white/60">Product not found</p>
        </div>
      </DefaultLayout>
    );
  }

  // ✅ Update totalPrice calculation for display
  const totalPrice = (parseFloat(nftData.price) * (parseInt(formData.quantity, 10) || 0)).toString()

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
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Available</span>
                    <span className="text-sm text-white/70">{nftData.availableSupply}</span>
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
                    max={nftData.availableSupply}
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

                    {/* Shipping Address Fields - Only show if checkbox is checked */}
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
                    className="flex-1 px-6 py-3 rounded-xl bg-white/[0.02] border border-white/[0.08] text-white/70 font-medium hover:border-white/[0.15] hover:text-white/90 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-rose-500/20 border-2 border-white/[0.15] text-white font-semibold hover:from-indigo-500/30 hover:to-rose-500/30 transition-all shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Place Order
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