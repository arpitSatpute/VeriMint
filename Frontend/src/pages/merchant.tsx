import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Plus, Flame, XCircle, ShoppingCart, Eye, EyeOff, Package } from "lucide-react"

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

type MerchantNFT = {
  id: number;
  name: string;
  price: string;
  type: string;
  tokenId: string;
  supply: string;
  image: string;
  description: string;
  isListed: boolean;
}

type MerchantNFTCardProps = {
  nft: MerchantNFT;
  index: number;
  onBurn: (id: number) => void;
  onList: (id: number) => void;
  onUnlist: (id: number) => void;
}

function MerchantNFTCard({ nft, index, onBurn, onList, onUnlist }: MerchantNFTCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const truncateText = (text: string, limit: number): string => {
    if (text.length <= limit) return text
    return text.substring(0, limit) + '...'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
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
          
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md border ${
              nft.type === 'Physical' 
                ? 'bg-rose-500/20 border-rose-500/30 text-rose-200' 
                : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-200'
            }`}>
              {nft.type}
            </span>

            {nft.isListed && (
              <span className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md border bg-emerald-500/20 border-emerald-500/30 text-emerald-200">
                Listed
              </span>
            )}
          </div>

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 flex flex-col justify-end"
              >
                <p className="text-white/80 text-sm leading-relaxed">
                  {nft.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-white/90 line-clamp-1 group-hover:text-white transition-colors">
              {truncateText(nft.name, 20)}
            </h3>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.08] shrink-0">
              <span className="text-xs text-white/40">#</span>
              <span className="text-xs text-white/60 font-mono">{nft.tokenId}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300">
                {nft.price}
              </span>
              <span className="text-sm text-white/40">ETH</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/40">Supply</div>
              <div className="text-sm font-semibold text-white/70">{nft.supply}</div>
            </div>
          </div>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowActions(!showActions)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500/10 to-rose-500/10 border border-white/[0.08] text-white/80 font-medium hover:border-white/[0.15] hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-rose-500/20 transition-all duration-300"
            >
              Manage NFT
            </motion.button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-[#0a0a0a] border border-white/[0.15] rounded-xl p-2 shadow-2xl z-10"
                >
                  <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    onClick={() => onBurn(nft.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-rose-300 hover:bg-rose-500/10 transition-all text-sm"
                  >
                    <Flame className="w-4 h-4" />
                    Burn NFT
                  </motion.button>

                  {nft.isListed ? (
                    <motion.button
                      whileHover={{ scale: 1.02, x: 4 }}
                      onClick={() => onUnlist(nft.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-amber-300 hover:bg-amber-500/10 transition-all text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel Listing
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02, x: 4 }}
                      onClick={() => onList(nft.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-emerald-300 hover:bg-emerald-500/10 transition-all text-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      List Product
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function MerchantDashboard() {
  const [activeView, setActiveView] = useState('all')

  const nfts = [
    {
      id: 1,
      name: "Cosmic Dreams Collection",
      price: "2.5",
      type: "Virtual",
      tokenId: "1001",
      supply: "45/100",
      image: "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=500&h=500&fit=crop",
      description: "A mesmerizing collection of cosmic artworks featuring nebulas, galaxies, and celestial phenomena captured in stunning detail.",
      isListed: true
    },
    {
      id: 2,
      name: "Abstract Reality",
      price: "1.8",
      type: "Physical",
      tokenId: "1002",
      supply: "12/50",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&h=500&fit=crop",
      description: "Physical art pieces that blend traditional and digital mediums, creating unique hybrid artworks with authenticity certificates.",
      isListed: true
    },
    {
      id: 3,
      name: "Digital Essence",
      price: "3.2",
      type: "Virtual",
      tokenId: "1003",
      supply: "78/200",
      image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500&h=500&fit=crop",
      description: "Explore the essence of digital art with this groundbreaking collection that pushes the boundaries of creative expression.",
      isListed: false
    },
    {
      id: 4,
      name: "Neon Genesis Limited Edition",
      price: "4.1",
      type: "Virtual",
      tokenId: "1004",
      supply: "23/75",
      image: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=500&h=500&fit=crop",
      description: "Vibrant neon-inspired digital artwork featuring futuristic cityscapes and retro-futuristic aesthetics in high resolution.",
      isListed: false
    },
    {
      id: 5,
      name: "Ethereal Sculpture",
      price: "5.5",
      type: "Physical",
      tokenId: "1005",
      supply: "5/25",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=500&h=500&fit=crop",
      description: "Limited edition physical sculptures with blockchain verification, each piece is handcrafted and comes with a certificate of authenticity.",
      isListed: true
    },
    {
      id: 6,
      name: "Pixel Paradise",
      price: "2.9",
      type: "Virtual",
      tokenId: "1006",
      supply: "156/300",
      image: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=500&h=500&fit=crop",
      description: "Retro pixel art meets modern design in this nostalgic collection that celebrates the golden age of gaming and digital culture.",
      isListed: true
    }
  ]

  const handleBurn = (id: number) => {
    console.log('Burning NFT:', id)
    alert(`Burn confirmation for NFT #${id}`)
  }

  const handleList = (id: number) => {
    console.log('Listing NFT:', id)
    alert(`NFT #${id} listed successfully`)
  }

  const handleUnlist = (id: number) => {
    console.log('Unlisting NFT:', id)
    alert(`NFT #${id} removed from listing`)
  }

  const handleMintRedirect = () => {
    alert('Redirecting to Mint NFT form...')
  }

  const filteredNfts = activeView === 'all' 
    ? nfts 
    : activeView === 'listed' 
    ? nfts.filter(nft => nft.isListed)
    : nfts.filter(nft => !nft.isListed)

  const stats = {
    total: nfts.length,
    listed: nfts.filter(n => n.isListed).length,
    unlisted: nfts.filter(n => !n.isListed).length,
  }

  return (
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
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold mb-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
                  Merchant Dashboard
                </span>
              </h1>
              <p className="text-white/40 text-sm md:text-base">Manage your NFT collection and listings</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMintRedirect}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-rose-500/20 border-2 border-white/[0.15] text-white font-semibold hover:from-indigo-500/30 hover:to-rose-500/30 transition-all shadow-lg shadow-indigo-500/10"
            >
              <Plus className="w-5 h-5" />
              Mint New NFT
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
          {[
            { label: 'Total NFTs', value: stats.total, icon: Package, color: 'indigo' },
            { label: 'Listed', value: stats.listed, icon: Eye, color: 'emerald' },
            { label: 'Unlisted', value: stats.unlisted, icon: EyeOff, color: 'amber' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl p-4 hover:border-white/[0.15] transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-white/50 text-xs md:text-sm">{stat.label}</div>
                <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
              </div>
              <div className={`text-2xl md:text-3xl font-bold text-${stat.color}-300`}>{stat.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-4 md:p-6 mb-6">
          <div className="flex items-center gap-3 mb-6 overflow-x-auto">
            {[
              { id: 'all', label: 'All Products', icon: Package },
              { id: 'listed', label: 'Listed Products', icon: Eye },
              { id: 'unlisted', label: 'Unlisted Products', icon: EyeOff },
            ].map((view) => (
              <motion.button
                key={view.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveView(view.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeView === view.id
                    ? 'bg-gradient-to-r from-indigo-500/20 to-rose-500/20 border-2 border-white/[0.15] text-white'
                    : 'bg-white/[0.02] border border-white/[0.08] text-white/60 hover:text-white/80 hover:border-white/[0.12]'
                }`}
              >
                <view.icon className="w-4 h-4" />
                {view.label}
              </motion.button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNfts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-white/40">
                No NFTs found in this category
              </div>
            ) : (
              filteredNfts.map((nft, index) => (
                <MerchantNFTCard
                  key={nft.id}
                  nft={nft}
                  index={index}
                  onBurn={handleBurn}
                  onList={handleList}
                  onUnlist={handleUnlist}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
  )
}