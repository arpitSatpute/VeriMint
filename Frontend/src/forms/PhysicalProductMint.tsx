import { motion } from "framer-motion"
import React, { useState } from "react"
import { Upload, X, Calendar, Package, Hash, DollarSign, Layers, FileText, CheckCircle, Tag } from "lucide-react"
import axios from "axios";
import { waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { config } from "@/config/config";
import MULTI_PRODUCT_ABI from "@/abis/multiProduct.json";
import { parseEther } from "viem";
import DefaultLayout from "@/layouts/default";

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
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-r to-transparent backdrop-blur-[2px] border-2 border-white/[0.15] shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]"
          style={{ backgroundImage: `linear-gradient(to right, ${gradient.replace('from-', '')}, transparent)` }} 
        />
      </motion.div>
    </motion.div>
  )
}

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode
  icon?: IconType
  required?: boolean
}

function FormInput({ label, icon: Icon, required, ...props }: FormInputProps) {
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
          className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/30 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>
    </div>
  )
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: React.ReactNode
  icon?: IconType
  required?: boolean
}

function FormTextarea({ label, icon: Icon, required, ...props }: FormTextareaProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-white/70">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
        {required && <span className="text-rose-400">*</span>}
      </label>
      <textarea
        {...props}
        className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/30 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
      />
    </div>
  )
}

interface SelectOption {
  value: string
  label: string
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: React.ReactNode
  icon?: IconType
  required?: boolean
  options: SelectOption[]
}

