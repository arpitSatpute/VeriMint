import { motion } from "framer-motion";
import DefaultLayout from "@/layouts/default";
import { cn } from "@/lib/utils";
import { 
  Mail, 
  MessageSquare, 
  Send,
  Github,
  Twitter,
  Globe,
  Clock
} from "lucide-react";
import { useState } from "react";

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

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct mailto link with form data
    const subject = encodeURIComponent(formData.subject);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    
    // Open user's email client
    window.location.href = `mailto:arpitrameshsatpute6986@gmail.com?subject=${subject}&body=${body}`;
    
    // Optional: Reset form after a short delay
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "arpitrameshsatpute6986@gmail.com",
      href: "mailto:arpitrameshsatpute6986@gmail.com"
    },
    {
      icon: Globe,
      title: "Website",
      value: "portfolio-arpit-satpute.vercel.app",
      href: "https://portfolio-arpit-satpute.vercel.app"
    },
    {
      icon: Clock,
      title: "Response Time",
      value: "Within 24 hours",
      href: null
    }
  ];

  const socialLinks = [
    {
      icon: Github,
      name: "GitHub",
      username: "@arpitSatpute",
      href: "https://github.com/arpitSatpute",
    },
    {
      icon: Twitter,
      name: "X (Twitter)",
      username: "@arpits_jsx",
      href: "https://twitter.com/arpits_jsx",
    },
  ];

  return (
    <DefaultLayout>
      {/* Hero Section */}
      <motion.section className="py-12 md:py-20 px-4 relative overflow-hidden bg-[#030303]" {...fadeInUp}>
        {/* Elegant Shapes - Hidden on mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
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
            className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4 md:mb-6"
            {...fadeInUp}
          >
            <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-400" />
            <span className="text-xs md:text-sm text-white/60">Get in Touch</span>
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent px-4">
            Contact Us
          </h1>
          
          <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-3xl mx-auto px-4">
            Have questions about VeriMint? We're here to help. Reach out to our team 
            and we'll get back to you as soon as possible.
          </p>
        </div>
      </motion.section>

      {/* Contact Form & Info */}
      <motion.section className="py-12 md:py-20 px-4 relative overflow-hidden bg-[#030303]" {...fadeInUp}>
        {/* Elegant Shapes - Hidden on mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/[0.06] rounded-xl md:rounded-2xl p-6 md:p-8">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Send us a Message</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white text-sm md:text-base placeholder-white/40 focus:outline-none focus:border-indigo-500 transition-all"
                          placeholder="Your name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white text-sm md:text-base placeholder-white/40 focus:outline-none focus:border-indigo-500 transition-all"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-white/70 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white text-sm md:text-base placeholder-white/40 focus:outline-none focus:border-indigo-500 transition-all"
                        placeholder="How can we help?"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-white/70 mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={5}
                        className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white text-sm md:text-base placeholder-white/40 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                        placeholder="Tell us more about your inquiry..."
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-6 py-2.5 md:py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm md:text-base font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      Send Message
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4 md:space-y-6 order-1 lg:order-2">
              {/* Contact Details */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/[0.06] rounded-xl md:rounded-2xl p-5 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">Contact Information</h3>
                  
                  <div className="space-y-3 md:space-y-4">
                    {contactInfo.map((info, index) => {
                      const Icon = info.icon;
                      return (
                        <div key={index} className="flex items-start gap-3 md:gap-4">
                          <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs md:text-sm text-white/50 mb-1">{info.title}</div>
                            {info.href ? (
                              <a 
                                href={info.href}
                                className="text-white text-sm md:text-base hover:text-indigo-400 transition-colors break-words"
                              >
                                {info.value}
                              </a>
                            ) : (
                              <div className="text-white text-sm md:text-base break-words">{info.value}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/[0.06] rounded-xl md:rounded-2xl p-5 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">Follow Us</h3>
                  
                  <div className="space-y-2 md:space-y-3">
                    {socialLinks.map((social, index) => {
                      const Icon = social.icon;
                      return (
                        <a
                          key={index}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2.5 md:p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-white/[0.12] hover:bg-white/[0.04] transition-all group"
                        >
                          <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.06] transition-all flex-shrink-0">
                            <Icon className="w-4 h-4 md:w-5 md:h-5 text-white/70 group-hover:text-white transition-colors" strokeWidth={1.5} />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-white text-sm md:text-base font-medium group-hover:text-indigo-400 transition-colors truncate">
                              {social.name}
                            </span>
                            <span className="text-white/40 text-xs truncate">
                              {social.username}
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Support Note */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl md:rounded-2xl p-5 md:p-6">
                  <h4 className="text-sm font-semibold text-indigo-400 mb-2">
                    Need Help?
                  </h4>
                  <p className="text-white/60 text-xs md:text-sm leading-relaxed">
                    Check out our <a href="/docs" className="text-indigo-400 hover:underline">documentation</a> or 
                    visit the <a href="/info" className="text-indigo-400 hover:underline">how it works</a> page 
                    for detailed information about VeriMint.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section className="py-12 md:py-20 px-4 relative overflow-hidden bg-[#030303]" {...fadeInUp}>
        {/* Elegant Shapes - Hidden on mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
          <ElegantShape
            delay={0.8}
            width={320}
            height={85}
            rotate={16}
            gradient="from-pink-500/[0.08]"
            className="left-[-6%] top-[30%]"
          />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-white px-4">
              Frequently Asked Questions
            </h2>
            <p className="text-white/50 text-sm md:text-base">
              Quick answers to common questions
            </p>
          </div>

          <div className="space-y-3 md:space-y-4">
            {[
              {
                q: "How do I start using VeriMint?",
                a: "Simply connect your Web3 wallet and you can start browsing products or minting your own."
              },
              {
                q: "Are my delivery addresses secure?",
                a: "Yes, all delivery addresses are encrypted using Lit Protocol and can only be decrypted by merchants after payment."
              },
              {
                q: "What blockchain does VeriMint use?",
                a: "VeriMint is built on Ethereum blockchain using ERC-1155 NFT standard."
              },
              {
                q: "How long does customer support take to respond?",
                a: "We typically respond within 24 hours on business days."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/[0.06] rounded-xl md:rounded-2xl p-5 md:p-6 hover:border-white/[0.12] transition-all duration-300">
                  <h3 className="text-base md:text-lg font-semibold text-white mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </DefaultLayout>
  );
}
