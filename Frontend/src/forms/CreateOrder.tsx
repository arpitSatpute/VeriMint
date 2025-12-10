import { motion } from "framer-motion"
import { useState, useEffect, type ChangeEvent, type FormEvent } from "react"
import { ShoppingCart, Hash, Layers, MapPin, AlertCircle, Package } from "lucide-react"
import DefaultLayout from "@/layouts/default";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { writeContract, waitForTransactionReceipt, readContract } from "wagmi/actions";
import { config } from "@/config/config";
import escrowMultiProductAbi from "@/abis/escrowMultiProduct.json";
import productNftAbi from "@/abis/productNft.json";
import { keccak256, toHex, encodePacked } from "viem";
import { useAccount } from "wagmi";

interface FormDataType {
  tokenId: string
  quantity: string
  needsShipping: boolean
  addressLine1: string
  addressLine2: string
  addressLine3: string
  addressLine4: string
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
  const [maxSupply, setMaxSupply] = useState<number>(0);
  
  const ESCROW_MULTI_PRODUCT = import.meta.env.VITE_ESCROW_MULTI_PRODUCT_ADDRESS as `0x${string}`;
  const PRODUCT_NFT_ADDRESS = import.meta.env.VITE_PRODUCT_NFT_ADDRESS as `0x${string}`;

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
    const productData = (location.state as any)?.productData;
    
