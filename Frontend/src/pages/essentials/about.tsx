import { motion } from "framer-motion";
import DefaultLayout from "@/layouts/default";
import { cn } from "@/lib/utils";
import { 
  Shield, 
  Target, 
  Users, 
  Zap, 
  Heart,
  Sparkles,
  Globe,
  Award,
  TrendingUp,
  CheckCircle
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

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: "Security First",
      description: "We prioritize the security and privacy of every transaction, implementing industry-leading encryption and smart contract standards."
    },
    {
      icon: Heart,
      title: "User-Centric",
      description: "Our platform is designed with users in mind, providing intuitive interfaces for both merchants and buyers."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Constantly pushing the boundaries of what's possible with blockchain technology in e-commerce."
    },
    {
      icon: Globe,
      title: "Decentralization",
      description: "Empowering users with full control over their data and transactions without centralized intermediaries."
    }
  ];

  const milestones = [
    {
      year: "2024",
      title: "Platform Launch",
      description: "VeriMint officially launches with core NFT marketplace functionality."
    },
    {
      year: "2024",
      title: "Lit Protocol Integration",
      description: "Enhanced privacy with encrypted delivery addresses and access control."
    },
    {
      year: "2025",
      title: "Growing Community",
      description: "Building a thriving ecosystem of merchants and buyers on blockchain."
    }
  ];

  const stats = [
    { number: "100%", label: "Decentralized" },
    { number: "24/7", label: "Availability" },
    { number: "ERC-1155", label: "NFT Standard" },
    { number: "∞", label: "Possibilities" }
  ];

  return (
    <DefaultLayout>
      {/* Hero Section */}
      <motion.section className="py-12 md:py-20 px-4 relative overflow-hidden bg-[#030303]" {...fadeInUp}>
        {/* Elegant Shapes - Hidden on mobile */}
        <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
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
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-white/60">About VeriMint</span>
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            Revolutionizing E-Commerce
          </h1>
          
          <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
            VeriMint is a decentralized NFT marketplace that bridges physical and virtual products 
            with blockchain technology, ensuring security, privacy, and transparency in every transaction.
          </p>
        </div>
      </motion.section>

      {/* Mission & Vision */}
      <motion.section className="py-12 md:py-20 px-4 relative overflow-hidden bg-[#030303]" {...fadeInUp}>
        {/* Elegant Shapes - Hidden on mobile */}
        <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
          <ElegantShape
            delay={0.4}
            width={380}
            height={95}
            rotate={-12}
            gradient="from-rose-500/[0.08]"
            className="right-[-7%] top-[25%]"
          />
          <ElegantShape
            delay={0.7}
            width={300}
            height={80}
            rotate={10}
            gradient="from-violet-500/[0.08]"
            className="left-[-5%] bottom-[20%]"
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 md:p-8 h-full hover:border-white/[0.12] transition-all duration-300">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 flex items-center justify-center mb-6">
                  <Target className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Our Mission</h2>
                <p className="text-white/60 text-sm md:text-base leading-relaxed">
                  To create a secure, decentralized marketplace where anyone can mint, buy, and sell 
                  products as NFTs while maintaining complete privacy and control over their transactions. 
                  We aim to eliminate traditional e-commerce limitations through blockchain innovation.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 md:p-8 h-full hover:border-white/[0.12] transition-all duration-300">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30 flex items-center justify-center mb-6">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-400" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Our Vision</h2>
                <p className="text-white/60 text-sm md:text-base leading-relaxed">
                  To become the leading decentralized platform for product commerce, where blockchain 
                  technology empowers merchants and buyers with unprecedented security, transparency, 
                  and freedom. We envision a future where all commerce is trustless and private.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Core Values */}
      <motion.section className="py-12 md:py-20 px-4 relative overflow-hidden bg-[#030303]" {...fadeInUp}>
        {/* Elegant Shapes - Hidden on mobile */}
        <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
          <ElegantShape
            delay={0.5}
            width={350}
            height={90}
            rotate={15}
            gradient="from-pink-500/[0.08]"
            className="left-[-6%] top-[30%]"
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Our Core Values
            </h2>
            <p className="text-white/50 text-sm md:text-base">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 h-full hover:border-white/[0.12] transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-indigo-400" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {value.title}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.section className="py-12 md:py-20 px-4 relative overflow-hidden bg-[#030303]" {...fadeInUp}>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-white/50 text-xs sm:text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Timeline */}
      <motion.section className="py-12 md:py-20 px-4 relative overflow-hidden bg-[#030303]" {...fadeInUp}>
        {/* Elegant Shapes - Hidden on mobile */}
        <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
          <ElegantShape
            delay={0.8}
            width={320}
            height={85}
            rotate={-18}
            gradient="from-indigo-500/[0.08]"
            className="right-[-7%] top-[40%]"
          />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">
              Our Journey
            </h2>
            <p className="text-white/50 text-sm md:text-base">
              Key milestones in VeriMint's evolution
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 md:gap-6"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 flex items-center justify-center">
                    <Award className="w-6 h-6 md:w-8 md:h-8 text-indigo-400" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4 md:p-6 hover:border-white/[0.12] transition-all duration-300">
                    <div className="text-sm font-semibold text-indigo-400 mb-2">
                      {milestone.year}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section className="py-12 md:py-20 px-4 relative overflow-hidden bg-[#030303]" {...fadeInUp}>
        {/* Elegant Shapes - Hidden on mobile */}
        <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
          <ElegantShape
            delay={0.9}
            width={300}
            height={80}
            rotate={12}
            gradient="from-purple-500/[0.08]"
            className="left-[-6%] top-[35%]"
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/[0.06] rounded-3xl p-8 md:p-12">
            <Users className="w-12 h-12 md:w-16 md:h-16 text-indigo-400 mx-auto mb-6" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">
              Join Our Community
            </h2>
            <p className="text-white/60 text-sm md:text-base mb-8 max-w-2xl mx-auto">
              Be part of the decentralized commerce revolution. Start minting, buying, or selling on VeriMint today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/product"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all"
              >
                Get Started
              </a>
              <a
                href="/info"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.03] border border-white/[0.08] text-white font-medium rounded-lg hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </motion.section>
    </DefaultLayout>
  );
}
