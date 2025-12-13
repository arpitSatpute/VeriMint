import { motion } from "framer-motion";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import HeroGeometric from "@/components/ui/modern-hero-section";
import DefaultLayout from "@/layouts/default";
import { cn } from "@/lib/utils";
import { 
  Shield, 
  Lock, 
  Zap, 
  Globe, 
  ShoppingBag, 
  Wallet, 
  Eye, 
  CheckCircle2,
  ArrowRight,
  Layers,
  Key,
  RefreshCw
} from "lucide-react";

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  gradient?: string
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]",
          )}
        />
      </motion.div>
    </motion.div>
  )
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true }
};

export default function IndexPage() {
  const features = [
    {
      icon: Shield,
      title: "Verified Authentication",
      description: "Every product is authenticated on-chain with immutable proof of ownership and origin.",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "Buyer addresses are encrypted. Only merchants can decrypt delivery information.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "Instant Transactions",
      description: "Fast, secure blockchain transactions with real-time order processing and confirmation.",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: Globe,
      title: "Decentralized",
      description: "No central authority. Your data, your control. Powered by Ethereum blockchain.",
      gradient: "from-rose-500 to-orange-500"
    },
    {
      icon: ShoppingBag,
      title: "Multi-Product Support",
      description: "Mint and sell both physical and virtual products as NFTs with flexible pricing.",
      gradient: "from-orange-500 to-yellow-500"
    },
    {
      icon: Wallet,
      title: "Escrow Protection",
      description: "Smart contract escrow ensures secure payment handling and dispute resolution.",
      gradient: "from-yellow-500 to-green-500"
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Connect Wallet",
      description: "Connect your Web3 wallet to access the marketplace and start buying or selling.",
      icon: Wallet
    },
    {
      step: "02",
      title: "Mint Products",
      description: "Merchants create NFTs for physical or virtual products with encrypted metadata.",
      icon: Layers
    },
    {
      step: "03",
      title: "Secure Purchase",
      description: "Buyers purchase products with funds held in smart contract escrow.",
      icon: Lock
    },
    {
      step: "04",
      title: "Delivery & Release",
      description: "After delivery confirmation, funds are released to merchant automatically.",
      icon: CheckCircle2
    }
  ];

  const securityFeatures = [
    {
      icon: Key,
      title: "End-to-End Encryption",
      description: "All sensitive data including delivery addresses are encrypted using advanced cryptography."
    },
    {
      icon: Shield,
      title: "Smart Contract Audited",
      description: "Our contracts are rigorously tested and follow industry best practices for security."
    },
    {
      icon: Eye,
      title: "Screenshot Protection",
      description: "Anti-screenshot measures protect sensitive merchant information from unauthorized capture."
    },
    {
      icon: RefreshCw,
      title: "Auto-Cleanup",
      description: "Sold-out products automatically removed from listings to maintain marketplace integrity."
    }
  ];

  return (
    <DefaultLayout>
      {/* Hero Section */}
      <HeroGeometric title1="Mint With" title2="VeriMint" />

      {/* Features Section */}
      <motion.section 
        className="py-20 px-4 relative overflow-hidden bg-[#030303]"
        {...fadeInUp}
      >
        {/* Elegant Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <ElegantShape
            delay={0.3}
            width={400}
            height={100}
            rotate={15}
            gradient="from-indigo-500/[0.08]"
            className="left-[-8%] top-[20%]"
          />
          <ElegantShape
            delay={0.6}
            width={300}
            height={80}
            rotate={-12}
            gradient="from-purple-500/[0.08]"
            className="right-[-6%] bottom-[15%]"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              {...fadeInUp}
            >
              Why Choose VeriMint?
            </motion.h2>
            <motion.p 
              className="text-white/50 text-lg max-w-2xl mx-auto"
              {...fadeInUp}
            >
              The most secure and privacy-focused NFT marketplace for physical and virtual products
            </motion.p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={index} 
                  variants={fadeInUp}
                  className="group relative"
                >
                  <div className="relative bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 h-full transition-all duration-300 hover:border-white/[0.12] hover:bg-[#0f0f0f]/50">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 p-2.5 mb-4 flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section 
        className="py-20 px-4 relative overflow-hidden bg-[#030303]"
        {...fadeInUp}
      >
        {/* Elegant Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <ElegantShape
            delay={0.4}
            width={420}
            height={105}
            rotate={-15}
            gradient="from-rose-500/[0.08]"
            className="right-[-8%] top-[25%]"
          />
          <ElegantShape
            delay={0.7}
            width={280}
            height={75}
            rotate={12}
            gradient="from-violet-500/[0.08]"
            className="left-[-6%] bottom-[20%]"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent"
              {...fadeInUp}
            >
              How It Works
            </motion.h2>
            <motion.p 
              className="text-white/50 text-lg max-w-2xl mx-auto"
              {...fadeInUp}
            >
              Simple, secure, and transparent process from listing to delivery
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  className="relative"
                  variants={fadeInUp}
                  initial="initial"
                  whileInView="whileInView"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/[0.06] mb-4">
                      <Icon className="w-6 h-6 text-indigo-400" strokeWidth={1.5} />
                    </div>
                    <div className="text-5xl font-bold text-white/[0.03] mb-2 select-none">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-white/50 text-sm">
                      {item.description}
                    </p>
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-7 left-[60%] w-[80%] h-[1px] bg-gradient-to-r from-indigo-500/30 to-transparent" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Security & Privacy Section */}
      <motion.section 
        className="py-20 px-4 relative overflow-hidden bg-[#030303]"
        {...fadeInUp}
      >
        {/* Elegant Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <ElegantShape
            delay={0.5}
            width={380}
            height={95}
            rotate={10}
            gradient="from-rose-500/[0.08]"
            className="left-[-7%] top-[30%]"
          />
          <ElegantShape
            delay={0.8}
            width={300}
            height={80}
            rotate={-14}
            gradient="from-purple-500/[0.08]"
            className="right-[-5%] bottom-[25%]"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
              {...fadeInUp}
            >
              Security & Privacy
            </motion.h2>
            <motion.p 
              className="text-white/50 text-lg max-w-2xl mx-auto"
              {...fadeInUp}
            >
              Your security and privacy are our top priorities
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  initial="initial"
                  whileInView="whileInView"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 h-full transition-all duration-300 hover:border-white/[0.12] hover:bg-[#0f0f0f]/50">
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-rose-400" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-white/50 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div 
            className="mt-12 p-8 rounded-2xl bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/[0.06]"
            {...fadeInUp}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img 
                  src="/verimint-logo.svg" 
                  alt="VeriMint Logo" 
                  className="w-12 h-12"
                />
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    Built on Blockchain Technology
                  </h3>
                  <p className="text-white/50 text-sm">
                    Every transaction is recorded on the Ethereum blockchain, ensuring transparency and trust.
                  </p>
                </div>
              </div>
              <Button
                as={Link}
                href="/docs"
                size="lg"
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shrink-0"
                endContent={<ArrowRight className="w-4 h-4" />}
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 px-4 relative overflow-hidden bg-[#030303]"
        {...fadeInUp}
      >
        {/* Elegant Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <ElegantShape
            delay={0.6}
            width={350}
            height={90}
            rotate={-12}
            gradient="from-indigo-500/[0.08]"
            className="left-[-6%] top-[35%]"
          />
          <ElegantShape
            delay={0.9}
            width={250}
            height={70}
            rotate={16}
            gradient="from-pink-500/[0.08]"
            className="right-[-7%] top-[25%]"
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            className="p-12 rounded-3xl bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/[0.06]"
            {...fadeInUp}
          >
            <div className="flex justify-center mb-6">
              <img 
                src="/verimint-logo.svg" 
                alt="VeriMint Logo" 
                className="w-16 h-16"
              />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ready to Get Started?
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-2xl mx-auto">
              Join the future of decentralized commerce. Start minting and trading products securely on the blockchain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                as={Link}
                href="/product"
                size="lg"
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium"
                endContent={<ArrowRight className="w-4 h-4" />}
              >
                Explore Marketplace
              </Button>
              <Button
                as={Link}
                href="/merchant"
                size="lg"
                variant="bordered"
                className="border-white/[0.08] text-white hover:bg-white/[0.03] hover:border-white/[0.12]"
              >
                Become a Merchant
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </DefaultLayout>
  );
}