    if (productData) {
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

      // ✅ FIX: Fetch available supply from contract
      fetchAvailableSupply(productData.tokenId);
    } else {
      alert("Product data not found. Redirecting to marketplace...");
      navigate('/product');
    }
  }, [id, location.state, navigate]);

  const fetchAvailableSupply = async (tokenId: string) => {
    try {
      const available = await readContract(config, {
        address: PRODUCT_NFT_ADDRESS,
        abi: productNftAbi,
        functionName: "availableSupply",
        args: [BigInt(tokenId)],
      }) as bigint;

      setMaxSupply(Number(available));
      console.log("✅ Available supply:", Number(available));
    } catch (error) {
      console.error("Failed to fetch available supply:", error);
      setMaxSupply(0);
    }
  };

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

    // ✅ FIX: Check against available supply
    if (quantity > maxSupply) {
      newErrors.quantity = `Only ${maxSupply} units available`
    }

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
      
      const quantity = BigInt(formData.quantity);
      
      const tokenIdBig = BigInt(nftData?.tokenId || '0');
      console.log("🔍 Pre-flight checks - TokenID:", tokenIdBig.toString());
      
      // ✅ Verify product is still listed
      const isListed = await readContract(config, {
        address: PRODUCT_NFT_ADDRESS,
        abi: productNftAbi,
        functionName: "isProductListed",
        args: [tokenIdBig],
      }) as boolean;

      console.log("✓ Product listed:", isListed);
      if (!isListed) {
        throw new Error("Product is no longer listed");
      }

      // ✅ Re-check available supply before proceeding
      const currentAvailable = await readContract(config, {
        address: PRODUCT_NFT_ADDRESS,
        abi: productNftAbi,
        functionName: "availableSupply",
        args: [tokenIdBig],
      }) as bigint;

      console.log("✓ Available supply:", currentAvailable.toString());
      if (currentAvailable < quantity) {
        throw new Error(`Insufficient supply. Only ${currentAvailable} units available`);
      }

      // ✅ Get the EXACT listing price
      const listedProduct = await readContract(config, {
        address: PRODUCT_NFT_ADDRESS,
        abi: productNftAbi,
        functionName: "getListedProduct",
        args: [tokenIdBig],
      }) as [string, bigint];

      const pricePerUnit = listedProduct[1];
      const totalWei = pricePerUnit * quantity;
      
      console.log("✓ Merchant:", listedProduct[0]);
      console.log("✓ Price per unit:", pricePerUnit.toString());
      console.log("✓ Total WEI:", totalWei.toString());
      
      console.log("💰 Order details:", {
        pricePerUnit: pricePerUnit.toString(),
        quantity: quantity.toString(),
        totalWei: totalWei.toString(),
        totalEth: (Number(totalWei) / 1e18).toFixed(18)
      });
      
      // Build delivery point hash matching contract's keccak256(abi.encodePacked("null"))
      let deliveryPointHash: `0x${string}`;
      
      if (nftData?.type === 'physical' && formData.needsShipping) {
        const shippingAddress = [
          formData.addressLine1,
          formData.addressLine2,
          formData.addressLine3,
          formData.addressLine4
        ].filter(line => line.trim()).join(", ");
        
        deliveryPointHash = keccak256(encodePacked(['string'], [shippingAddress]));
        console.log("📦 Shipping Address Hash:", deliveryPointHash);
      } else {
        // Use null hash for virtual products or if no shipping needed
        deliveryPointHash = keccak256(encodePacked(['string'], ['null']));
        console.log("📦 Null Hash (No Shipping):", deliveryPointHash);
      }

      // Call fundEscrow function
      const tx = await writeContract(config, {
        address: ESCROW_MULTI_PRODUCT,
        abi: escrowMultiProductAbi,
        functionName: "fundEscrow",
        args: [
          BigInt(nftData?.tokenId || '0'),
          quantity,
          deliveryPointHash
        ],
        value: totalWei,
        gas: 1500000n,
      });
      
      console.log("⏳ Transaction sent:", tx);
      
      const receipt = await waitForTransactionReceipt(config, { 
        hash: tx,
        confirmations: 1,
        timeout: 120_000,
      });
      
      if (receipt.status === "success") {
        console.log("✅ Order created! Gas used:", receipt.gasUsed.toString());
        const totalEth = (Number(totalWei) / 1e18).toFixed(4);
        alert(`✅ Order placed successfully!\n\nTransaction: ${tx}\nTotal: ${totalEth} ETH\nQuantity: ${quantity}\n\nRedirecting to orders page...`);
        
        setTimeout(() => {
          navigate('/order');
        }, 2000);
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (err: any) {
      console.error("❌ Order creation failed:", err);
      console.error("Full error object:", JSON.stringify(err, null, 2));
      
      let errorMessage = "Unknown error";
      
      if (err?.message) {
        if (err.message.includes("user rejected") || err.message.includes("User denied")) {
          errorMessage = "Transaction cancelled by user";
        } else if (err.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds in wallet";
        } else if (err.message.includes("Not listed")) {
          errorMessage = "Product is not listed for sale";
        } else if (err.message.includes("Insufficient supply")) {
          errorMessage = err.message;
        } else if (err.message.includes("Wrong amount")) {
          errorMessage = "Price mismatch - please refresh and try again";
        } else if (err.message.includes("execution reverted")) {
          errorMessage = "❌ Transaction reverted. Check console for details. This usually means: Product not listed, insufficient supply, or price mismatch.";
        } else if (err.shortMessage) {
          errorMessage = err.shortMessage;
        } else {
          errorMessage = err.message.substring(0, 200);
        }
      }
      
      alert(`❌ Failed to create order:\n${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this order?')) {
      navigate(-1);
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
      {/* Background elements remain same */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
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
                <h3 className="text-lg font-semibold text-white/90">
                  {nftData.name}
                </h3>

                <p className="text-sm text-white/50 line-clamp-2">{nftData.description}</p>

                <div className="pt-3 border-t border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Unit Price</span>
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300">
                      {nftData.price} ETH
                    </span>
                  </div>
                  {/* ✅ Show available supply */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Available</span>
                    <span className="text-sm font-semibold text-emerald-300">
                      {maxSupply} units
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

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white/70">
                      <Layers className="w-4 h-4" />
                      Quantity
                      <span className="text-rose-400">*</span>
                      {maxSupply > 0 && (
                        <span className="text-xs text-white/40 ml-auto">
                          Max: {maxSupply}
                        </span>
                      )}
                    </label>
                    <input
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      type="number"
                      min="1"
                      max={maxSupply}
                      placeholder="Enter quantity"
                      required
                      className={`w-full px-4 py-3 bg-white/[0.02] border rounded-xl text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${
                        errors.quantity 
                          ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' 
                          : 'border-white/[0.08] focus:border-indigo-500/50 focus:ring-indigo-500/20'
                      }`}
                    />
                    {errors.quantity && (
                      <p className="text-xs text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.quantity}
                      </p>
                    )}
                  </div>
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

                        <input
                          name="addressLine1"
                          value={formData.addressLine1}
                          onChange={handleInputChange}
                          placeholder="Building number, street name"
                          required={formData.needsShipping}
                          className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/30 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                        {errors.addressLine1 && <p className="text-xs text-rose-400">{errors.addressLine1}</p>}

                        <input
                          name="addressLine2"
                          value={formData.addressLine2}
                          onChange={handleInputChange}
                          placeholder="City, State/Province"
                          required={formData.needsShipping}
                          className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/30 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />

                        <input
                          name="addressLine3"
                          value={formData.addressLine3}
                          onChange={handleInputChange}
                          placeholder="ZIP / Postal code"
                          required={formData.needsShipping}
                          className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/30 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />

                        <input
                          name="addressLine4"
                          value={formData.addressLine4}
                          onChange={handleInputChange}
                          placeholder="Country"
                          required={formData.needsShipping}
                          className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/30 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
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
                    disabled={submitting || maxSupply === 0}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-rose-500/20 border-2 border-white/[0.15] text-white font-semibold hover:from-indigo-500/30 hover:to-rose-500/30 transition-all shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : maxSupply === 0 ? (
                      'Out of Stock'
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
    </div>
    </DefaultLayout>
  )
}