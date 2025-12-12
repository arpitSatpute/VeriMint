import { motion } from "framer-motion"

type ElegantShapeProps = {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  gradient?: string
}

function ElegantShape({ 
  className, 
  delay = 0, 
  width = 400, 
  height = 100, 
  rotate = 0, 
  gradient = "from-white/[0.08]" 
}: ElegantShapeProps) {
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
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-r to-transparent backdrop-blur-[2px] border-2 border-white/[0.15] shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]" 
          style={{ 
            backgroundImage: `linear-gradient(to right, ${gradient.replace('from-', '')}, transparent)` 
          }} 
        />
      </motion.div>
    </motion.div>
  )
}

type ElegantShapesProps = {
  variant?: 'default' | 'subtle' | 'minimal'
}

/**
 * Elegant animated background shapes for consistent visual theme across pages
 * 
 * @param variant - Style preset: 'default' (animated shapes), 'subtle' (static blurs), 'minimal' (simple blurs)
 */
export default function ElegantShapes({ variant = 'default' }: ElegantShapesProps) {
  if (variant === 'subtle') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-[-6%] top-[12%] w-[480px] h-[110px] rounded-full bg-white/[0.06] blur-[60px]" />
        <div className="absolute right-[-6%] bottom-[18%] w-[380px] h-[90px] rounded-full bg-white/[0.05] blur-[60px]" />
        <div className="absolute left-[10%] bottom-[10%] w-[260px] h-[70px] rounded-full bg-white/[0.05] blur-[50px]" />
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-[-8%] top-[10%] w-[520px] h-[120px] rounded-full bg-white/[0.06] blur-[70px]" />
        <div className="absolute right-[-6%] bottom-[16%] w-[380px] h-[90px] rounded-full bg-white/[0.05] blur-[60px]" />
        <div className="absolute left-[12%] bottom-[8%] w-[260px] h-[70px] rounded-full bg-white/[0.05] blur-[50px]" />
      </div>
    )
  }

  // Default: animated shapes
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <ElegantShape 
        delay={0.3} 
        width={500} 
        height={120} 
        rotate={12} 
        gradient="indigo-500/[0.12]" 
        className="left-[-8%] top-[10%]" 
      />
      <ElegantShape 
        delay={0.5} 
        width={400} 
        height={100} 
        rotate={-15} 
        gradient="rose-500/[0.12]" 
        className="right-[-5%] bottom-[15%]" 
      />
      <ElegantShape 
        delay={0.4} 
        width={250} 
        height={70} 
        rotate={-8} 
        gradient="violet-500/[0.12]" 
        className="left-[8%] bottom-[8%]" 
      />
    </div>
  )
}
