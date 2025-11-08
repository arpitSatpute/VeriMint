import { motion } from "framer-motion"
import { useState, type ChangeEvent, type FormEvent, type ComponentType, type InputHTMLAttributes } from "react"
import { ShoppingCart, Hash, Layers, MapPin, CheckCircle, AlertCircle } from "lucide-react"


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
  id: number
  tokenId: string
  name: string
  price: string
  type: "Physical" | "Virtual"
  availableSupply: number
  maxSupply: number
  image: string
  description: string
}

interface FormDataType {
  tokenId: string
  quantity: string
  addressLine1: string
  addressLine2: string
  addressLine3: string
  addressLine4: string
}

interface ErrorsType {
  [key: string]: string
}

export default function CreateOrderForm() {
  // Mock NFT data - in real app this would come from props or API
  const [nftData] = useState<NFTDataType>({
    id: 1,
    tokenId: "1002",
    name: "Abstract Reality",
    price: "1.8",
    type: "Physical",
    availableSupply: 12,
    maxSupply: 50,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&h=500&fit=crop",
    description: "Physical art pieces that blend traditional and digital mediums."
  })

  const [formData, setFormData] = useState<FormDataType>({
    tokenId: nftData.tokenId,
    quantity: '1',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    addressLine4: '',
  })

  const [errors, setErrors] = useState<ErrorsType>({})

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (quantity > nftData.availableSupply) {
      newErrors.quantity = `Only ${nftData.availableSupply} available`
    }

    if (nftData.type === 'Physical') {
      if (!formData.addressLine1.trim()) {
        newErrors.addressLine1 = 'Address line 1 is required for physical products'
      }
      if (!formData.addressLine2.trim()) {
        newErrors.addressLine2 = 'City/State is required for physical products'
      }
      if (!formData.addressLine3.trim()) {
        newErrors.addressLine3 = 'Postal code is required for physical products'
      }
      if (!formData.addressLine4.trim()) {
        newErrors.addressLine4 = 'Country is required for physical products'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (validateForm()) {
      const totalPrice = (parseFloat(nftData.price) * parseInt(formData.quantity, 10)).toFixed(3)
      console.log('Order Data:', {
        ...formData,
        totalPrice,
        nftName: nftData.name,
        nftType: nftData.type
      })
      alert(`Order created successfully!\nTotal: ${totalPrice} ETH`)
    }
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this order?')) {
      window.history.back()
    }
  }

  const totalPrice = (parseFloat(nftData.price) * (parseInt(formData.quantity, 10) || 0)).toFixed(3)

  return (
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
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md border ${
                    nftData.type === 'Physical' 
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

                <p className="text-sm text-white/50">{nftData.description}</p>

                <div className="pt-3 border-t border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Unit Price</span>
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300">
                      {nftData.price} ETH
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Available</span>
                    <span className="text-sm text-white/70">{nftData.availableSupply} / {nftData.maxSupply}</span>
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

                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm text-indigo-200 font-medium">Available Supply</p>
                        <p className="text-xs text-indigo-300/70">
                          {nftData.availableSupply} units currently available for purchase
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address - Only for Physical Products */}
                {nftData.type === 'Physical' && (
                  <div className="space-y-4 pt-6 border-t border-white/[0.08]">
                    <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-rose-400" />
                      Shipping Address
                    </h3>

                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm text-rose-200 font-medium">Physical Product Delivery</p>
                          <p className="text-xs text-rose-300/70">
                            Please provide a complete shipping address for delivery
                          </p>
                        </div>
                      </div>
                    </div>

                    <FormInput
                      label="Address Line 1"
                      icon={MapPin}
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      placeholder="Street address, building number"
                      required
                      error={errors.addressLine1}
                    />

                    <FormInput
                      label="Address Line 2"
                      icon={MapPin}
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                      placeholder="City, State/Province"
                      required
                      error={errors.addressLine2}
                    />

                    <FormInput
                      label="Address Line 3"
                      icon={MapPin}
                      name="addressLine3"
                      value={formData.addressLine3}
                      onChange={handleInputChange}
                      placeholder="Postal/ZIP code"
                      required
                      error={errors.addressLine3}
                    />

                    <FormInput
                      label="Address Line 4"
                      icon={MapPin}
                      name="addressLine4"
                      value={formData.addressLine4}
                      onChange={handleInputChange}
                      placeholder="Country"
                      required
                      error={errors.addressLine4}
                    />
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
  )
}