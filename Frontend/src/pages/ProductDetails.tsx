import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { ShoppingCart, Heart, Share2, ExternalLink, Clock, Package, Hash, Layers, Tag, Sparkles, Calendar, CheckCircle, TrendingUp, User, Eye } from "lucide-react"
import { readContract } from "wagmi/actions"
import { config } from "@/config/config"
import MULTI_PRODUCT_ABI from "@/abis/multiProduct.json"
import DefaultLayout from "@/layouts/default"

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

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}

interface NFTDetails {
  tokenId: string;
  name: string;
  description: string;
  type: string;
  price: string;
  supply: string;
  image: string;
  category: string;
  merchant: string;
  contractAddress: string;
  isListed: boolean;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'properties' | 'activity'>('details');
  const [nft, setNft] = useState<NFTDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);

  const MULTI_PRODUCT_ADDRESS = import.meta.env.VITE_MULTI_PRODUCT_ADDRESS as `0x${string}`;

  // Log component mount
  useEffect(() => {
    window.scroll(0, 0);

    console.log("🚀 ProductDetails component mounted");
    console.log("📍 URL Parameter 'id':", id);
    console.log("🏭 Contract Address:", MULTI_PRODUCT_ADDRESS);
    
    return () => {
      console.log("🔚 ProductDetails component unmounted");
    };
  }, []);

  useEffect(() => {
    console.log("🔄 useEffect triggered - id changed:", id);
    
    if (id) {
      console.log("✅ ID exists, starting to load NFT details");
      console.log("🔍 Loading NFT details for Token ID:", id);
      loadNFTDetails(id);
    } else {
      console.log("❌ No ID found in URL params");
    }
  }, [id]);

  const loadNFTDetails = async (tokenId: string) => {
    console.log("\n═══════════════════════════════════════");
    console.log("📦 STARTING DATA FETCH");
    console.log("═══════════════════════════════════════");
    console.log("Token ID:", tokenId);
    console.log("Token ID Type:", typeof tokenId);
    console.log("Contract Address:", MULTI_PRODUCT_ADDRESS);
    console.log("Initial Loading State:", loading);
    
    setLoading(true);
    console.log("⏳ Loading state set to TRUE");
    
    try {
      // 1. Get token URI
      console.log("\n1️⃣ ═══ STEP 1: Fetching Token URI ═══");
      console.log("Calling contract function: uri(tokenId)");
      console.log("Args:", [BigInt(tokenId)]);
      
      const uri = (await readContract(config, {
        address: MULTI_PRODUCT_ADDRESS,
        abi: MULTI_PRODUCT_ABI,
        functionName: "uri",
        args: [BigInt(tokenId)],
      })) as string;
      
      console.log("✅ Token URI received:", uri);
      console.log("URI Type:", typeof uri);
      console.log("URI Length:", uri.length);

      // 2. Check if product is listed
      console.log("\n2️⃣ ═══ STEP 2: Checking Product Listing Status ═══");
      console.log("Calling contract function: isProductListed(tokenId)");
      
      const isListed = (await readContract(config, {
        address: MULTI_PRODUCT_ADDRESS,
        abi: MULTI_PRODUCT_ABI,
        functionName: "isProductListed",
        args: [BigInt(tokenId)],
      })) as boolean;
      
      console.log("✅ Is Listed:", isListed);
      console.log("Is Listed Type:", typeof isListed);

      // 3. Get product details from contract
      console.log("\n3️⃣ ═══ STEP 3: Fetching Product from Contract ═══");
      console.log("Calling contract function: mintedProduct(tokenId)");
      
      const product = (await readContract(config, {
        address: MULTI_PRODUCT_ADDRESS,
        abi: MULTI_PRODUCT_ABI,
        functionName: "mintedProduct",
        args: [BigInt(tokenId)],
      })) as any;
      
      console.log("✅ Contract Product Data:", product);
      console.log("Product Type:", typeof product);
      console.log("Product Keys:", product ? Object.keys(product) : "N/A");
      console.log("Product Merchant:", product?.merchant);
      console.log("Product Price:", product?.price);
      console.log("Product Type:", product?.productType);

      // 4. Normalize IPFS URI
      console.log("\n4️⃣ ═══ STEP 4: Normalizing IPFS URI ═══");
      console.log("Original URI:", uri);
      
      let metadataUrl = uri;
      if (uri.startsWith("ipfs://")) {
        metadataUrl = uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
        console.log("🔄 Converted IPFS protocol to gateway URL");
      } else if (!uri.startsWith("http")) {
        metadataUrl = `https://gateway.pinata.cloud/ipfs/${uri}`;
        console.log("🔄 Added gateway prefix to hash");
      } else {
        console.log("✅ URI already uses HTTP(S)");
      }
      
      console.log("✅ Final Metadata URL:", metadataUrl);

      // 5. Fetch JSON metadata
      console.log("\n5️⃣ ═══ STEP 5: Fetching JSON from IPFS ═══");
      console.log("Fetching from:", metadataUrl);
      
      const response = await fetch(metadataUrl);
      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);
      console.log("Response Headers:", Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        console.error("❌ Failed to fetch metadata");
        console.error("Status:", response.status);
        console.error("Status Text:", response.statusText);
        throw new Error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
      }
      
      const fetchedMetadata: NFTMetadata = await response.json();
      console.log("✅ Fetched Metadata:", fetchedMetadata);
      console.log("Metadata Name:", fetchedMetadata.name);
      console.log("Metadata Description Length:", fetchedMetadata.description?.length);
      console.log("Metadata Image:", fetchedMetadata.image);
      console.log("Metadata Attributes Count:", fetchedMetadata.attributes?.length);
      console.log("Metadata Attributes:", fetchedMetadata.attributes);
      
      setMetadata(fetchedMetadata);
      console.log("✅ Metadata state updated");

      // 6. Normalize image URL
      console.log("\n6️⃣ ═══ STEP 6: Normalizing Image URL ═══");
      console.log("Original Image URL:", fetchedMetadata.image);
      
      let imageUrl = fetchedMetadata.image || "";
      if (imageUrl.startsWith("ipfs://")) {
        imageUrl = imageUrl.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
        console.log("🔄 Converted image IPFS to gateway");
      }
      
      console.log("✅ Final Image URL:", imageUrl);

      // 7. Extract data from attributes and contract
      console.log("\n7️⃣ ═══ STEP 7: Extracting Attributes ═══");
      
      const priceAttr = fetchedMetadata.attributes?.find((a) => a.trait_type === "Price (ETH)");
      const typeAttr = fetchedMetadata.attributes?.find((a) => a.trait_type === "Type");
      const categoryAttr = fetchedMetadata.attributes?.find((a) => a.trait_type === "Category");
      const supplyAttr = fetchedMetadata.attributes?.find((a) => a.trait_type === "Total Supply");
      
      console.log("📊 Extracted Attributes:");
      console.log("  - Price (ETH):", priceAttr);
      console.log("  - Type:", typeAttr);
      console.log("  - Category:", categoryAttr);
      console.log("  - Total Supply:", supplyAttr);

      const nftData = {
        tokenId,
        name: fetchedMetadata.name || `Token #${tokenId}`,
        description: fetchedMetadata.description || "No description available",
        image: imageUrl,
        price: priceAttr?.value?.toString() || product.price?.toString() || "0",
        supply: supplyAttr?.value?.toString() || "0",
        type: typeAttr?.value?.toString() || product.productType || "virtual",
        category: isListed ? "Listed" : "Unlisted", // ✅ Changed from categoryAttr
        merchant: product.merchant || "Unknown",
        contractAddress: MULTI_PRODUCT_ADDRESS,
        isListed,
      };

      console.log("\n🎯 ═══ FINAL NFT DATA OBJECT ═══");
      console.log(JSON.stringify(nftData, null, 2));
      
      setNft(nftData);
      console.log("✅ NFT state updated with data");
      console.log("✅ NFT data loaded successfully!");
      
    } catch (error) {
      console.error("\n❌ ═══ ERROR OCCURRED ═══");
      console.error("Error Object:", error);
      console.error("Error Type:", typeof error);
      console.error("Error Name:", error instanceof Error ? error.name : 'Unknown');
      console.error("Error Message:", error instanceof Error ? error.message : 'Unknown error');
      console.error("Error Stack:", error instanceof Error ? error.stack : undefined);
      
      if (error instanceof Error) {
        console.error("Full Error Details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
    } finally {
      console.log("\n🏁 ═══ FINISHING UP ═══");
      console.log("Setting loading to FALSE");
      setLoading(false);
      console.log("Final Loading State:", false);
      console.log("Final NFT State:", nft);
      console.log("═══════════════════════════════════════\n");
    }
  };

  const handleBuyNow = () => {
    console.log("💳 Buy Now clicked for:", nft?.tokenId);
    alert('Redirecting to purchase page...')
  }

  const handleShare = () => {
    console.log("🔗 Share clicked, copying URL:", window.location.href);
    navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }

  // Detailed loading state check
  console.log("\n🔍 RENDER CYCLE CHECK");
  console.log("Current loading state:", loading);
  console.log("Current nft state:", nft ? "Data exists" : "No data");
  console.log("Current metadata state:", metadata ? "Exists" : "No metadata");

  if (loading) {
    console.log("⏳ ═══ RENDERING LOADING STATE ═══");
    console.log("NFT State:", nft);
    console.log("Metadata State:", metadata);
    
    return (
      <DefaultLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#030303]">
          <div className="text-center">
            <p className="text-white/60 mb-4">Loading product details...</p>
            <p className="text-white/40 text-sm">Token ID: {id}</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!nft) {
    console.log("⚠️ ═══ RENDERING NOT FOUND STATE ═══");
    console.log("Loading:", loading);
    console.log("NFT:", nft);
    
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

  console.log("🎨 ═══ RENDERING NFT DETAILS PAGE ═══");
  console.log("NFT Data:", nft);
  console.log("Metadata:", metadata);

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
                {nft.isListed && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-md border bg-emerald-500/20 border-emerald-500/30 text-emerald-200">
                      Listed
                    </span>
                  </div>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl p-4 text-center">
                  <Hash className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white/90 font-mono">#{nft.tokenId}</div>
                  <div className="text-xs text-white/40">Token ID</div>
                </div>
                <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl p-4 text-center">
                  <Layers className="w-5 h-5 text-violet-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white/90">{nft.supply}</div>
                  <div className="text-xs text-white/40">Supply</div>
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
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  nft.isListed 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                }`}>
                  {nft.category}
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
                    <span className="text-sm font-medium text-white/90 font-mono">{nft.merchant.slice(0, 10)}...</span>
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
                        <DetailRow icon={Hash} label="Contract Address" value={`${nft.contractAddress.slice(0, 10)}...${nft.contractAddress.slice(-8)}`} highlight={false} />
                        <DetailRow icon={Package} label="Token Standard" value="ERC-1155" highlight={false} />
                        <DetailRow icon={Tag} label="Blockchain" value="Ethereum" highlight={false} />
                        <DetailRow icon={Layers} label="Supply" value={nft.supply} highlight={false} />
                        <DetailRow icon={TrendingUp} label="Type" value={nft.type.toUpperCase()} highlight={true} />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'properties' && metadata?.attributes && (
                  <div>
                    <h3 className="text-base font-semibold text-white/90 mb-4">Properties & Attributes</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {metadata.attributes.map((attr, i) => (
                        <div key={i} className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4">
                          <div className="text-xs text-white/40 mb-1 uppercase">{attr.trait_type}</div>
                          <div className="text-sm font-semibold text-white/90 uppercase">{attr.value}</div>
                        </div>
                      ))}
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