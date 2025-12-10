import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Search, Package, ShoppingBag, Clock, CheckCircle, XCircle, Truck } from "lucide-react"
import DefaultLayout from "@/layouts/default"
import { useAccount } from "wagmi"
import { readContract } from "wagmi/actions"
import { config } from "@/config/config"
import ORDER_MANAGER_ABI from "@/abis/orderManager.json"
import ESCROW_ABI from "@/abis/escrowMultiProduct.json"
import PRODUCT_NFT_ABI from "@/abis/productNft.json"

type ElegantShapeProps = {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  gradient?: string
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

type DeliveryStatus = 'Pending' | 'InTransit' | 'Delivered' | 'Failed'
type OrderState = 'Created' | 'Released' | 'Cancelled'

interface OrderType {
  id: number
  tokenId: string
  name: string
  price: string
  type: string
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'
  supply: string
  date: string
  image: string
  buyerAddress: string
  merchantAddress: string
  deliveryStatus: DeliveryStatus
  orderState: OrderState
}

type OrderCardProps = {
  order: OrderType
  index: number
  isMerchant: boolean
}

function OrderCard({ order, index, isMerchant }: OrderCardProps) {
  const statusConfig = {
    pending: { icon: Clock, color: 'amber', label: 'Pending' },
    processing: { icon: Package, color: 'indigo', label: 'Processing' },
    shipped: { icon: Truck, color: 'violet', label: 'Shipped' },
    completed: { icon: CheckCircle, color: 'emerald', label: 'Completed' },
    cancelled: { icon: XCircle, color: 'rose', label: 'Cancelled' },
  }

  const { icon: StatusIcon, color, label } = statusConfig[order.status]
  const showAddress = isMerchant && order.status === 'processing'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className="group relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl p-4 md:p-5 hover:border-white/[0.15] hover:bg-white/[0.04] transition-all duration-300"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/[0.08]">
            <img
              src={order.image || "/placeholder.png"}
              alt={order.name}
              className="w-full h-full object-cover"
            />
            <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
              order.type === 'physical' ? 'bg-rose-400' : 'bg-indigo-400'
            }`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-white/90 truncate">
                {order.name}
              </h3>
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium shrink-0 capitalize ${
                order.type === 'physical' 
                  ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' 
                  : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
              }`}>
                {order.type}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/50">
              <span className="font-mono">#{order.tokenId}</span>
              <span>•</span>
              <span>Qty: {order.supply}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-4 h-4 text-${color}-400`} />
            <span className={`text-sm font-medium text-${color}-300`}>
              {label}
            </span>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300">
              {order.price} ETH
            </div>
            <div className="text-xs text-white/40">{order.date}</div>
          </div>

          {showAddress && (
            <div className="md:w-48">
              <div className="text-xs text-white/40 mb-1">Buyer Address</div>
              <div className="font-mono text-xs text-white/70 bg-white/[0.03] border border-white/[0.08] rounded px-2 py-1 truncate">
                {order.buyerAddress}
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white/70 text-sm font-medium hover:border-white/[0.15] hover:text-white/90 transition-all shrink-0"
          >
            View
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default function Order() {
  const { address } = useAccount()
  const [viewMode, setViewMode] = useState<'buyer' | 'merchant'>('buyer')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [orders, setOrders] = useState<OrderType[]>([])
  const [loading, setLoading] = useState(false)

  const ORDER_MANAGER_ADDRESS = import.meta.env.VITE_ORDER_MANAGER_ADDRESS as `0x${string}`
  const ESCROW_ADDRESS = import.meta.env.VITE_ESCROW_MULTI_PRODUCT_ADDRESS as `0x${string}`
  const PRODUCT_NFT_ADDRESS = import.meta.env.VITE_PRODUCT_NFT_ADDRESS as `0x${string}`

  useEffect(() => {
    if (address) {
      loadOrders()
    }
  }, [address, viewMode])

  const mapDeliveryStatusToDisplay = (deliveryStatus: number): 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled' => {
    // DeliveryStatus enum: Pending=0, InTransit=1, Delivered=2, Failed=3
    switch (deliveryStatus) {
      case 0: return 'pending'
      case 1: return 'processing'
      case 2: return 'completed'
      case 3: return 'cancelled'
      default: return 'pending'
    }
  }

  const mapOrderStateToDisplay = (orderState: number, deliveryStatus: number): 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled' => {
    // OrderState enum: Created=0, Released=1, Cancelled=2
    if (orderState === 2) return 'cancelled'
    if (orderState === 1) return 'completed'
    return mapDeliveryStatusToDisplay(deliveryStatus)
  }

  const loadOrders = async () => {
    if (!address) return
    setLoading(true)

    try {
      console.log("🔍 Loading orders for address:", address)
      
      // Get nextOrderId to know how many orders exist
      const nextOrderId = await readContract(config, {
        address: ORDER_MANAGER_ADDRESS,
        abi: ORDER_MANAGER_ABI,
        functionName: "nextOrderId",
      }) as bigint

      const totalOrders = Number(nextOrderId)
      console.log("📦 Total orders in system:", totalOrders)

      if (totalOrders === 0) {
        setOrders([])
        setLoading(false)
        return
      }

      // Fetch all orders and filter by user
      const orderPromises: Promise<OrderType | null>[] = []

      for (let i = 0; i < totalOrders; i++) {
        orderPromises.push(
          (async () => {
            try {
              // Get order data from OrderManager
              const orderData = await readContract(config, {
                address: ORDER_MANAGER_ADDRESS,
                abi: ORDER_MANAGER_ABI,
                functionName: "getOrder",
                args: [BigInt(i)],
              }) as any

              const orderMetaData = await readContract(config, {
                address: ORDER_MANAGER_ADDRESS,
                abi: ORDER_MANAGER_ABI,
                functionName: "getOrderMeta",
                args: [BigInt(i)],
              }) as any

              // Filter based on view mode
              const isBuyerOrder = orderData.buyer.toLowerCase() === address.toLowerCase()
              const isMerchantOrder = orderData.merchant.toLowerCase() === address.toLowerCase()

              if ((viewMode === 'buyer' && !isBuyerOrder) || (viewMode === 'merchant' && !isMerchantOrder)) {
                return null
              }

              // Get escrow details for additional info
              const escrowDetails = await readContract(config, {
                address: ESCROW_ADDRESS,
                abi: ESCROW_ABI,
                functionName: "getOrderDetails",
                args: [BigInt(i)],
              }) as any

              // Get product details
              const productData = await readContract(config, {
                address: PRODUCT_NFT_ADDRESS,
                abi: PRODUCT_NFT_ABI,
                functionName: "getProduct",
                args: [orderData.tokenId],
              }) as any

              // Get product metadata for image
              let imageUrl = "/placeholder.png"
              let productName = productData.name || `Token #${orderData.tokenId}`

              try {
                const uri = await readContract(config, {
                  address: PRODUCT_NFT_ADDRESS,
                  abi: PRODUCT_NFT_ABI,
                  functionName: "uri",
                  args: [orderData.tokenId],
                }) as string

                if (uri) {
                  let cid = uri.startsWith("ipfs://") ? uri.replace("ipfs://", "") : uri
                  const metadataUrl = `https://magenta-neat-tahr-183.mypinata.cloud/ipfs/${cid}`
                  
                  const response = await fetch(metadataUrl, { signal: AbortSignal.timeout(5000) })
                  if (response.ok) {
                    const metadata = await response.json()
                    if (metadata.image) {
                      const imageCid = metadata.image.startsWith("ipfs://") 
                        ? metadata.image.replace("ipfs://", "") 
                        : metadata.image
                      imageUrl = `https://magenta-neat-tahr-183.mypinata.cloud/ipfs/${imageCid}`
                    }
                    productName = metadata.name || productName
                  }
                }
              } catch (err) {
                console.warn(`Failed to load image for order ${i}`)
              }

              // Determine product type
              const productTypeBytes = orderMetaData.productType || productData.productType
              const isPhysical = productTypeBytes.toLowerCase().includes("physical")

              // Format date
              const createdTimestamp = Number(orderData.createdAt)
              const date = new Date(createdTimestamp * 1000).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })

              // Map status
              const deliveryStatusNum = Number(orderData.deliveryStatus)
              const orderStateNum = Number(orderData.state)
              const displayStatus = mapOrderStateToDisplay(orderStateNum, deliveryStatusNum)

              return {
                id: i + 1,
                tokenId: orderData.tokenId.toString(),
                name: productName,
                price: (Number(orderMetaData.totalPrice) / 1e18).toFixed(4),
                type: isPhysical ? 'physical' : 'virtual',
                status: displayStatus,
                supply: orderMetaData.supply.toString(),
                date,
                image: imageUrl,
                buyerAddress: orderData.buyer,
                merchantAddress: orderData.merchant,
                deliveryStatus: ['Pending', 'InTransit', 'Delivered', 'Failed'][deliveryStatusNum] as DeliveryStatus,
                orderState: ['Created', 'Released', 'Cancelled'][orderStateNum] as OrderState,
              }
            } catch (err) {
              console.error(`Failed to load order ${i}:`, err)
              return null
            }
          })()
        )
      }

      const resolvedOrders = await Promise.all(orderPromises)
      const validOrders = resolvedOrders.filter((o): o is OrderType => o !== null)
      
      console.log("✅ Loaded orders:", validOrders.length)
      setOrders(validOrders)
    } catch (error) {
      console.error("❌ Failed to load orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesType = filterType === 'all' || order.type.toLowerCase() === filterType
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    const matchesSearch = order.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         order.tokenId.includes(searchQuery)
    return matchesType && matchesStatus && matchesSearch
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
  }

  if (!address) {
    return (
      <DefaultLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#030303]">
          <div className="text-center">
            <p className="text-white/60 mb-4">Please connect your wallet to view orders</p>
          </div>
        </div>
      </DefaultLayout>
    )
  }

  return (
    <DefaultLayout>
    <div className="relative min-h-screen w-full bg-[#030303]">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ElegantShape delay={0.3} width={500} height={120} rotate={12} gradient="indigo-500/[0.12]" className="left-[-8%] top-[10%]" />
        <ElegantShape delay={0.5} width={400} height={100} rotate={-15} gradient="rose-500/[0.12]" className="right-[-5%] bottom-[15%]" />
        <ElegantShape delay={0.4} width={250} height={70} rotate={-8} gradient="violet-500/[0.12]" className="left-[8%] bottom-[8%]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 py-8 md:py-12">
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
              Orders Dashboard
            </span>
          </h1>
          <p className="text-white/40 text-sm md:text-base">Manage and track your NFT transactions</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          {[
            { label: 'Total Orders', value: stats.total, color: 'indigo' },
            { label: 'Pending', value: stats.pending, color: 'amber' },
            { label: 'Processing', value: stats.processing, color: 'violet' },
            { label: 'Completed', value: stats.completed, color: 'emerald' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl p-4 hover:border-white/[0.15] transition-all"
            >
              <div className="text-white/50 text-xs md:text-sm mb-1">{stat.label}</div>
              <div className={`text-2xl md:text-3xl font-bold text-${stat.color}-300`}>{stat.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-4 md:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setViewMode('buyer')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'buyer'
                    ? 'bg-gradient-to-r from-indigo-500/20 to-rose-500/20 border-2 border-white/[0.15] text-white'
                    : 'bg-white/[0.02] border border-white/[0.08] text-white/60 hover:text-white/80'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Buyer View
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setViewMode('merchant')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'merchant'
                    ? 'bg-gradient-to-r from-indigo-500/20 to-rose-500/20 border-2 border-white/[0.15] text-white'
                    : 'bg-white/[0.02] border border-white/[0.08] text-white/60 hover:text-white/80'
                }`}
              >
                <Package className="w-4 h-4" />
                Merchant View
              </motion.button>
            </div>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search by name or token ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/[0.02] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/30 focus:border-white/[0.15] focus:outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <div className="text-xs text-white/50 flex items-center">Type:</div>
            {['all', 'virtual', 'physical'].map(type => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  filterType === type
                    ? 'bg-white/[0.1] border border-white/[0.15] text-white'
                    : 'bg-white/[0.02] border border-white/[0.06] text-white/50 hover:text-white/70'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </motion.button>
            ))}
            
            <div className="text-xs text-white/50 flex items-center ml-4">Status:</div>
            {['all', 'pending', 'processing', 'shipped', 'completed', 'cancelled'].map(status => (
              <motion.button
                key={status}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-white/[0.1] border border-white/[0.15] text-white'
                    : 'bg-white/[0.02] border border-white/[0.06] text-white/50 hover:text-white/70'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </motion.button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-white/40">
              Loading orders from blockchain...
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-white/40">
                  {orders.length === 0 
                    ? "No orders found. Start by purchasing a product!"
                    : "No orders found matching your filters"
                  }
                </div>
              ) : (
                filteredOrders.map((order, index) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    index={index}
                    isMerchant={viewMode === 'merchant'}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
    </DefaultLayout>
  )
}