import { motion } from "framer-motion";
import DefaultLayout from "@/layouts/default";
import { cn } from "@/lib/utils";
import { 
  Shield, 
  Lock, 
  Wallet, 
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  ArrowRight,
  ArrowDown,
  Users,
  FileText,
  Key,
  Layers,
  Zap,
  Eye,
  AlertCircle
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

export default function InfoPage() {
  const workflowSteps = [
    {
      id: 1,
      phase: "Merchant Setup",
      title: "Create & Mint Products",
      icon: Package,
      color: "indigo",
      steps: [
        "Connect wallet to VeriMint platform",
        "Create product listing with details (name, description, price)",
        "Upload product images to IPFS",
        "Mint NFT using ERC-1155 standard",
        "Set supply quantity and pricing",
        "List product on marketplace"
      ],
      techs: ["ERC-1155 NFT", "IPFS Storage", "Smart Contract"]
    },
    {
      id: 2,
      phase: "Buyer Discovery",
      title: "Browse & Select Products",
      icon: ShoppingBag,
      color: "purple",
      steps: [
        "Browse marketplace for available products",
        "View product details, pricing, and supply",
        "Check merchant reputation and history",
        "Select desired product and quantity",
        "Review total cost including gas fees"
      ],
      techs: ["Web3 Integration", "NFT Metadata", "Real-time Updates"]
    },
    {
      id: 3,
      phase: "Order Placement",
      title: "Create Order with Escrow",
      icon: Wallet,
      color: "pink",
      steps: [
        "Enter encrypted delivery address (Lit Protocol)",
        "Review order summary and terms",
        "Approve transaction on wallet",
        "Funds locked in smart contract escrow",
        "NFT supply automatically reserved",
        "Order confirmation generated on-chain"
      ],
      techs: ["Escrow Smart Contract", "Lit Protocol Encryption", "On-chain Verification"]
    },
    {
      id: 4,
      phase: "Address Decryption",
      title: "Merchant Access",
      icon: Key,
      color: "rose",
      steps: [
        "Merchant receives order notification",
        "Access encrypted delivery address page",
        "Decrypt address using Lit Protocol conditions",
        "View delivery details and instructions",
        "Prepare product for shipment",
        "Screenshot protection active during viewing"
      ],
      techs: ["Lit Protocol", "Access Control", "Privacy Protection"]
    },
    {
      id: 5,
      phase: "Delivery Process",
      title: "Shipment & Tracking",
      icon: Truck,
      color: "orange",
      steps: [
        "Merchant updates order status to 'In Transit'",
        "Shipping details recorded on-chain",
        "Buyer receives status update notification",
        "Track delivery progress",
        "Merchant marks as 'Delivered'",
        "Buyer confirms receipt"
      ],
      techs: ["State Machine", "Event Emissions", "Status Tracking"]
    },
    {
      id: 6,
      phase: "Fund Release",
      title: "Payment Settlement",
      icon: CheckCircle,
      color: "green",
      steps: [
        "Buyer confirms delivery receipt",
        "Smart contract validates confirmation",
        "Escrow releases funds to merchant",
        "NFT ownership transfers to buyer",
        "Transaction completed on blockchain",
        "Both parties receive confirmation"
      ],
      techs: ["Automated Settlement", "NFT Transfer", "Fund Distribution"]
    }
  ];

  const securityFeatures = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All delivery addresses encrypted using Lit Protocol with on-chain access control conditions."
    },
    {
      icon: Shield,
      title: "Smart Contract Escrow",
      description: "Funds secured in audited smart contracts, released only upon confirmed delivery."
    },
    {
      icon: Eye,
      title: "Screenshot Protection",
      description: "Anti-screenshot measures protect sensitive merchant information from unauthorized capture."
    },
    {
      icon: Layers,
      title: "Decentralized Storage",
      description: "Product data and images stored on IPFS for permanent, censorship-resistant access."
    }
  ];

  const roles = [
    {
      title: "For Merchants",
      icon: Users,
      benefits: [
        "Mint products as NFTs with full ownership",
        "Automatic payment escrow protection",
        "Decrypted delivery access only after payment",
        "Transparent order management system",
        "Build on-chain reputation"
      ]
    },
    {
      title: "For Buyers",
      icon: ShoppingBag,
      benefits: [
        "Purchase with cryptocurrency securely",
        "Privacy-protected delivery addresses",
        "Escrow ensures merchant accountability",
        "Own digital proof of purchase (NFT)",
        "Dispute resolution through smart contracts"
      ]
    }
  ];

  return (
    <DefaultLayout>
      {/* Hero Section */}
      <motion.section className="py-20 px-4 relative overflow-hidden bg-[#030303]" {...fadeInUp}>
        {/* Elegant Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <ElegantShape
            delay={0.3}
            width={420}
            height={105}
            rotate={12}
            gradient="from-indigo-500/[0.08]"
            className="left-[-8%] top-[20%]"
          />
          <ElegantShape
            delay={0.6}
            width={320}
            height={85}
            rotate={-15}
            gradient="from-purple-500/[0.08]"
            className="right-[-6%] top-[60%]"
          />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6"
            {...fadeInUp}
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-white/60">How VeriMint Works</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            Complete Platform Workflow
          </h1>
          
          <p className="text-white/60 text-lg leading-relaxed max-w-3xl mx-auto">
            Discover how VeriMint revolutionizes e-commerce with blockchain technology, 
            providing secure, private, and decentralized product transactions.
          </p>
        </div>
      </motion.section>

      {/* Workflow Steps */}
      <motion.section className="py-12 px-4 relative overflow-hidden bg-[#030303]" {...fadeInUp}>
        {/* Elegant Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <ElegantShape
            delay={0.4}
            width={380}
            height={95}
            rotate={-12}
            gradient="from-rose-500/[0.08]"
            className="right-[-7%] top-[15%]"
          />
          <ElegantShape
            delay={0.7}
            width={300}
            height={80}
            rotate={10}
            gradient="from-violet-500/[0.08]"
            className="left-[-5%] top-[50%]"
          />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Step-by-Step Process
            </h2>
            <p className="text-white/50">
              From product creation to final delivery - complete transparency
            </p>
          </div>

          <div className="space-y-8">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === workflowSteps.length - 1;
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Connecting Line */}
                  {!isLast && (
                    <div className="absolute left-[23px] top-[80px] w-[2px] h-[calc(100%+32px)] bg-gradient-to-b from-white/[0.15] to-transparent" />
                  )}

                  <div className="flex gap-6">
                    {/* Icon Column */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${step.color}-500/20 to-${step.color}-500/5 border border-${step.color}-500/30 flex items-center justify-center relative z-10`}>
                        <Icon className={`w-6 h-6 text-${step.color}-400`} strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 pb-8">
                      <div className="bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                              {step.phase}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                              {step.title}
                            </h3>
                          </div>
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] text-sm font-bold text-white/60">
                            {step.id}
                          </div>
                        </div>

                        {/* Steps List */}
                        <div className="space-y-2 mb-4">
                          {step.steps.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <ArrowRight className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                              <span className="text-white/60 text-sm">{item}</span>
                            </div>
                          ))}
                        </div>

                        {/* Technologies */}
                        <div className="flex flex-wrap gap-2">
                          {step.techs.map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 text-xs rounded-full bg-white/[0.03] border border-white/[0.08] text-white/60"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Security Features */}
      <motion.section className="py-20 px-4 relative overflow-hidden bg-[#030303]" {...fadeInUp}>
        {/* Elegant Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <ElegantShape
            delay={0.5}
            width={350}
            height={90}
            rotate={15}
            gradient="from-pink-500/[0.08]"
            className="left-[-6%] top-[30%]"
          />
          <ElegantShape
            delay={0.8}
            width={280}
            height={75}
            rotate={-18}
            gradient="from-rose-500/[0.08]"
            className="right-[-5%] bottom-[20%]"
          />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Security & Privacy First
            </h2>
            <p className="text-white/50">
              Multiple layers of protection ensure safe transactions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 h-full hover:border-white/[0.12] transition-all duration-300">
                    <div className="flex gap-4">
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
        </div>
      </motion.section>

      {/* Roles Benefits */}
      <motion.section className="py-20 px-4 relative overflow-hidden bg-[#030303]" {...fadeInUp}>
        {/* Elegant Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <ElegantShape
            delay={0.6}
            width={340}
            height={88}
            rotate={-10}
            gradient="from-indigo-500/[0.08]"
            className="left-[-7%] top-[25%]"
          />
          <ElegantShape
            delay={0.9}
            width={260}
            height={70}
            rotate={12}
            gradient="from-purple-500/[0.08]"
            className="right-[-6%] top-[60%]"
          />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 h-full hover:border-white/[0.12] transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-indigo-400" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-2xl font-bold text-white">
                        {role.title}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {role.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-white/60 text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Technical Stack */}
      <motion.section className="py-20 px-4 relative overflow-hidden bg-[#030303]" {...fadeInUp}>
        {/* Elegant Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <ElegantShape
            delay={0.7}
            width={300}
            height={80}
            rotate={-14}
            gradient="from-indigo-500/[0.08]"
            className="right-[-8%] top-[35%]"
          />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-indigo-400" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Powered by Cutting-Edge Technology
                </h3>
                <p className="text-white/50 text-sm">
                  VeriMint leverages the best blockchain technologies for security, privacy, and decentralization
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "Ethereum Blockchain",
                "ERC-1155 Standard",
                "Lit Protocol",
                "IPFS Storage",
                "Solidity Smart Contracts",
                "Web3 Integration"
              ].map((tech, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-white/[0.12] transition-all"
                >
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                  <span className="text-white/70 text-sm font-medium">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section className="py-20 px-4 relative overflow-hidden bg-[#030303]" {...fadeInUp}>
        {/* Elegant Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <ElegantShape
            delay={0.8}
            width={320}
            height={85}
            rotate={16}
            gradient="from-pink-500/[0.08]"
            className="left-[-6%] top-[30%]"
          />
          <ElegantShape
            delay={1.0}
            width={240}
            height={65}
            rotate={-20}
            gradient="from-purple-500/[0.08]"
            className="right-[-7%] bottom-[25%]"
          />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/[0.06] rounded-3xl p-12">
            <AlertCircle className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to Experience the Future?
            </h2>
            <p className="text-white/60 mb-8 max-w-2xl mx-auto">
              Join VeriMint today and be part of the decentralized commerce revolution
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/product"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all"
              >
                Browse Products
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/merchant"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.03] border border-white/[0.08] text-white font-medium rounded-lg hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
              >
                Start Selling
              </a>
            </div>
          </div>
        </div>
      </motion.section>
    </DefaultLayout>
  );
}
