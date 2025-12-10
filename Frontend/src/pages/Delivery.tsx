import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { 
  ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck, 
  MapPin, Hash, Eye, EyeOff, RefreshCw, AlertCircle,
  ShoppingCart, Loader2
} from "lucide-react"
import { useAccount } from "wagmi"
import { readContract, writeContract, waitForTransactionReceipt } from "wagmi/actions"
import { config } from "@/config/config"
import ESCROW_ABI from "@/abis/escrowMultiProduct.json"
import ORDER_MANAGER_ABI from "@/abis/orderManager.json"
import PRODUCT_NFT_ABI from "@/abis/productNft.json"
import { keccak256, encodePacked } from "viem"
import DefaultLayout from "@/layouts/default"

interface OrderDetails {
  orderId: string
  tokenId: string
  name: string
  description: string
  image: string
  price: string
  type: string
  supply: string
  buyerAddress: string
  merchantAddress: string
  deliveryStatus: number
  orderState: number
  createdAt: number
  deliveryPointHash: string
}

export default function DeliveryPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { address } = useAccount()

  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAddress, setShowAddress] = useState(false)
  const [decodedAddress, setDecodedAddress] = useState<string>("")
  const [isMerchant, setIsMerchant] = useState(false)
  const [updating, setUpdating] = useState(false)

  const ESCROW_ADDRESS = import.meta.env.VITE_ESCROW_MULTI_PRODUCT_ADDRESS as `0x${string}`
  const ORDER_MANAGER_ADDRESS = import.meta.env.VITE_ORDER_MANAGER_ADDRESS as `0x${string}`
  const PRODUCT_NFT_ADDRESS = import.meta.env.VITE_PRODUCT_NFT_ADDRESS as `0x${string}`

  useEffect(() => {
    loadOrderDetails()
  }, [orderId, address])

  const loadOrderDetails = async () => {
    if (!orderId) return
    setLoading(true)

    try {
      const passedData = (location.state as any)?.orderData

      if (passedData) {
        setOrder(passedData)
        setIsMerchant(address?.toLowerCase() === passedData.merchantAddress?.toLowerCase())
        setLoading(false)
        return
      }

      // Fetch from contracts
      const orderData = await readContract(config, {
        address: ORDER_MANAGER_ADDRESS,
        abi: ORDER_MANAGER_ABI,
        functionName: "getOrder",
        args: [BigInt(orderId)],
      }) as any

      const orderMeta = await readContract(config, {
        address: ORDER_MANAGER_ADDRESS,
        abi: ORDER_MANAGER_ABI,
        functionName: "getOrderMeta",
        args: [BigInt(orderId)],
      }) as any

      const tokenId = orderData.tokenId
      let uri = await readContract(config, {
        address: PRODUCT_NFT_ADDRESS,
        abi: PRODUCT_NFT_ABI,
        functionName: "uri",
        args: [tokenId],
      }) as string

      if (!uri || uri.trim() === "") {
        const product = await readContract(config, {
          address: PRODUCT_NFT_ADDRESS,
          abi: PRODUCT_NFT_ABI,
          functionName: "getProduct",
          args: [tokenId],
        }) as any
        uri = product.tokenURI
      }

      let metadata: any = { name: `Token #${tokenId}`, description: "", image: "/placeholder.png" }
      if (uri) {
        let cid = uri.startsWith("ipfs://") ? uri.replace("ipfs://", "") : uri
        const metadataUrl = `https://magenta-neat-tahr-183.mypinata.cloud/ipfs/${cid}`
        
        try {
          const res = await fetch(metadataUrl, { signal: AbortSignal.timeout(5000) })
          if (res.ok) metadata = await res.json()
        } catch {}
      }

      let imageUrl = "/placeholder.png"
      if (metadata.image) {
        let imageCid = metadata.image.startsWith("ipfs://") 
          ? metadata.image.replace("ipfs://", "") 
          : metadata.image
        const imgUrl = `https://magenta-neat-tahr-183.mypinata.cloud/ipfs/${imageCid}`
        
        try {
          const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(5000) })
          if (imgRes.ok) {
            const blob = await imgRes.blob()
            imageUrl = URL.createObjectURL(blob)
          }
        } catch {}
      }

      let type = "virtual"
      if (metadata.attributes) {
        const typeAttr = metadata.attributes.find((a: any) => 
          a.trait_type?.toLowerCase() === "type"
        )
        if (typeAttr) {
          type = String(typeAttr.value).toLowerCase().includes("physical") ? "physical" : "virtual"
        }
      }

      const orderDetails: OrderDetails = {
        orderId: orderId,
        tokenId: tokenId.toString(),
        name: metadata.name || `Token #${tokenId}`,
        description: metadata.description || "",
        image: imageUrl,
        price: (Number(orderMeta.totalPrice) / 1e18).toFixed(4),
        type,
        supply: orderMeta.supply.toString(),
        buyerAddress: orderData.buyer,
        merchantAddress: orderData.merchant,
        deliveryStatus: Number(orderData.deliveryStatus),
        orderState: Number(orderData.state),
        createdAt: Number(orderData.createdAt),
        deliveryPointHash: orderMeta.deliveryPointHash,
      }

      setOrder(orderDetails)
      setIsMerchant(address?.toLowerCase() === orderDetails.merchantAddress?.toLowerCase())
    } catch (error) {
      console.error("Failed to load order:", error)
      alert("Failed to load order details")
    } finally {
      setLoading(false)
    }
  }

  const decodeDeliveryAddress = () => {
    if (!order?.deliveryPointHash) return

    const nullHash = keccak256(encodePacked(['string'], ['null']))
    
    if (order.deliveryPointHash.toLowerCase() === nullHash.toLowerCase()) {
      setDecodedAddress("No shipping address (Virtual product or no shipping needed)")
      setShowAddress(true)
      return
    }

    setDecodedAddress("Delivery address is encrypted. Contact buyer directly for shipping details.")
    setShowAddress(true)
  }

  const updateOrderStatus = async (newStatus: number) => {
    if (!order || !isMerchant) return
    setUpdating(true)

    try {
      const tx = await writeContract(config, {
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "updateDelivery",
        args: [BigInt(order.orderId), newStatus],
      })

      await waitForTransactionReceipt(config, { hash: tx })
      alert("Status updated successfully!")
      await loadOrderDetails()
    } catch (error: any) {
      console.error("Failed to update status:", error)
      alert(`Failed to update status: ${error?.message || "Unknown error"}`)
    } finally {
      setUpdating(false)
    }
  }

  const confirmDelivery = async () => {
    if (!order) return
    setUpdating(true)

    try {
      const tx = await writeContract(config, {
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "confirmDelivery",
        args: [BigInt(order.orderId)],
      })

      await waitForTransactionReceipt(config, { hash: tx })
      alert("Delivery confirmed! Funds released to merchant.")
      await loadOrderDetails()
    } catch (error: any) {
      console.error("Failed to confirm delivery:", error)
      alert(`Failed to confirm: ${error?.message || "Unknown error"}`)
    } finally {
      setUpdating(false)
    }
  }

  const refundOrder = async () => {
    if (!order || !isMerchant) return
    
    if (!confirm("Are you sure you want to refund this order? This action cannot be undone.")) {
      return
    }

    setUpdating(true)

    try {
      const tx = await writeContract(config, {
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "refundToBuyer",
        args: [BigInt(order.orderId)],
      })

      await waitForTransactionReceipt(config, { hash: tx })
      alert("Order refunded successfully!")
      await loadOrderDetails()
    } catch (error: any) {
      console.error("Failed to refund:", error)
      alert(`Failed to refund: ${error?.message || "Unknown error"}`)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusInfo = (status: number) => {
    const statuses = [
      { label: "Pending", icon: Clock, color: "amber" },
      { label: "In Transit", icon: Truck, color: "indigo" },
      { label: "Delivered", icon: CheckCircle, color: "emerald" },
      { label: "Failed", icon: XCircle, color: "rose" },
    ]
    return statuses[status] || statuses[0]
  }

  const getOrderStateInfo = (state: number) => {
    const states = ["Created", "Released", "Cancelled"]
    return states[state] || "Unknown"
  }

  if (loading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#030303]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading order details...</p>
          </div>
        </div>
      </DefaultLayout>
    )
  }

  if (!order) {
    return (
      <DefaultLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#030303]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <p className="text-white/60 mb-4">Order not found</p>
            <button
              onClick={() => navigate('/order')}
              className="px-6 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white/70 hover:text-white hover:border-white/[0.15] transition-all"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </DefaultLayout>
    )
  }

  const statusInfo = getStatusInfo(order.deliveryStatus)
  const StatusIcon = statusInfo.icon
  const canUpdateStatus = isMerchant && order.type === "physical" && order.orderState === 0
  const canConfirmDelivery = !isMerchant && order.deliveryStatus === 1 && order.type === "physical"

  return (
    <DefaultLayout>
      <div className="relative min-h-screen w-full bg-[#030303] pb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

        <div className="relative z-10 container mx-auto px-4 md:px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <button
              onClick={() => navigate('/order')}
              className="flex items-center gap-2 px-4 py-2 mb-6 bg-white/[0.02] border border-white/[0.08] rounded-lg text-white/70 hover:text-white hover:border-white/[0.15] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </button>

            <h1 className="text-3xl md:text-5xl font-bold mb-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
                Order Details
              </span>
            </h1>
            <p className="text-white/40 text-sm md:text-base mb-8">Order #{order.orderId}</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product & Status */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-400" />
                  Product Information
                </h2>
                
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-white/[0.08] shrink-0">
                    <img src={order.image} alt={order.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-white/90">{order.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        order.type === 'physical'
                          ? 'bg-rose-500/20 border border-rose-500/30 text-rose-200'
                          : 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-200'
                      }`}>
                        {order.type}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 mb-3 line-clamp-2">{order.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Hash className="w-4 h-4 text-white/40" />
                        <span className="text-white/70 font-mono">{order.tokenId}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4 text-white/40" />
                        <span className="text-white/70">Qty: {order.supply}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Status Timeline */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white/90 mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-rose-400" />
                  Order Status
                </h2>

                <div className="space-y-4">
                  {[
                    { status: 0, label: "Order Placed", icon: ShoppingCart },
                    { status: 1, label: "In Transit", icon: Truck },
                    { status: 2, label: "Delivered", icon: CheckCircle },
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        order.deliveryStatus >= step.status
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                          : 'bg-white/[0.02] border-white/[0.15] text-white/30'
                      }`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${order.deliveryStatus >= step.status ? 'text-white/90' : 'text-white/40'}`}>
                          {step.label}
                        </div>
                        {order.deliveryStatus === step.status && (
                          <div className="text-xs text-indigo-400">Current Status</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {order.orderState === 2 && (
                  <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                    <div className="flex items-center gap-2 text-rose-300">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Order Cancelled</span>
                    </div>
                  </div>
                )}

                {order.orderState === 1 && (
                  <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Order Completed - Funds Released</span>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Merchant Controls */}
              {canUpdateStatus && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-violet-400" />
                    Merchant Controls
                  </h2>

                  <div className="space-y-3">
                    <button
                      onClick={() => updateOrderStatus(1)}
                      disabled={updating || order.deliveryStatus >= 1}
                      className="w-full px-4 py-3 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-300 font-medium hover:bg-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                      Mark as In Transit
                    </button>

                    <button
                      onClick={refundOrder}
                      disabled={updating || order.orderState !== 0}
                      className="w-full px-4 py-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-300 font-medium hover:bg-rose-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Refund Order
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Buyer Confirm Delivery */}
              {canConfirmDelivery && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    Confirm Delivery
                  </h2>

                  <p className="text-sm text-white/60 mb-4">
                    Once you confirm delivery, funds will be released to the merchant. Please ensure you've received the product.
                  </p>

                  <button
                    onClick={confirmDelivery}
                    disabled={updating}
                    className="w-full px-4 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 font-medium hover:bg-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Confirm Delivery
                  </button>
                </motion.div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Order Summary */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white/90 mb-4">Order Summary</h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                    <span className="text-sm text-white/50">Order ID</span>
                    <span className="text-sm font-mono text-white/80">#{order.orderId}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                    <span className="text-sm text-white/50">Status</span>
                    <div className={`flex items-center gap-2 text-sm font-medium text-${statusInfo.color}-300`}>
                      <StatusIcon className="w-4 h-4" />
                      {statusInfo.label}
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                    <span className="text-sm text-white/50">Order State</span>
                    <span className="text-sm text-white/80">{getOrderStateInfo(order.orderState)}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                    <span className="text-sm text-white/50">Created</span>
                    <span className="text-sm text-white/80">
                      {new Date(order.createdAt * 1000).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                    <span className="text-sm text-white/50">Total Price</span>
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300">
                      {order.price} ETH
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Parties */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white/90 mb-4">Parties</h2>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-white/40 mb-2">Buyer</div>
                    <div className="font-mono text-xs text-white/70 bg-white/[0.03] border border-white/[0.08] rounded px-3 py-2 break-all">
                      {order.buyerAddress}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-white/40 mb-2">Merchant</div>
                    <div className="font-mono text-xs text-white/70 bg-white/[0.03] border border-white/[0.08] rounded px-3 py-2 break-all">
                      {order.merchantAddress}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Delivery Address (Merchant Only) */}
              {isMerchant && order.type === "physical" && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-violet-400" />
                    Delivery Information
                  </h2>

                  <button
                    onClick={decodeDeliveryAddress}
                    className="w-full px-4 py-3 bg-violet-500/20 border border-violet-500/30 rounded-xl text-violet-300 font-medium hover:bg-violet-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    {showAddress ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showAddress ? "Hide Address" : "Show Delivery Info"}
                  </button>

                  {showAddress && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl"
                    >
                      <p className="text-sm text-white/70">{decodedAddress}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}