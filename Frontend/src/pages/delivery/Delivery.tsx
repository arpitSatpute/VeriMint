import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { 
  ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck, 
  MapPin, Hash, Eye, EyeOff, RefreshCw, AlertCircle, Unlock,
  ShoppingCart, Loader2, AlertTriangle, Download
} from "lucide-react"
import { useAccount } from "wagmi"
import { readContract, writeContract, waitForTransactionReceipt } from "wagmi/actions"
import { config } from "@/config/config"
import ESCROW_ABI from "@/abis/escrowMultiProduct.json"
import ORDER_MANAGER_ABI from "@/abis/orderManager.json"
import PRODUCT_NFT_ABI from "@/abis/productNft.json"
import { keccak256, encodePacked } from "viem"
import DefaultLayout from "@/layouts/default"
import ElegantShapes from "@/components/ElegantShapes"
import toast from "react-hot-toast"

interface OrderDetails {
  orderId: string
  tokenId: string
  name: string
  description: string
  image: string
  imageIpfsHash: string
  digitalAssetCid: string
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
  const [decryptionDeadline, setDecryptionDeadline] = useState<number>(0)
  const [timeRemaining, setTimeRemaining] = useState<string>("")
  const [deadlineExpired, setDeadlineExpired] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const ESCROW_ADDRESS = import.meta.env.VITE_ESCROW_MULTI_PRODUCT_ADDRESS as `0x${string}`
  const ORDER_MANAGER_ADDRESS = import.meta.env.VITE_ORDER_MANAGER_ADDRESS as `0x${string}`
  const PRODUCT_NFT_ADDRESS = import.meta.env.VITE_PRODUCT_NFT_ADDRESS as `0x${string}`

  useEffect(() => {
    loadOrderDetails()
  }, [orderId, address])

  useEffect(() => {
    if (order?.type === "physical" && orderId && address) {
      // Only fetch if user is merchant or buyer
      const isMerchantOrBuyer = 
        address.toLowerCase() === order.merchantAddress?.toLowerCase() ||
        address.toLowerCase() === order.buyerAddress?.toLowerCase()
      
      if (isMerchantOrBuyer) {
        fetchDecryptionDeadline()
      }
    }
  }, [order, orderId, address])

  useEffect(() => {
    if (decryptionDeadline > 0) {
      const updateTimer = () => {
        const now = Math.floor(Date.now() / 1000)
        const remaining = decryptionDeadline - now
        
        if (remaining <= 0) {
          setTimeRemaining("Expired")
          setDeadlineExpired(true)
        } else {
          const days = Math.floor(remaining / 86400)
          const hours = Math.floor((remaining % 86400) / 3600)
          const minutes = Math.floor((remaining % 3600) / 60)
          
          if (days > 0) {
            setTimeRemaining(`${days}d ${hours}h`)
          } else if (hours > 0) {
            setTimeRemaining(`${hours}h ${minutes}m`)
          } else {
            setTimeRemaining(`${minutes}m`)
          }
          setDeadlineExpired(false)
        }
      }
      
      updateTimer()
      const interval = setInterval(updateTimer, 60000)
      return () => clearInterval(interval)
    }
  }, [decryptionDeadline])

  const fetchDecryptionDeadline = async () => {
    if (!orderId || orderId === "0") return
    
    
    try {
      const deliveryData = await readContract(config, {
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "getEncryptedDeliveryData",
        args: [BigInt(orderId)],
      }) as any
      
      
      // deliveryData[3] is decryptionDeadline in the return tuple
      if (deliveryData && deliveryData[3]) {
        setDecryptionDeadline(Number(deliveryData[3]))
      }
    } catch (error: any) {
      // Silently ignore "No encrypted data" or authorization errors for non-encrypted orders
      const errorMsg = error?.message || ""
      if (!errorMsg.includes("No encrypted data") && !errorMsg.includes("Not authorized")) {
        toast.error("Failed to fetch decryption deadline")
      } else {
      }
    }
  }

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

      let metadata: any = { name: `Token ${tokenId}`, description: "", image: "/placeholder.png" }
      if (uri) {
        let cid = uri.startsWith("ipfs://") ? uri.replace("ipfs://", "") : uri
        const metadataUrl = `https://magenta-neat-tahr-183.mypinata.cloud/ipfs/${cid}`
        
        try {
          const res = await fetch(metadataUrl, { signal: AbortSignal.timeout(5000) })
          if (res.ok) {
            metadata = await res.json()
          } else {
          }
        } catch (error) {
        }
      }

