import { motion } from "framer-motion"
import { useState } from "react"
import { Search, Package, ShoppingBag, Clock, CheckCircle, XCircle, Truck } from "lucide-react"
import DefaultLayout from "@/layouts/default"


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
              src={order.image}
              alt={order.name}
              className="w-full h-full object-cover"
            />
            <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
              order.type === 'Physical' ? 'bg-rose-400' : 'bg-indigo-400'
            }`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-white/90 truncate">
                {order.name}
              </h3>
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium shrink-0 ${
                order.type === 'Physical' 
                  ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' 
                  : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
              }`}>
                {order.type}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/50">
              <span className="font-mono">#{order.tokenId}</span>
              <span>•</span>
              <span>Supply: {order.supply}</span>
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

export default function OrdersDashboard() {
  const [viewMode, setViewMode] = useState('buyer')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const orders: OrderType[] = [
    {
      id: 1,
      tokenId: "1001",
      name: "Cosmic Dreams #1",
      price: "2.5",
      type: "Virtual",
      status: "completed",
      supply: "10/100",
      date: "Nov 5, 2025",
      image: "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=100&h=100&fit=crop",
      buyerAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
    },
    {
      id: 2,
      tokenId: "1002",
      name: "Abstract Reality",
      price: "1.8",
      type: "Physical",
      status: "processing",
      supply: "5/50",
      date: "Nov 6, 2025",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop",
      buyerAddress: "0x8f3CF7ad21CaB27C891e93eE74b14E4D32fF1c67"
    },
    {
      id: 3,
      tokenId: "1003",
      name: "Digital Essence",
      price: "3.2",
      type: "Virtual",
      status: "pending",
      supply: "15/200",
      date: "Nov 7, 2025",
      image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=100&h=100&fit=crop",
      buyerAddress: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE"
    },
    {
      id: 4,
      tokenId: "1004",
      name: "Neon Genesis",
      price: "4.1",
      type: "Virtual",
      status: "shipped",
      supply: "8/75",
      date: "Nov 4, 2025",
      image: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=100&h=100&fit=crop",
      buyerAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
    },
    {
      id: 5,
      tokenId: "1005",
      name: "Ethereal Sculpture",
      price: "5.5",
      type: "Physical",
      status: "processing",
      supply: "3/25",
      date: "Nov 7, 2025",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=100&h=100&fit=crop",
      buyerAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    },
    {
      id: 6,
      tokenId: "1006",
      name: "Pixel Paradise",
      price: "2.9",
      type: "Virtual",
      status: "cancelled",
      supply: "12/150",
      date: "Nov 3, 2025",
      image: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=100&h=100&fit=crop",
      buyerAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA"
    }
  ]

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
            <span className="text-sm text-white/60 tracking-wide">21st.dev</span>
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

          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                No orders found matching your filters
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
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
    </DefaultLayout>
  )
}