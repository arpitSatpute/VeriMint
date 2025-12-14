import DefaultLayout from "@/layouts/default";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PRODUCT_NFT_ABI from "@/abis/productNft.json";
import { readContract } from "wagmi/actions";
import { config } from "@/config/config";
import ElegantShapes from "@/components/ElegantShapes";

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
  attributes?: Array<{ trait_type: string; value: string | number }>
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
    navigate(`/productDetails/${nft.tokenId}`, { 
      state: { productData: nft }
    });
  }

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/productDetails/${nft.tokenId}`, { 
      state: { productData: nft }
    });
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

export default function Product() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [nfts, setNfts] = useState<ListedNFT[]>([])
  const [loading, setLoading] = useState(false)
  const PRODUCT_NFT_ADDRESS = import.meta.env.VITE_PRODUCT_NFT_ADDRESS as `0x${string}`;

  useEffect(() => {
    loadListedNFTs();
  }, []);

  const loadListedNFTs = async () => {
    setLoading(true);

    try {
      // ✅ Properly typed response
      const response = await readContract(config, {
        address: PRODUCT_NFT_ADDRESS,
        abi: PRODUCT_NFT_ABI,
        functionName: "getAllListedProducts",
      }) as { result: [bigint[], any[]] } | [bigint[], any[]];

      // Handle both possible response formats
      let tokenIds: bigint[] = [];
      let products: any[] = [];

      if (Array.isArray(response) && response.length === 2) {
        [tokenIds, products] = response;
      } else if (response && 'result' in response) {
        [tokenIds, products] = response.result;
      } else {
        throw new Error("Invalid response format from getAllListedProducts");
      }

      if (!tokenIds || tokenIds.length === 0) {
        setNfts([]);
        setLoading(false);
        return;
      }

      // 2. For each tokenId, fetch URI and metadata
      const nftData = await Promise.all(
        tokenIds.map(async (tid, idx) => {
          try {
            const product = products[idx];

            if (!product) {
              console.warn(`⚠️ No product data for token ${tid}`);
              return null;
            }

            // Get token URI
            const uri = product.tokenURI || "";

            // Extract CID from URI
            let cid = uri;
            if (uri.startsWith("ipfs://")) {
              cid = uri.replace("ipfs://", "");
            } else if (uri.includes("ipfs/")) {
              cid = uri.split("ipfs/").pop() || uri;
            }
            
            // Normalize IPFS URI to full gateway URL
            let metadataUrl = uri;
            if (uri.startsWith("ipfs://")) {
              metadataUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
            } else if (!uri.startsWith("http")) {
              metadataUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
            }

            // Fetch JSON metadata with gateway fallback
            let metadata: NFTMetadata = {
              name: product.name || `Token #${tid}`,
              description: product.description || "No description available",
              image: "/placeholder.png",
              attributes: []
            };

            // Array of IPFS gateways to try (in order of preference)
            // Extract CID for custom Pinata gateway
            const customPinataGateway = `https://magenta-neat-tahr-183.mypinata.cloud/ipfs/${cid}`;
            const gateways = [
              customPinataGateway, // Primary: Custom Pinata gateway (Cloudflare-backed, CORS enabled)
              metadataUrl.replace("gateway.pinata.cloud", "cloudflare-ipfs.com"),
              metadataUrl.replace("https://gateway.pinata.cloud/ipfs/", "https://ipfs.io/ipfs/"),
              metadataUrl, // Original gateway as fallback
            ];

            let fetchSuccess = false;
            for (const gatewayUrl of gateways) {
              try {
                const response = await fetch(gatewayUrl, {
                  signal: AbortSignal.timeout(5000),
                  headers: { "Accept": "application/json" }
                });

                if (response.ok) {
                  const fetchedData = await response.json();
                  metadata = {
                    name: fetchedData.name || product.name || `Token #${tid}`,
                    description: fetchedData.description || product.description || "No description available",
                    image: fetchedData.image || "/placeholder.png",
                    attributes: fetchedData.attributes || []
                  };
                  fetchSuccess = true;
                  break;
                }
              } catch (err) {
                console.warn(`Token ${tid} - Failed to fetch from ${gatewayUrl}`);
                continue;
              }
            }

            if (!fetchSuccess) {
              console.warn(`Token ${tid} - Could not fetch metadata from any gateway`);
            }

            // Fetch image using URL from metadata with gateway fallback
            let imageUrl = "/placeholder.png";
            const imageSource = metadata.image;
            
            if (imageSource && imageSource !== "/placeholder.png") {
              try {
                // Extract CID from image source
                let imageCid = imageSource;
                if (imageSource.startsWith("ipfs://")) {
                  imageCid = imageSource.replace("ipfs://", "");
                } else if (imageSource.includes("ipfs/")) {
                  imageCid = imageSource.split("ipfs/").pop() || imageSource;
                }
                
                // Priority: Custom Pinata → IPFS.io → IPFS.io fallback
                const imageGateways = [
                  `https://magenta-neat-tahr-183.mypinata.cloud/ipfs/${imageCid}`, // Primary
                  `https://ipfs.io/ipfs/${imageCid}`, // Secondary
                  imageSource.startsWith("http") ? imageSource : `https://ipfs.io/ipfs/${imageCid}`, // Fallback
                ];
                
                let imageFetchSuccess = false;
                for (const imgGatewayUrl of imageGateways) {
                  try {
                    const imageResponse = await fetch(imgGatewayUrl, {
                      signal: AbortSignal.timeout(5000)
                    });
                    
                    if (imageResponse.ok) {
                      const imageBlob = await imageResponse.blob();
                      imageUrl = URL.createObjectURL(imageBlob);
                      imageFetchSuccess = true;
                      break;
                    }
                  } catch (imgErr) {
                    console.warn(`Token ${tid} - Failed to fetch image from ${imgGatewayUrl}`);
                    continue;
                  }
                }
                
                if (!imageFetchSuccess) {
                  console.warn(`Token ${tid} - Could not fetch image from any gateway`);
                  imageUrl = "/placeholder.png";
                }
              } catch (imgErr) {
                console.warn(`Token ${tid} - Image fetch error:`, imgErr);
                imageUrl = "/placeholder.png";
              }
            }

            // ✅ Get type from metadata attributes or fallback to productType
            let typeString = "virtual";
            
            // Try to find type/category from metadata attributes
            if (metadata.attributes && metadata.attributes.length > 0) {
              const typeAttr = metadata.attributes.find(
                (attr: any) => attr.trait_type?.toLowerCase() === "type" || 
                               attr.trait_type?.toLowerCase() === "category" ||
                               attr.trait_type?.toLowerCase() === "product type"
              );
              
              if (typeAttr) {
                const attrValue = String(typeAttr.value).toLowerCase();
                typeString = attrValue.includes("physical") ? "physical" : "virtual";
              } else {
                // Fallback to productType if no type attribute in metadata
                const typeBytes = product.productType;
                if (typeof typeBytes === "string") {
                  typeString = typeBytes === "0x7669727475616c0000000000000000000000000000000000000000000000000000" 
                    ? "virtual" 
                    : "physical";
                }
              }
            }

            return {
              id: idx + 1,
              tokenId: tid.toString(),
              name: product.name || metadata.name || `Token #${tid}`,
              description: product.description || metadata.description || "No description available",
              image: imageUrl,
              price: (Number(product.price) / 1e18).toFixed(4),
              type: typeString,
              merchant: product.merchant || "Unknown",
              attributes: metadata.attributes || [],
            };
          } catch (err) {
            console.error(`❌ Failed to process token ${tid}:`, err);
            return null;
          }
        })
      );

      const validNfts = nftData.filter((n) => n !== null) as ListedNFT[];
      setNfts(validNfts);
    } catch (error) {
      console.error("❌ Failed to load listed NFTs:", error);
      alert("Failed to load products. Check console for details.");
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

      <ElegantShapes variant="default" />

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