      let imageUrl = "/placeholder.png"
      let imageIpfsHash = ""
      if (metadata.image) {
        let imageCid = metadata.image.startsWith("ipfs://") 
          ? metadata.image.replace("ipfs://", "") 
          : metadata.image
        imageIpfsHash = imageCid
        const imgUrl = `https://magenta-neat-tahr-183.mypinata.cloud/ipfs/${imageCid}`
        
        try {
          const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(5000) })
          if (imgRes.ok) {
            const blob = await imgRes.blob()
            imageUrl = URL.createObjectURL(blob)
          } else {
          }
        } catch (error) {
        }
      }

      let type = "virtual"
      let digitalAssetCid = ""
      if (metadata.attributes) {
        const typeAttr = metadata.attributes.find((a: any) => 
          a.trait_type?.toLowerCase() === "type"
        )
        if (typeAttr) {
          type = String(typeAttr.value).toLowerCase().includes("physical") ? "physical" : "virtual"
        }
      }
      
      // Extract digital asset CID if present
      if (metadata.digital_asset) {
        digitalAssetCid = metadata.digital_asset.startsWith("ipfs://") 
          ? metadata.digital_asset.replace("ipfs://", "") 
          : metadata.digital_asset
      } else {
      }

      // Check if this is a virtual or no-delivery order
      const nullHash = keccak256(encodePacked(['string'], ['null']))
      const isVirtualOrNoDelivery = 
        type === "virtual" || 
        orderMeta.deliveryPointHash.toLowerCase() === nullHash.toLowerCase()
      
      
      // For virtual/no-delivery orders, auto-correct delivery status
      // If the order is Released (state 1) OR if it's funded (state 0), set status to Delivered (2)
      let correctedDeliveryStatus = Number(orderData.deliveryStatus)
      if (isVirtualOrNoDelivery) {
        const orderState = Number(orderData.state)
        // If Released or if still Created (old contract behavior)
        if ((orderState === 1 || orderState === 0) && correctedDeliveryStatus === 0) {
          correctedDeliveryStatus = 2 // Set to Delivered
        }
      }
      

      const orderDetails: OrderDetails = {
        orderId: orderId,
        tokenId: tokenId.toString(),
        name: metadata.name || `Token ${tokenId}`,
        description: metadata.description || "",
        image: imageUrl,
        imageIpfsHash: imageIpfsHash,
        digitalAssetCid: digitalAssetCid,
        price: (Number(orderMeta.totalPrice) / 1e18).toFixed(4),
        type,
        supply: orderMeta.supply.toString(),
        buyerAddress: orderData.buyer,
        merchantAddress: orderData.merchant,
        deliveryStatus: correctedDeliveryStatus,
        orderState: Number(orderData.state),
        createdAt: Number(orderData.createdAt),
        deliveryPointHash: orderMeta.deliveryPointHash,
      }
      

      setOrder(orderDetails)
      setIsMerchant(address?.toLowerCase() === orderDetails.merchantAddress?.toLowerCase())
    } catch (error) {
      toast.error("Failed to load order")
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
    
    // Validate: Can only update if physical product and not completed/cancelled
    if (order.type !== "physical") {
      toast.error("Only physical products can have delivery status updates")
      return
    }
    
    if (order.orderState !== 0) {
      toast.error("Cannot update status for completed or cancelled orders")
      return
    }
    
    setUpdating(true)

    try {
      
      const tx = await writeContract(config, {
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "updateDelivery",
        args: [BigInt(order.orderId), newStatus],
        gas: 300000n,
      })

      await waitForTransactionReceipt(config, { hash: tx })
      
      toast.success("Status updated successfully")
      await loadOrderDetails()
    } catch (error: any) {
      toast.error("Failed to update status")
      const errorMsg = error?.message || error?.shortMessage || "Unknown error"
      toast.error(`Failed to update status: ${errorMsg}`)
    } finally {
      setUpdating(false)
    }
  }

  const confirmDelivery = async () => {
    if (!order) return
    
    // Validate: Must be buyer, physical product, and status must be InTransit (1)
    if (order.type !== "physical") {
      toast.error("Physical products only for delivery confirmation")
      return
    }
    
    if (order.deliveryStatus !== 1) {
      toast.error("Confirm when order is in transit")
      return
    }
    
    if (order.orderState !== 0) {
      toast.error("Cannot confirm completed or cancelled orders")
      return
    }
    
    setUpdating(true)

    try {
      
      const tx = await writeContract(config, {
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "confirmDelivery",
        args: [BigInt(order.orderId)],
        gas: 500000n,
      })

      await waitForTransactionReceipt(config, { hash: tx })
      
      toast.success("Delivery confirmed! Funds released to merchant")
      await loadOrderDetails()
    } catch (error: any) {
      toast.error("Failed to confirm delivery")
      const errorMsg = error?.message || error?.shortMessage || "Unknown error"
      toast.error(`Failed to confirm delivery: ${errorMsg}`)
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
      toast.success("Order refunded successfully")
      await loadOrderDetails()
    } catch (error: any) {
      toast.error("Failed to refund")
      toast.error(`Refund failed: ${error?.message || "Unknown error"}`)
    } finally {
      setUpdating(false)
    }
  }

  const claimAutoRefund = async () => {
    if (!order || isMerchant) return
    
    if (!deadlineExpired) {
      toast.error("Decryption deadline not expired yet")
      return
    }

    if (!confirm(
      "The merchant failed to decrypt your delivery address within the deadline. " +
      "This will cancel the order and refund your payment. Continue?"
    )) {
      return
    }

    setUpdating(true)

    try {
      const tx = await writeContract(config, {
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "claimRefundAfterDeadline",
        args: [BigInt(order.orderId)],
      })

      await waitForTransactionReceipt(config, { hash: tx })
      toast.success("Refund claimed! Funds returned to wallet")
      await loadOrderDetails()
    } catch (error: any) {
      toast.error("Failed to claim refund")
      const errorMsg = error?.message || error?.shortMessage || "Unknown error"
      toast.error(`Failed to claim refund: ${errorMsg}`)
    } finally {
      setUpdating(false)
    }
  }

  const downloadDigitalAsset = async () => {
    if (!order?.digitalAssetCid || order.type !== "virtual") return
    
    
    if (isMerchant) {
      toast.error("Only buyers can download the digital asset")
      return
    }
    
    // Check if delivery is completed
    if (order.deliveryStatus !== 2) {
      toast.error("Digital asset will be available after delivery is completed")
      return
    }

    setDownloading(true)

    try {
      const ipfsUrl = `https://magenta-neat-tahr-183.mypinata.cloud/ipfs/${order.digitalAssetCid}`
      
      // Fetch the file from IPFS
      const response = await fetch(ipfsUrl)
      
      if (!response.ok) throw new Error("Failed to fetch from IPFS")
      
      const blob = await response.blob()
      
      // Determine file extension from multiple sources
      const contentType = response.headers.get("content-type") || "application/octet-stream"
      const contentDisposition = response.headers.get("content-disposition")
      
      let extension = ""
      
      // Try to get extension from content-disposition header
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          const filename = filenameMatch[1].replace(/['"]/g, '')
          const extMatch = filename.match(/\.([^.]+)$/)
          if (extMatch) {
            extension = extMatch[1].toLowerCase()
          }
        }
      }
      
      // If no extension found, determine from content-type
      if (!extension) {
        const mimeToExt: Record<string, string> = {
          // Images
          "image/jpeg": "jpg",
          "image/jpg": "jpg",
          "image/png": "png",
          "image/gif": "gif",
          "image/webp": "webp",
          "image/svg+xml": "svg",
          "image/bmp": "bmp",
          "image/tiff": "tiff",
          
          // Audio
          "audio/mpeg": "mp3",
          "audio/mp3": "mp3",
          "audio/wav": "wav",
          "audio/ogg": "ogg",
          "audio/webm": "webm",
          "audio/aac": "aac",
          "audio/flac": "flac",
          "audio/m4a": "m4a",
          
          // Video
          "video/mp4": "mp4",
          "video/mpeg": "mpeg",
          "video/webm": "webm",
          "video/ogg": "ogv",
          "video/quicktime": "mov",
          "video/x-msvideo": "avi",
          "video/x-matroska": "mkv",
          
          // Documents
          "application/pdf": "pdf",
          "application/msword": "doc",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
          "application/vnd.ms-excel": "xls",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
          "application/vnd.ms-powerpoint": "ppt",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
          "text/plain": "txt",
          "text/csv": "csv",
          "text/html": "html",
          "text/css": "css",
          "text/javascript": "js",
          "application/json": "json",
          "application/xml": "xml",
          "text/xml": "xml",
          
          // Archives
          "application/zip": "zip",
          "application/x-rar-compressed": "rar",
          "application/x-7z-compressed": "7z",
          "application/x-tar": "tar",
          "application/gzip": "gz",
          
          // 3D Models
          "model/gltf-binary": "glb",
          "model/gltf+json": "gltf",
          "model/obj": "obj",
          "model/stl": "stl",
          "model/fbx": "fbx",
          
          // Other
          "application/octet-stream": "bin",
        }
        
        extension = mimeToExt[contentType.toLowerCase()] || ""
        
        // If still no exact match, try partial match
        if (!extension) {
          if (contentType.includes("image/")) {
            extension = contentType.split("/")[1]?.split("+")[0] || "png"
          } else if (contentType.includes("audio/")) {
            extension = contentType.split("/")[1]?.split("+")[0] || "mp3"
          } else if (contentType.includes("video/")) {
            extension = contentType.split("/")[1]?.split("+")[0] || "mp4"
          } else if (contentType.includes("text/")) {
            extension = "txt"
          } else if (contentType.includes("application/")) {
            extension = "bin"
          }
        }
        
      }
      
      // Final fallback
      if (!extension) {
        extension = "file"
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const fileName = `${order.name.replace(/[^a-z0-9]/gi, '_')}_${order.tokenId}.${extension}`
      a.download = fileName
      
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
    } catch (error: any) {
      toast.error("Failed to download digital asset")
      alert(`Failed to download digital asset:\n${error?.message || "Unknown error"}`)
    } finally {
      setDownloading(false)
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
  const canConfirmDelivery = !isMerchant && 
                            order.deliveryStatus === 1 && 
                            order.type === "physical" && 
                            order.orderState === 0

  return (
    <DefaultLayout>
      <div className="relative min-h-screen w-full bg-[#030303] pb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
        
        <ElegantShapes variant="default" />

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
            <p className="text-white/40 text-sm md:text-base mb-8">Order {order.orderId}</p>
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
                      {/* Digital asset indicator */}
                      {order.type === "virtual" && order.digitalAssetCid && (
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4 text-indigo-400" />
                          <span className="text-indigo-300 text-xs">Digital Asset Available</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Download button for virtual products (buyer only, when delivered) */}
                    {!isMerchant && order.type === "virtual" && order.digitalAssetCid && order.deliveryStatus === 2 && (
                      <button
                        onClick={downloadDigitalAsset}
                        disabled={downloading}
                        className="mt-3 px-4 py-2 bg-gradient-to-r from-emerald-500/30 to-green-500/30 border-2 border-emerald-500/50 rounded-lg text-emerald-100 font-semibold hover:from-emerald-500/40 hover:to-green-500/40 hover:border-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                      >
                        {downloading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5" />
                            Download Digital Asset
                          </>
                        )}
                      </button>
                    )}
                    
                    {/* Pending download message for virtual products */}
                    {!isMerchant && order.type === "virtual" && order.digitalAssetCid && order.deliveryStatus !== 2 && (
                      <div className="mt-3 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-200 text-sm">Digital asset will be available when order is delivered</span>
                      </div>
                    )}
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

                  <p className="text-sm text-white/60 mb-4">
                    Update the delivery status as you process and ship the order.
                  </p>

                  <div className="space-y-3">
                    <button
                      onClick={() => updateOrderStatus(1)}
                      disabled={updating || order.deliveryStatus >= 1}
                      className="w-full px-4 py-3 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-300 font-medium hover:bg-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                      {order.deliveryStatus >= 1 ? "Already In Transit" : "Mark as In Transit"}
                    </button>

                    {order.deliveryStatus >= 1 && (
                      <div className="text-xs text-white/50 text-center">
                        Status is now "In Transit". Buyer can confirm delivery when received.
                      </div>
                    )}

                    <div className="border-t border-white/[0.08] pt-3 mt-3">
                      <button
                        onClick={refundOrder}
                        disabled={updating || order.orderState !== 0}
                        className="w-full px-4 py-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-300 font-medium hover:bg-rose-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Refund Order
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Buyer Auto-Refund (if deadline expired) */}
              {!isMerchant && deadlineExpired && order.type === "physical" && order.orderState === 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 backdrop-blur-sm border-2 border-rose-500/30 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-rose-300 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Decryption Deadline Expired
                  </h2>

                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-4">
                    <p className="text-sm text-rose-200 mb-2">
                      ⚠️ The merchant did not decrypt your delivery address within the 7-day deadline.
                    </p>
                    <p className="text-xs text-rose-300/70">
                      You are eligible to claim an automatic refund. The order will be cancelled and your payment will be returned to your wallet.
                    </p>
                  </div>

                  <button
                    onClick={claimAutoRefund}
                    disabled={updating}
                    className="w-full px-4 py-3 bg-rose-500/20 border-2 border-rose-500/50 rounded-xl text-rose-300 font-semibold hover:bg-rose-500/30 hover:border-rose-500/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertTriangle className="w-5 h-5" />}
                    {updating ? "Processing..." : "Claim Automatic Refund"}
                  </button>

                  <p className="text-xs text-white/40 text-center mt-3">
                    💰 Full refund of {order.price} ETH will be returned to your wallet
                  </p>
                </motion.div>
              )}

              {/* Buyer Confirm Delivery */}
              {canConfirmDelivery && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 backdrop-blur-sm border-2 border-emerald-500/30 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Confirm Delivery
                  </h2>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
                    <p className="text-sm text-emerald-200 mb-2">
                      ✅ Order is marked as "In Transit"
                    </p>
                    <p className="text-xs text-emerald-300/70">
                      Once you receive and verify the product, click below to confirm delivery and release funds to the merchant.
                    </p>
                  </div>

                  <button
                    onClick={confirmDelivery}
                    disabled={updating}
                    className="w-full px-4 py-3 bg-emerald-500/20 border-2 border-emerald-500/50 rounded-xl text-emerald-300 font-semibold hover:bg-emerald-500/30 hover:border-emerald-500/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    {updating ? "Confirming..." : "Confirm Delivery & Release Funds"}
                  </button>

                  <p className="text-xs text-white/40 text-center mt-3">
                    ⚠️ This action is irreversible and will transfer funds to the merchant
                  </p>
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
                    <span className="text-sm font-mono text-white/80">{order.orderId}</span>
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

              {/* Decryption Deadline Info */}
              {order.type === "physical" && decryptionDeadline > 0 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`backdrop-blur-sm border rounded-2xl p-6 ${
                  deadlineExpired 
                    ? 'bg-rose-500/10 border-rose-500/30' 
                    : 'bg-white/[0.02] border-white/[0.08]'
                }`}>
                  <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    deadlineExpired ? 'text-rose-300' : 'text-white/90'
                  }`}>
                    {deadlineExpired ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5 text-indigo-400" />}
                    Decryption Deadline
                  </h2>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                      <span className="text-sm text-white/50">Expires</span>
                      <span className="text-sm text-white/80">
                        {new Date(decryptionDeadline * 1000).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-white/50">Time Remaining</span>
                      <span className={`text-sm font-mono font-semibold ${
                        deadlineExpired 
                          ? 'text-rose-400' 
                          : timeRemaining.includes('d') 
                            ? 'text-emerald-400' 
                            : 'text-amber-400'
                      }`}>
                        {timeRemaining || "Calculating..."}
                      </span>
                    </div>
                  </div>

                  {deadlineExpired && !isMerchant && (
                    <div className="mt-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-lg">
                      <p className="text-xs text-rose-200">
                        ⚠️ Deadline expired. You can claim a refund above.
                      </p>
                    </div>
                  )}

                  {deadlineExpired && isMerchant && (
                    <div className="mt-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-lg">
                      <p className="text-xs text-rose-200">
                        ⚠️ Deadline expired. Buyer can now claim a refund.
                      </p>
                    </div>
                  )}

                  {!deadlineExpired && (
                    <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                      <p className="text-xs text-indigo-200">
                        {isMerchant 
                          ? '📦 Decrypt the address to get shipping details' 
                          : '⏱️ Merchant has time to decrypt your address'}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Delivery Address (Merchant Only) */}
              {isMerchant && order.type === "physical" && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-violet-400" />
                    Delivery Information
                  </h2>

                  <button
                    onClick={() => navigate(`/decrypt/${order.orderId}`)}
                    className="w-full px-4 py-3 bg-violet-500/20 border border-violet-500/30 rounded-xl text-violet-300 font-medium hover:bg-violet-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Unlock className="w-4 h-4" />
                    Decrypt Delivery Address
                  </button>

                  <div className="mt-3 text-xs text-white/50 text-center">
                    Access restricted to merchant while order is active
                  </div>
                </motion.div>
              )}

              {/* Virtual NFT Download (Buyer Only, When Delivered) */}
              
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}