function FormSelect({ label, icon: Icon, required, options, ...props }: FormSelectProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-white/70">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
        {required && <span className="text-rose-400">*</span>}
      </label>
      <select
        {...props}
        className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white/90 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-[#0a0a0a]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

interface FormDataType {
  identityNumber: string
  batchNumber: string
  manufacturingDate: string
  expiryDate: string
  weight: string
  dimensions: string
  shippingInfo: string
  warranty: string
  name: string
  description: string
  price: string
  supply: string
}

export default function PhysicalProductMint() {

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const pinataJWT = import.meta.env.VITE_PINATA_JWT;
  const MULTI_PRODUCT_ADDRESS = import.meta.env.VITE_MULTI_PRODUCT_ADDRESS;

  const [formData, setFormData] = useState<FormDataType>({
    identityNumber: '',
    batchNumber: '',
    manufacturingDate: '',
    expiryDate: '',
    weight: '',
    dimensions: '',
    shippingInfo: '',
    warranty: '',
    name: '',
    description: '',
    price: '',
    supply: '',
  })

  // FIXED uploadToIPFS
  const uploadImageToIPFS = async (): Promise<{ cid: string; url: string } | null> => {
    if (!imagePreview) return null;

    try {
      // Convert data URL (base64) to File if needed
      let file: File;
      if (imagePreview.startsWith("data:")) {
        const [header, data] = imagePreview.split(",");
        const mime = header.match(/data:(.*);base64/)?.[1] || "image/png";
        const binary = atob(data);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
        file = new File([array], "image.png", { type: mime });
      } else {
        // If it's already a URL, cannot pin without original file
        console.warn("No raw file available to pin.");
        return null;
      }

      const formData = new FormData();
      formData.append("file", file); // Pinata expects a file field

      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxBodyLength: Infinity,
          headers: {
            Authorization: `Bearer ${pinataJWT}`,
          },
        }
      );

      const cid: string = response.data.IpfsHash;
      console.log(cid);
      return { cid, url: `https://gateway.pinata.cloud/ipfs/${cid}` };
    } catch (err) {
      console.error("IPFS upload failed:", err);
      return null;
    }
  }


  // Upload NFT metadata JSON to IPFS via Pinata
  const uploadJsonToIPFS = async (imageCid: string): Promise<{ cid: string; url: string } | null> => {
    try {
      const metadata = {
        name: formData.name || 'Product',
        description: formData.description || '',
        image: `ipfs://${imageCid}`,
        attributes: [
          { trait_type: 'Type', value: 'physical' },
          { trait_type: 'Identity Number', value: formData.identityNumber },
          { trait_type: 'Batch Number', value: formData.batchNumber },
          { trait_type: 'Manufacturing Date', value: formData.manufacturingDate },
          { trait_type: 'Expiry Date', value: formData.expiryDate },
          { trait_type: 'Weight', value: formData.weight },
          { trait_type: 'Dimensions', value: formData.dimensions },
          { trait_type: 'Shipping Info', value: formData.shippingInfo },
          { trait_type: 'Warranty', value: formData.warranty },
          { trait_type: 'Price (ETH)', value: formData.price },
          { trait_type: 'Total Supply', value: formData.supply },
        ].filter(a => a.value && String(a.value).length > 0),
      }

      const body = {
        pinataOptions: { cidVersion: 1 },
        pinataMetadata: { name: `verimint_${metadata.name}_${Date.now()}` },
        pinataContent: metadata,
      }

      const res = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        body,
        {
          headers: {
            Authorization: `Bearer ${pinataJWT}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const cid: string = res.data.IpfsHash
      return { cid, url: `https://gateway.pinata.cloud/ipfs/${cid}` }
    } catch (e) {
      console.error('JSON upload failed:', e)
      return null
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Make submit upload image first, then JSON
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const img = await uploadImageToIPFS()
    if (!img) return alert('Image upload failed')
    const meta = await uploadJsonToIPFS(img.cid)
    if (!meta) return alert('Metadata upload failed')
    console.log('Metadata CID:', meta.cid, 'URL:', meta.url)
    // alert('Metadata uploaded to IPFS!')

    const txHash = await writeContract(config, {
      address: MULTI_PRODUCT_ADDRESS,
      abi: MULTI_PRODUCT_ABI,
      functionName: "mintProductNft",
      args: [
        formData.supply,
        parseEther(formData.price),
        formData.name,
        formData.description,
        "physical",
        meta.cid
      ]
    });

    const receipt = await waitForTransactionReceipt(config, { hash: txHash });
    if (receipt.status === "success") {
      console.log("Success")
    } else {
      console.log("Error");
    }

  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All data will be lost.')) {
      window.history.back()
    }
  }

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

      <div className="relative z-10 container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-5xl">
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
              Mint Physical Product
            </span>
          </h1>
          <p className="text-white/40 text-sm md:text-base">Create a new ERC-1155 NFT for your physical product</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 md:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Upload Section */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-white/70">
                <Upload className="w-4 h-4" />
                Product Image
                <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                {imagePreview ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-white/[0.08] group">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-3 right-3 p-2 bg-rose-500/80 hover:bg-rose-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-white/[0.08] rounded-xl hover:border-indigo-500/50 transition-all cursor-pointer bg-white/[0.01] hover:bg-white/[0.02]">
                    <Upload className="w-12 h-12 text-white/30 mb-3" />
                    <span className="text-white/50 text-sm mb-1">Click to upload product image</span>
                    <span className="text-white/30 text-xs">PNG, JPG, GIF up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      required
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Product Name"
                  icon={Tag as IconType}
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Premium Leather Wallet"
                  required
                />                
              </div>

              <FormTextarea
                label="Description"
                icon={FileText as IconType}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide a detailed description of your product..."
                rows={4}
                required
              />
            </div>

            {/* Product Identification */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                <Hash className="w-5 h-5 text-rose-400" />
                Product Identification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Identity Number"
                  icon={Hash as IconType}
                  name="identityNumber"
                  value={formData.identityNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., SKU-12345"
                  required
                />
                <FormInput
                  label="Batch Number"
                  icon={Hash as IconType}
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., BATCH-2024-001"
                  required
                />
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-400" />
                Manufacturing Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Manufacturing Date"
                  icon={Calendar as IconType}
                  name="manufacturingDate"
                  value={formData.manufacturingDate}
                  onChange={handleInputChange}
                  type="date"
                  required
                />
                <FormInput
                  label="Expiry Date"
                  icon={Calendar as IconType}
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  type="date"
                />
              </div>
            </div>

            {/* Pricing & Supply */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Pricing & Supply
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Price (ETH)"
                  icon={DollarSign as IconType}
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  type="number"
                  step="0.001"
                  placeholder="e.g., 0.5"
                  required
                />
                <FormInput
                  label="Total Supply"
                  icon={Layers as IconType}
                  name="supply"
                  value={formData.supply}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="e.g., 100"
                  required
                />
              </div>
            </div>

            {/* Physical Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                Physical Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <FormInput
                  label="Weight"
                  icon={Package as IconType}
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="e.g., 500g"
                />
              </div>

              <FormInput
                label="Dimensions (L x W x H)"
                icon={Package as IconType}
                name="dimensions"
                value={formData.dimensions}
                onChange={handleInputChange}
                placeholder="e.g., 20cm x 15cm x 5cm"
              />

              <FormInput
                label="Warranty Period"
                icon={CheckCircle as IconType}
                name="warranty"
                value={formData.warranty}
                onChange={handleInputChange}
                placeholder="e.g., 1 year manufacturer warranty"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/[0.08]">
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
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-rose-500/20 border-2 border-white/[0.15] text-white font-semibold hover:from-indigo-500/30 hover:to-rose-500/30 transition-all shadow-lg shadow-indigo-500/10"
              >
                Mint Physical Product NFT
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
    </DefaultLayout>
  )
}