import { Link } from "@heroui/link";
import { Shield, FileText, BookOpen, MessageCircle, Twitter, Github, Mail } from "lucide-react";

export const Footer = () => {
  const footerLinks = {
    platform: [
      { label: "Marketplace", href: "/marketplace" },
      { label: "Merchant Dashboard", href: "/merchant" },
      { label: "Orders", href: "/orders" },
      { label: "Documentation", href: "/docs" },
    ],
    resources: [
      { label: "About", href: "/about" },
      { label: "How It Works", href: "/info" },
      { label: "Smart Contracts", href: "/docs#smart-contracts" },
      { label: "Security", href: "/docs#security" },
    ],
    legal: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/verimint", label: "Twitter" },
    { icon: Github, href: "https://github.com/verimint", label: "GitHub" },
    { icon: Mail, href: "mailto:contact@verimint.com", label: "Email" },
  ];

  return (
    <footer className="w-full bg-black/40 backdrop-blur-md border-t border-white/[0.08] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
              <img 
                src="/verimint-logo.svg" 
                alt="VeriMint Logo" 
                className="w-10 h-10"
              />
              <span className="text-xl font-bold text-white">VeriMint</span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed mb-4 max-w-sm">
              Decentralized NFT marketplace for physical and virtual products. Secure, privacy-first, powered by blockchain.
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    isExternal
                    className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4 text-white/60" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-semibold text-white/90 mb-4">Platform</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-white/90 mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-white/90 mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/[0.06]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} VeriMint. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Shield className="w-3 h-3" />
              <span>Secured by blockchain technology</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
