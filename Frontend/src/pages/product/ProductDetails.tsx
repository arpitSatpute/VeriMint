import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { ShoppingCart, Heart, Share2, Package, Hash, Tag, User, Eye } from "lucide-react"
import DefaultLayout from "@/layouts/default"
import { useAccount } from "wagmi"
import ElegantShapes from "@/components/ElegantShapes"
import toast from "react-hot-toast"

interface DetailRowProps {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  highlight?: boolean;
}

function DetailRow({ icon: Icon, label, value, highlight }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.06] last:border-0">
      <div className="flex items-center gap-2 text-white/50 text-sm">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </div>
      <div className={`text-sm font-medium ${highlight ? 'bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300' : 'text-white/80'}`}>
        {value}
      </div>
    </div>
  )
}

interface NFTDetails {
  id: number;
  name: string;
  description: string;
  type: string;
  price: string;
  tokenId: string;
  image: string;
  merchant: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { address } = useAccount(); // Get connected wallet address
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'properties'>('details');
  const [nft, setNft] = useState<NFTDetails | null>(null);
  const [isMerchantView, setIsMerchantView] = useState(false); // Track if merchant is viewing

  useEffect(() => {
    window.scroll(0, 0);

    // Get passed data from Product or Merchant page
    const productData = (location.state as any)?.productData;
    const merchantViewFlag = (location.state as any)?.isMerchantView;
    
    if (productData) {
      setNft(productData);
      
      // Check if this is merchant viewing their own product
      if (merchantViewFlag || (address && productData.merchant && 
          address.toLowerCase() === productData.merchant.toLowerCase())) {
        setIsMerchantView(true);
      }
    } else {
      toast.error("Product data not available")
    }

    return () => {};
  }, [id, location.state, address]);

  const handleBuyNow = () => {
    if (!nft) {
      alert('Product data not available');
      return;
    }

    // Navigate to create order page with all necessary data
    navigate(`/createOrder/${nft.tokenId}`, {
      state: {
        productData: {
          tokenId: nft.tokenId,
          name: nft.name,
          description: nft.description,
          image: nft.image,
          price: nft.price,
          type: nft.type,
          merchant: nft.merchant,
          attributes: nft.attributes,
        }
      }
    });
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }

  if (!nft) {
    return (
      <DefaultLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#030303]">
          <div className="text-center">
            <p className="text-white/60 mb-4">Product not found</p>
            <p className="text-white/40 text-sm">Token ID: {id}</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
    <div className="relative min-h-screen w-full bg-[#030303]">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

      <ElegantShapes variant="default" />

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
          
          {/* Show merchant viewing badge if applicable */}
          {isMerchantView && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/30 mb-4">
              <Eye className="w-4 h-4 text-violet-300" />
              <span className="text-sm text-violet-300 font-medium">Viewing Your Product</span>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="sticky top-6">
              <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl overflow-hidden group">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-md border capitalize ${
                    nft.type === 'physical' 
                      ? 'bg-rose-500/20 border-rose-500/30 text-rose-200' 
                      : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-200'
                  }`}>
                    {nft.type}
                  </span>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setLiked(!liked)}
                      className="p-2.5 rounded-full backdrop-blur-md bg-black/40 border border-white/[0.15] hover:bg-black/60 transition-all"
                    >
                      <Heart className={`w-5 h-5 ${liked ? 'fill-rose-400 text-rose-400' : 'text-white/80'}`} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleShare}
                      className="p-2.5 rounded-full backdrop-blur-md bg-black/40 border border-white/[0.15] hover:bg-black/60 transition-all"
                    >
                      <Share2 className="w-5 h-5 text-white/80" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl p-4 text-center">
                  <Hash className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white/90 font-mono">{nft.tokenId}</div>
                  <div className="text-xs text-white/40">Token ID</div>
                </div>
                <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl p-4 text-center">
                  <Tag className="w-5 h-5 text-rose-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white/90">{nft.price}</div>
                  <div className="text-xs text-white/40">ETH</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Title and Price */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white/90 mb-2">{nft.name}</h1>
              
              <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
                <Hash className="w-4 h-4" />
                <span className="font-mono">{nft.tokenId}</span>
              </div>

              <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl p-5">
                <div className="text-sm text-white/50 mb-1">Current Price</div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300">
                    {nft.price}
                  </span>
                  <span className="text-xl text-white/50">ETH</span>
                </div>
                
                {/* Only show Buy Now button if NOT merchant viewing their own product */}
                {!isMerchantView && (
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBuyNow}
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-rose-500/20 border-2 border-white/[0.15] text-white font-semibold hover:from-indigo-500/30 hover:to-rose-500/30 transition-all shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Buy Now
                    </motion.button>
                  </div>
                )}
                
                {/* Show merchant info message instead of buy button */}
                {isMerchantView && (
                  <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4 text-center">
                    <p className="text-sm text-violet-300">
                      This is your product. Manage it from the Merchant Dashboard.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Merchant */}
            <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
                <User className="w-3 h-3" />
                Merchant
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-rose-400" />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-white/90 font-mono">
                      {nft.merchant.length > 20 
                        ? `${nft.merchant.slice(0, 10)}...${nft.merchant.slice(-8)}`
                        : nft.merchant
                      }
                    </span>
                  </div>
                  <span className="text-xs text-white/40">Product Creator</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl overflow-hidden">
              <div className="flex border-b border-white/[0.08]">
                {(['details', 'properties'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-all capitalize ${
                      activeTab === tab
                        ? 'text-white bg-white/[0.05] border-b-2 border-indigo-500'
                        : 'text-white/50 hover:text-white/70 hover:bg-white/[0.02]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-semibold text-white/90 mb-3">Description</h3>
                      <p className="text-sm text-white/60 leading-relaxed">{nft.description}</p>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-white/90 mb-3">Details</h3>
                      <div className="space-y-1">
                        <DetailRow icon={Package} label="Token Standard" value="ERC-1155" highlight={false} />
                        <DetailRow icon={Tag} label="Blockchain" value="Ethereum" highlight={false} />
                        <DetailRow icon={Package} label="Type" value={nft.type.toUpperCase()} highlight={true} />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'properties' && nft.attributes && nft.attributes.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-white/90 mb-4">Properties & Attributes</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {nft.attributes
                        .filter((attr: any) => attr.trait_type !== "Merchant")
                        .map((attr: any, i: number) => (
                          <div key={i} className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4">
                            <div className="text-xs text-white/40 mb-1 uppercase">{attr.trait_type}</div>
                            <div className="text-sm font-semibold text-white/90 uppercase">{attr.value}</div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
    </DefaultLayout>
  )
}