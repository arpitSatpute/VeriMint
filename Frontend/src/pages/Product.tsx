import DefaultLayout from "@/layouts/default";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import MULTI_PRODUCT_ABI from "@/abis/multiProduct.json";
import ESCROW_MULTI_PRODUCT_ABI from "@/abis/escrowMultiProduct.json";
import { readContract, writeContract } from "wagmi/actions";
import { config } from "@/config/config";


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
        <div className="absolute inset-0 rounded-full bg-gradient-to-r to-transparent backdrop-blur-[2px] border-2 border-white/[0.15] shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] after:absolute after:inset-0 after:rounded-full after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]" style={{ backgroundImage: `linear-gradient(to right, ${gradient.replace('from-', '')}, transparent)` }} />
      </motion.div>
    </motion.div>
  )
}

type NFTCardProps = {
  nft: {
    id: number
    name: string
    price: string
    type: string
    tokenId: string
    image: string
    description: string
  }
  index?: number
}

function NFTCard({ nft, index }: NFTCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const MAX_DESCRIPTION_LENGTH = 200;
  const MULTI_PRODUCT_ADDRESS = import.meta.env.VITE_MULTI_PRODUCT_ADDRESS;
  const ESCROW_MULTI_PRODUCT_ADDRESS = import.meta.env.VITE_ESCROW_MULTI_PRODUCT_ADDRESS;
  const [tokenUri, setTokenUri] = useState("");


  const truncateDescription = (text: string, limit: number) => {
    return text.length > limit ? text.substring(0, limit) + "..." : text
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: (index ?? 0) * 0.1,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl overflow-hidden transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.04]">
        <div className="relative aspect-square overflow-hidden">
          <motion.img
            src={nft.image}
            alt={nft.name}
            className="w-full h-full object-cover"
            animate={{
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          />
          
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md border ${
              nft.type === 'Physical' 
                ? 'bg-rose-500/20 border-rose-500/30 text-rose-200' 
                : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-200'
            }`}>
              {nft.type}
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
          />

          {/* Description Overlay on Hover */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center p-4"
          >
            <p className="text-sm text-white/80 text-center line-clamp-3">
              {truncateDescription(nft.description, MAX_DESCRIPTION_LENGTH)}
            </p>
          </motion.div>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-white/90 line-clamp-1 group-hover:text-white transition-colors">
              {nft.name}
            </h3>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.08] shrink-0">
              <span className="text-xs text-white/40">#</span>
              <span className="text-xs text-white/60 font-mono">{nft.tokenId}</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300">
              {nft.price}
            </span>
            <span className="text-sm text-white/40">ETH</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500/10 to-rose-500/10 border border-white/[0.08] text-white/80 font-medium hover:border-white/[0.15] hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-rose-500/20 transition-all duration-300"
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default function NFTMarketplace() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [nft, setNft] = useState([]);
  const tokenUri = new Map<number, string>();
  const [product, setProduct] = useState([]);
  const [tokenId, setTokenId] = useState();
  const MULTI_PRODUCT_ADDRESS = import.meta.env.VITE_MULTI_PRODUCT_ADDRESS;


  useEffect(() => {
    
    const getAllListing = readContract(config, {
      address: MULTI_PRODUCT_ADDRESS,
      abi: MULTI_PRODUCT_ABI,
      functionName: "getAllListing",
    })
    

    console.log("Product Data: ", getAllListing);
    
  })

  const nfts = [
    {
      id: 1,
      name: "Cosmic Dreams #1",
      price: "2.5",
      type: "Virtual",
      tokenId: "1001",
      image: "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=500&h=500&fit=crop",
      description: "A mesmerizing digital artwork depicting cosmic wonders and ethereal dreams blending reality with imagination."
    },
    {
      id: 2,
      name: "Abstract Reality",
      price: "1.8",
      type: "Physical",
      tokenId: "1002",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&h=500&fit=crop",
      description: "Limited edition physical sculpture combining modern abstract art with traditional craftsmanship techniques."
    },
    {
      id: 3,
      name: "Digital Essence",
      price: "3.2",
      type: "Virtual",
      tokenId: "1003",
      image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500&h=500&fit=crop",
      description: "A groundbreaking digital piece that captures the very essence of existence through algorithmic beauty."
    },
    {
      id: 4,
      name: "Neon Genesis",
      price: "4.1",
      type: "Virtual",
      tokenId: "1004",
      image: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=500&h=500&fit=crop",
      description: "Vibrant neon-inspired digital art showcasing futuristic themes with cutting-edge visual effects."
    },
    {
      id: 5,
      name: "Ethereal Sculpture",
      price: "5.5",
      type: "Physical",
      tokenId: "1005",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=500&h=500&fit=crop",
      description: "Hand-crafted physical sculpture with intricate details, representing the intersection of art and soul."
    },
    {
      id: 6,
      name: "Pixel Paradise",
      price: "2.9",
      type: "Virtual",
      tokenId: "1006",
      image: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=500&h=500&fit=crop",
      description: "Retro-inspired pixel art celebrating the golden age of digital creativity with modern twists."
    }
  ]

  const filters = ['All', 'Virtual', 'Physical']

  // Filter by type and search query
  const filteredNfts = nfts.filter(nft => {
    const matchesType = activeFilter === 'All' || nft.type === activeFilter
    const matchesSearch = nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          nft.tokenId.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  return (
    <DefaultLayout>
    <div className="relative min-h-screen w-full bg-[#030303]">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="indigo-500/[0.15]"
          className="left-[-10%] top-[15%]"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="rose-500/[0.15]"
          className="right-[-5%] top-[70%]"
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="violet-500/[0.15]"
          className="left-[5%] bottom-[5%]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
              Product Page
            </span>
          </h1>
          
          <p className="text-lg text-white/40 max-w-2xl mb-8">
            Discover unique digital and physical assets on the ERC-1155 powered marketplace
          </p>

          {/* Search Bar & Filter Container - Horizontal Layout */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Filter Buttons - Left Side */}
            <div className="flex items-center gap-3 flex-wrap">
              {filters.map((filter) => (
                <motion.button
                  key={filter}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeFilter === filter
                      ? 'bg-gradient-to-r from-indigo-500/20 to-rose-500/20 border-2 border-white/[0.15] text-white'
                      : 'bg-white/[0.02] border border-white/[0.08] text-white/60 hover:text-white/80 hover:border-white/[0.12]'
                  }`}
                >
                  {filter}
                </motion.button>
              ))}
            </div>

            {/* Search Bar - Right Side */}
            <div className="w-full md:w-80">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search by name or token ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 rounded-xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] text-white placeholder-white/40 focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.04] transition-all duration-300"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results count */}
          {searchQuery && (
            <p className="text-sm text-white/40 mt-4">
              Found {filteredNfts.length} result{filteredNfts.length !== 1 ? 's' : ''}
            </p>
          )}
        </motion.div>

        {/* NFT Grid */}
        {filteredNfts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredNfts.map((nft, index) => (
              <NFTCard key={nft.id} nft={nft} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <p className="text-lg text-white/40">No NFTs found matching your search.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-6 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.15] transition-all"
            >
              Clear Search
            </button>
          </motion.div>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
    </DefaultLayout>
  )
}