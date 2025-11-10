import { motion } from "framer-motion"
import { useState, type ComponentType } from "react"
import { ShoppingCart, Heart, Share2, ExternalLink, Clock, Package, Hash, Layers, Tag, Sparkles, Calendar, CheckCircle, TrendingUp, User, Eye } from "lucide-react"

type ElegantShapeProps = {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}

function ElegantShape({ className = '', delay = 0, width = 400, height = 100, rotate = 0, gradient = "from-white/[0.08]" }: ElegantShapeProps) {
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

interface DetailRowProps {
  icon?: ComponentType<React.SVGProps<SVGSVGElement>>;
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

type RarityType = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

interface PropertyCardProps {
  name: string;
  value: string;
  rarity: RarityType;
}

function PropertyCard({ name, value, rarity }: PropertyCardProps) {
  const rarityColors: Record<RarityType, string> = {
    common: 'from-gray-500/20 to-gray-600/20 border-gray-500/30',
    uncommon: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30',
    rare: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30',
    epic: 'from-violet-500/20 to-violet-600/20 border-violet-500/30',
    legendary: 'from-amber-500/20 to-amber-600/20 border-amber-500/30',
  }

  return (
    <div className={`bg-gradient-to-br ${rarityColors[rarity]} border rounded-xl p-4`}>
      <div className="text-xs text-white/40 uppercase tracking-wide mb-1">{name}</div>
      <div className="text-base font-semibold text-white/90">{value}</div>
      <div className="text-xs text-white/50 mt-1 capitalize">{rarity}</div>
    </div>
  )
}

type ActivityType = 'minted' | 'sale' | 'transfer' | 'listed';

interface ActivityItemProps {
  type: ActivityType;
  from?: string | null;
  to?: string | null;
  price?: string | null;
  date: string;
}

function ActivityItem({ type, from, to, price, date }: ActivityItemProps) {
  const typeConfig: Record<ActivityType, { icon: ComponentType<React.SVGProps<SVGSVGElement>>; color: string; label: string }> = {
    minted: { icon: Sparkles, color: 'indigo', label: 'Minted' },
    sale: { icon: ShoppingCart, color: 'emerald', label: 'Sale' },
    transfer: { icon: TrendingUp, color: 'violet', label: 'Transfer' },
    listed: { icon: Tag, color: 'amber', label: 'Listed' },
  }

  const { icon: Icon, color, label } = typeConfig[type]

  return (
    <div className="flex items-start gap-4 py-4 border-b border-white/[0.06] last:border-0">
      <div className={`p-2 rounded-lg bg-${color}-500/10 border border-${color}-500/20 shrink-0`}>
        <Icon className={`w-4 h-4 text-${color}-400`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-medium text-${color}-300`}>{label}</span>
          {price && (
            <span className="text-sm font-bold text-white/90">{price} ETH</span>
          )}
        </div>
        <div className="text-xs text-white/40 space-y-0.5">
          {from && <div>From: <span className="font-mono text-white/60">{from}</span></div>}
          {to && <div>To: <span className="font-mono text-white/60">{to}</span></div>}
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" />
            {date}
          </div>
        </div>
      </div>
    </div>
  )
}

interface CreatorType {
  name: string;
  address: string;
  verified: boolean;
}

interface OwnerType {
  name: string;
  address: string;
}

interface DetailsType {
  contractAddress: string;
  tokenStandard: string;
  blockchain: string;
  mintDate: string;
  royalties: string;
  views: string;
  favorites: string;
}

interface PhysicalType {
  dimensions: string;
  weight: string;
  material: string;
  condition: string;
  shipping: string;
  warranty: string;
}

interface ActivityHistoryItem {
  type: ActivityType;
  from?: string;
  to?: string | null;
  price?: string | null;
  date: string;
}

interface NFTType {
  tokenId: string;
  name: string;
  description: string;
  type: 'Physical' | 'Virtual';
  price: string;
  supply: string;
  maxSupply: string;
  image: string;
  category: string;
  rarity: RarityType;
  creator: CreatorType;
  owner: OwnerType;
  details: DetailsType;
  properties: PropertyCardProps[];
  physical: PhysicalType;
  activity: ActivityHistoryItem[];
}

export default function ProductDetails() {
  const [liked, setLiked] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'details' | 'properties' | 'activity'>('details')

  // Mock NFT data
  const nft: NFTType = {
    tokenId: "1002",
    name: "Abstract Reality Masterpiece",
    description: "A unique physical art piece that seamlessly blends traditional painting techniques with digital augmentation. Each piece is handcrafted by renowned artist Maria Santos and comes with a certificate of authenticity on the blockchain. The artwork features vibrant colors and abstract patterns that create a mesmerizing visual experience.",
    type: "Physical",
    price: "1.8",
    supply: "12",
    maxSupply: "50",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop",
    category: "Art & Collectibles",
    rarity: "Rare" as RarityType,
    creator: {
      name: "Maria Santos",
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      verified: true
    },
    owner: {
      name: "ArtCollector.eth",
      address: "0x8f3CF7ad21CaB27C891e93eE74b14E4D32fF1c67"
    },
    details: {
      contractAddress: "0x495f947276749ce646f68ac8c248420045cb7b5e",
      tokenStandard: "ERC-1155",
      blockchain: "Ethereum",
      mintDate: "November 1, 2025",
      royalties: "10%",
      views: "2,847",
      favorites: "142"
    },
    properties: [
      { name: "Background", value: "Abstract", rarity: "common" },
      { name: "Style", value: "Contemporary", rarity: "uncommon" },
      { name: "Medium", value: "Mixed Media", rarity: "rare" },
      { name: "Frame", value: "Gallery", rarity: "epic" },
      { name: "Signature", value: "Original", rarity: "legendary" }
    ],
    physical: {
      dimensions: "60cm × 80cm × 5cm",
      weight: "3.5 kg",
      material: "Canvas, Acrylic, Digital Enhancement",
      condition: "New",
      shipping: "Worldwide shipping available",
      warranty: "2 years authenticity guarantee"
    },
    activity: [
      { type: 'minted', from: '0x742d...0bEb', to: null, price: null, date: 'Nov 1, 2025' },
      { type: 'listed', from: '0x742d...0bEb', to: null, price: '1.8', date: 'Nov 2, 2025' },
      { type: 'sale', from: '0x742d...0bEb', to: '0x8f3C...1c67', price: '1.5', date: 'Nov 3, 2025' },
      { type: 'transfer', from: '0x8f3C...1c67', to: '0x95aD...4cE', price: null, date: 'Nov 5, 2025' }
    ]
  }

  const handleBuyNow = () => {
    alert('Redirecting to purchase page...')
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }

  return (
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
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-md border ${
                    nft.type === 'Physical' 
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
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl p-4 text-center">
                  <Eye className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white/90">{nft.details.views}</div>
                  <div className="text-xs text-white/40">Views</div>
                </div>
                <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl p-4 text-center">
                  <Heart className="w-5 h-5 text-rose-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white/90">{nft.details.favorites}</div>
                  <div className="text-xs text-white/40">Favorites</div>
                </div>
                <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl p-4 text-center">
                  <Layers className="w-5 h-5 text-violet-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white/90">{nft.supply}/{nft.maxSupply}</div>
                  <div className="text-xs text-white/40">Supply</div>
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
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-violet-500/10 border border-violet-500/20 text-violet-300">
                  {nft.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {nft.rarity}
                </span>
              </div>

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
              </div>
            </div>

            {/* Creator and Owner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
                  <User className="w-3 h-3" />
                  Creator
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-rose-400" />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-white/90">{nft.creator.name}</span>
                      {nft.creator.verified && (
                        <CheckCircle className="w-3 h-3 text-indigo-400" />
                      )}
                    </div>
                    <span className="text-xs text-white/40 font-mono">{nft.creator.address.slice(0, 10)}...</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
                  <User className="w-3 h-3" />
                  Current Owner
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-400 to-amber-400" />
                  <div>
                    <div className="text-sm font-medium text-white/90">{nft.owner.name}</div>
                    <span className="text-xs text-white/40 font-mono">{nft.owner.address.slice(0, 10)}...</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl overflow-hidden">
              <div className="flex border-b border-white/[0.08]">
                {(['details', 'properties', 'activity'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
                      activeTab === tab
                        ? 'text-white bg-white/[0.05] border-b-2 border-indigo-500'
                        : 'text-white/50 hover:text-white/70 hover:bg-white/[0.02]'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                        <DetailRow icon={Hash} label="Contract Address" value={`${nft.details.contractAddress.slice(0, 10)}...${nft.details.contractAddress.slice(-8)}`} highlight={false} />
                        <DetailRow icon={Package} label="Token Standard" value={nft.details.tokenStandard} highlight={false} />
                        <DetailRow icon={Tag} label="Blockchain" value={nft.details.blockchain} highlight={false} />
                        <DetailRow icon={Calendar} label="Mint Date" value={nft.details.mintDate} highlight={false} />
                        <DetailRow icon={TrendingUp} label="Royalties" value={nft.details.royalties} highlight={true} />
                      </div>
                    </div>

                    {nft.type === 'Physical' && (
                      <div>
                        <h3 className="text-base font-semibold text-white/90 mb-3">Physical Details</h3>
                        <div className="space-y-1">
                          <DetailRow icon={Package} label="Dimensions" value={nft.physical.dimensions} highlight={false} />
                          <DetailRow icon={Package} label="Weight" value={nft.physical.weight} highlight={false} />
                          <DetailRow icon={Tag} label="Material" value={nft.physical.material} highlight={false} />
                          <DetailRow icon={CheckCircle} label="Condition" value={nft.physical.condition} highlight={false} />
                          <DetailRow icon={Package} label="Shipping" value={nft.physical.shipping} highlight={false} />
                          <DetailRow icon={CheckCircle} label="Warranty" value={nft.physical.warranty} highlight={false} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'properties' && (
                  <div>
                    <h3 className="text-base font-semibold text-white/90 mb-4">Properties & Attributes</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {nft.properties.map((prop, i) => (
                        <PropertyCard key={i} {...prop} />
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div>
                    <h3 className="text-base font-semibold text-white/90 mb-4">Activity History</h3>
                    <div className="space-y-2">
                      {nft.activity.map((item, i) => (
                        <ActivityItem key={i} {...item} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contract Link */}
            <a
              href="#"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-sm text-white/60 hover:text-white/90 hover:border-white/[0.15] transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              View on Etherscan
            </a>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
  )
}