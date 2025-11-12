import DefaultLayout from "@/layouts/default";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MULTI_PRODUCT_ABI from "@/abis/multiProduct.json";
import { readContract } from "wagmi/actions";
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

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}

type ListedNFT = {
  id: number
  name: string
  price: string
  type: string
  tokenId: string
  image: string
  description: string
  merchant: string
}

type NFTCardProps = {
  nft: ListedNFT
  index?: number
}

function NFTCard({ nft, index }: NFTCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate();
  const MAX_DESCRIPTION_LENGTH = 200;

  const truncateDescription = (text: string, limit: number) => {
    return text.length > limit ? text.substring(0, limit) + "..." : text
  }

  const handleCardClick = () => {
    console.log("🖱️ NFT Card clicked, navigating to:", `/product/${nft.tokenId}`);
    navigate(`/productDetails/${nft.tokenId}`);
  }

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking buy button
    console.log("💳 Buy Now clicked for token:", nft.tokenId);
    navigate(`/productDetails/${nft.tokenId}`);
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
      onClick={handleCardClick}
      className="group relative cursor-pointer"
    >
      <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl overflow-hidden transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.04]">
        <div className="relative aspect-square overflow-hidden">
          <motion.img
            src={nft.image || "/placeholder.png"}
            alt={nft.name}
            className="w-full h-full object-cover"
            animate={{
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          />
          
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md border ${
              nft.type === 'physical' 
                ? 'bg-rose-500/20 border-rose-500/30 text-rose-200' 
                : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-200'
            }`}>
              {nft.type === 'physical' ? 'Physical' : 'Virtual'}
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
          />

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
            onClick={handleBuyNowClick}
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
  const [nfts, setNfts] = useState<ListedNFT[]>([])
  const [loading, setLoading] = useState(false)
  const MULTI_PRODUCT_ADDRESS = import.meta.env.VITE_MULTI_PRODUCT_ADDRESS as `0x${string}`;

  useEffect(() => {
    loadListedNFTs();
  }, []);

  const loadListedNFTs = async () => {
    setLoading(true);

    try {
      // 1. Get all listed products
      const [listings, tokenIds, products] = (await readContract(config, {
        address: MULTI_PRODUCT_ADDRESS,
        abi: MULTI_PRODUCT_ABI,
        functionName: "getAllListing",
      })) as [any[], bigint[], any[]];

      if (!tokenIds || tokenIds.length === 0) {
        setNfts([]);
        setLoading(false);
        return;
      }

      // 2. For each tokenId, fetch URI and metadata
      const nftData = await Promise.all(
        tokenIds.map(async (tid, idx) => {
          try {
            // Get token URI
            const uri = (await readContract(config, {
              address: MULTI_PRODUCT_ADDRESS,
              abi: MULTI_PRODUCT_ABI,
              functionName: "uri",
              args: [tid],
            })) as string;

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

            // Extract data from attributes
            const priceAttr = metadata.attributes?.find((a) => a.trait_type === "Price (ETH)");
            const typeAttr = metadata.attributes?.find((a) => a.trait_type === "Type");

            return {
              id: idx + 1,
              tokenId: tid.toString(),
              name: metadata.name || `Token #${tid}`,
              description: metadata.description || "No description available",
              image: imageUrl,
              price: priceAttr?.value?.toString() || listings[idx].price?.toString() || "0",
              type: typeAttr?.value?.toString() || "virtual",
              merchant: listings[idx].merchant,
            };
          } catch (err) {
            console.error(`Failed to load metadata for token ${tid}:`, err);
            return null;
          }
        })
      );

      setNfts(nftData.filter((n) => n !== null) as ListedNFT[]);
    } catch (error) {
      console.error("Failed to load listed NFTs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filters = ['All', 'virtual', 'physical']

  // Filter by type and search query
  const filteredNfts = nfts.filter(nft => {
    const matchesType = activeFilter === 'All' || nft.type === activeFilter.toLowerCase()
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
              Product Marketplace
            </span>
          </h1>
          
          <p className="text-lg text-white/40 max-w-2xl mb-8">
            Discover unique digital and physical assets on the ERC-1155 powered marketplace
          </p>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 flex-wrap">
              {filters.map((filter) => (
                <motion.button
                  key={filter}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 capitalize ${
                    activeFilter === filter
                      ? 'bg-gradient-to-r from-indigo-500/20 to-rose-500/20 border-2 border-white/[0.15] text-white'
                      : 'bg-white/[0.02] border border-white/[0.08] text-white/60 hover:text-white/80 hover:border-white/[0.12]'
                  }`}
                >
                  {filter}
                </motion.button>
              ))}
            </div>

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

          {searchQuery && (
            <p className="text-sm text-white/40 mt-4">
              Found {filteredNfts.length} result{filteredNfts.length !== 1 ? 's' : ''}
            </p>
          )}
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-white/40">
            Loading products...
          </div>
        ) : filteredNfts.length > 0 ? (
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