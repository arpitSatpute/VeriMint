import { motion } from "framer-motion"
import { useState, type SelectHTMLAttributes, type ComponentType, type TextareaHTMLAttributes, type InputHTMLAttributes, type ChangeEvent, type FormEvent } from "react"
import { Upload, X, DollarSign, Layers, FileText, Tag, Sparkles, Image as ImageIcon, File as FileIcon } from "lucide-react"
import DefaultLayout from "@/layouts/default";
import axios from "axios";
import { waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { config } from "@/config/config";
import PRODUCT_NFT_ABI from "@/abis/productNft.json";
import { parseEther, keccak256, toBytes } from "viem";
import { useAccount } from "wagmi"; // ✅ Add this import

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

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  icon?: ComponentType<React.SVGProps<SVGSVGElement>>
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

type Option = { value: string; label: string }

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  icon?: ComponentType<React.SVGProps<SVGSVGElement>>
  required?: boolean
  options: Option[]
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

interface FileInfoType {
  name: string
  size: string
  type: string
}

interface FormDataType {
  name: string
  description: string
  price: string
  supply: string
  category: string
  rarity: string
  collection: string
  properties: string
  unlockableContent: string
  externalLink: string
}

export default function VirtualProductMint() {
  const { address } = useAccount(); // ✅ Get connected wallet address
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const pinataJWT = import.meta.env.VITE_PINATA_JWT;
  const MULTI_PRODUCT_ADDRESS = import.meta.env.VITE_PRODUCT_NFT_ADDRESS as `0x${string}`;
 
  const [fileInfo, setFileInfo] = useState<FileInfoType | null>(null)
  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    description: '',
    price: '',
    supply: '',
    category: 'digital-art',
    rarity: 'common',
    collection: '',
    properties: '',
    unlockableContent: '',
    externalLink: '',
  })

  const uploadImageToIPFS = async (): Promise<{ cid: string; url: string } | null> => {
    if (!imagePreview) return null;

    try {
      // build File from data URL or fetch the image if it's a URL
      let file: File;
      if (imagePreview.startsWith("data:")) {
        const [header, data] = imagePreview.split(",");
        const mime = header.match(/data:(.*);base64/)?.[1] || "image/png";
        const ext = mime.split("/")[1]?.split(";")[0] ?? "png";
        const binary = atob(data);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
        file = new File([array], `image.${ext}`, { type: mime });
      } else {
        // imagePreview is a URL — fetch and convert to File/Blob
        const resp = await fetch(imagePreview);
        if (!resp.ok) throw new Error("Failed to fetch image URL");
        const blob = await resp.blob();
        const mime = blob.type || "image/png";
        const ext = mime.split("/")[1]?.split(";")[0] ?? "png";
        file = new File([blob], `image.${ext}`, { type: mime });
      }

      const form = new FormData();
      form.append("file", file); // pinFileToIPFS expects "file"
      form.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));
      form.append(
        "pinataMetadata",
        JSON.stringify({ name: `verimint_image_${Date.now()}` })
      );

      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        form,
        {
          maxBodyLength: Infinity,
          headers: {
            Authorization: `Bearer ${pinataJWT}`,
            // DO NOT set Content-Type — browser/axios will set multipart boundary
          },
        }
      );

      const cid: string = response.data?.IpfsHash;
      if (!cid) throw new Error("No IpfsHash returned from Pinata");
      return { cid, url: `https://gateway.pinata.cloud/ipfs/${cid}` };
    } catch (err: any) {
      console.error("IPFS upload failed:", err?.response?.data ?? err);
      return null;
    }
  }
  
  
    // Upload NFT metadata JSON to IPFS via Pinata
    const uploadJsonToIPFS = async (imageCid: string): Promise<{ cid: string; url: string } | null> => {
      try {
        console.log("📦 Creating metadata JSON");
        console.log("Connected Address:", address);
        
        const metadata = {
          name: formData.name || 'Product',
          description: formData.description || '',
          image: `ipfs://${imageCid}`,
          external_url: formData.externalLink || '',
          attributes: [
            { trait_type: 'Type', value: 'virtual' },
            { trait_type: 'Category', value: formData.category },
            { trait_type: 'Rarity', value: formData.rarity },
            { trait_type: 'Collection Name', value: formData.collection },
            { trait_type: 'Properties', value: formData.properties },
            { trait_type: 'Unlock Content', value: formData.unlockableContent },
            { trait_type: 'Price (ETH)', value: formData.price },
            { trait_type: 'Total Supply', value: formData.supply },
            { trait_type: 'Merchant', value: address || 'Unknown' }, // ✅ Add merchant address
          ].filter(a => a.value && String(a.value).length > 0),
        }

      console.log("📝 Metadata to upload:", JSON.stringify(metadata, null, 2));

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
      console.log("✅ Metadata uploaded to IPFS:", cid);
      return { cid, url: `https://gateway.pinata.cloud/ipfs/${cid}` }
    } catch (e) {
      console.error('❌ JSON upload failed:', e)
      return null
    }
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileInfo({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.type
      })
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    console.log("🚀 Starting mint process");
    console.log("Connected Address:", address);
    
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    console.log("1️⃣ Uploading image to IPFS...");
    const img = await uploadImageToIPFS()
    if (!img) {
      alert('Image upload failed')
      return;
    }
    console.log("✅ Image uploaded:", img.cid);

    console.log("2️⃣ Uploading metadata to IPFS...");
    const meta = await uploadJsonToIPFS(img.cid)
    if (!meta) {
      alert('Metadata upload failed')
      return;
    }
    console.log("✅ Metadata uploaded:", meta.cid);

    console.log("3️⃣ Minting NFT on blockchain...");
    
    // Convert "virtual" to bytes32 using keccak256
    const productTypeBytes32 = keccak256(toBytes("virtual"));
    
    console.log("Args:", {
      supply: formData.supply,
      price: parseEther(formData.price),
      name: formData.name,
      description: formData.description,
      type: "virtual",
      uri: meta.cid
    });

    const txHash = await writeContract(config, {
      address: MULTI_PRODUCT_ADDRESS,
      abi: PRODUCT_NFT_ABI,
      functionName: "mintProduct",
      args: [
        BigInt(formData.supply),
        parseEther(formData.price),
        formData.name,
        formData.description,
        productTypeBytes32,
        meta.cid
      ]
    });

    console.log("⏳ Waiting for transaction confirmation...", txHash);
    const receipt = await waitForTransactionReceipt(config, { hash: txHash });
    
    if (receipt.status === "success") {
      console.log("✅ NFT minted successfully!");
      alert('Virtual Product NFT minted successfully!');
    } else {
      console.log("❌ Transaction failed");
      alert('Transaction failed');
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
              Mint Virtual Product
            </span>
          </h1>
          <p className="text-white/40 text-sm md:text-base">Create a new ERC-1155 NFT for your digital asset</p>
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
                <ImageIcon className="w-4 h-4" />
                Preview Image
                <span className="text-rose-400">*</span>
              </label>
              <p className="text-xs text-white/40">This image will be used for displaying your NFT</p>
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
                    <span className="text-white/50 text-sm mb-1">Click to upload preview image</span>
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

            {/* Digital File Upload */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-white/70">
                <FileIcon className="w-4 h-4" />
                Digital Asset File
                <span className="text-white/40 text-xs font-normal ml-2">(Optional)</span>
              </label>
              <p className="text-xs text-white/40">Upload the actual digital file (3D model, video, audio, etc.)</p>
              <div className="relative">
                {fileInfo ? (
                  <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl group hover:border-white/[0.12] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <FileIcon className="w-5 h-5 text-indigo-300" />
                      </div>
                      <div>
                        <p className="text-sm text-white/80 font-medium">{fileInfo.name}</p>
                        <p className="text-xs text-white/40">{fileInfo.size} • {fileInfo.type}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFileInfo(null)}
                      className="p-2 hover:bg-rose-500/20 rounded-lg transition-all"
                    >
                      <X className="w-4 h-4 text-rose-400" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/[0.08] rounded-xl hover:border-indigo-500/50 transition-all cursor-pointer bg-white/[0.01] hover:bg-white/[0.02]">
                    <Upload className="w-10 h-10 text-white/30 mb-2" />
                    <span className="text-white/50 text-sm mb-1">Click to upload digital file</span>
                    <span className="text-white/30 text-xs">Any file type up to 100MB</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
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
              <div className="grid grid-cols-1 gap-4">
                <FormInput
                  label="NFT Name"
                  icon={Tag}
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Cosmic Dreams #1"
                  required
                />

                <FormTextarea
                  label="Description"
                  icon={FileText}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your digital asset, its story, and what makes it unique..."
                  rows={4}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect
                    label="Category"
                    icon={Layers}
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    options={[
                      { value: 'digital-art', label: 'Digital Art' },
                      { value: 'photography', label: 'Photography' },
                      { value: '3d-models', label: '3D Models' },
                      { value: 'music', label: 'Music' },
                      { value: 'video', label: 'Video' },
                      { value: 'gaming', label: 'Gaming Assets' },
                      { value: 'virtual-real-estate', label: 'Virtual Real Estate' },
                      { value: 'domain-names', label: 'Domain Names' },
                      { value: 'other', label: 'Other' },
                    ]}
                    required
                  />

                  <FormSelect
                    label="Rarity"
                    icon={Sparkles}
                    name="rarity"
                    value={formData.rarity}
                    onChange={handleInputChange}
                    options={[
                      { value: 'common', label: 'Common' },
                      { value: 'uncommon', label: 'Uncommon' },
                      { value: 'rare', label: 'Rare' },
                      { value: 'epic', label: 'Epic' },
                      { value: 'legendary', label: 'Legendary' },
                    ]}
                    required
                  />
                </div>
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
                  icon={DollarSign}
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
                  icon={Layers}
                  name="supply"
                  value={formData.supply}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="e.g., 100"
                  required
                />
              </div>
              <p className="text-xs text-white/40">
                Supply represents how many editions of this NFT will exist
              </p>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                Additional Details
              </h3>
              
              <FormInput
                label="Collection Name"
                icon={Layers}
                name="collection"
                value={formData.collection}
                onChange={handleInputChange}
                placeholder="e.g., Cosmic Dreams Collection"
              />

              <FormTextarea
                label="Properties / Attributes"
                icon={Tag}
                name="properties"
                value={formData.properties}
                onChange={handleInputChange}
                placeholder="List special properties or attributes (e.g., Background: Blue, Eyes: Laser, Rarity: Gold)"
                rows={3}
              />

              <FormTextarea
                label="Unlockable Content"
                icon={Sparkles}
                name="unlockableContent"
                value={formData.unlockableContent}
                onChange={handleInputChange}
                placeholder="Include content that will be revealed after purchase (e.g., access code, bonus file, private link)"
                rows={2}
              />

              <FormInput
                label="External Link"
                icon={FileText}
                name="externalLink"
                value={formData.externalLink}
                onChange={handleInputChange}
                type="url"
                placeholder="https://your-website.com"
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
                Mint Virtual Product NFT
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