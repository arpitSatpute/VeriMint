import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { ThemeSwitch } from "@/components/theme-switch";
import { siteConfig } from "@/config/site";
import { GithubIcon, Logo } from "@/components/icons";
import { ConnectButton } from "thirdweb/react";
import { client, wallets } from "@/config/thirdwebConfig";

interface NavbarProps {
  logo?: { initials: string; name: string };
  navLinks?: Array<{ label: string; href: string }>;
  resume?: { label: string; onClick?: () => void };
}

export const Navbar = ({
  logo = { initials: "VM", name: "VeriMint" },
  navLinks = siteConfig.navItems || [
    { label: "Home", href: "/" },
    { label: "Products", href: "/marketplace" },
    { label: "Merchant", href: "/merchant" },
  ],
  resume = { label: "Connect Wallet" },
}: NavbarProps) => {
  return (
    <nav className="fixed top-0 w-full px-6 py-4 z-50 bg-black/40 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <img 
            src="/verimint-logo.svg" 
            alt="VeriMint Logo" 
            className="w-10 h-10"
          />
          <span className="text-xl font-bold text-white tracking-tight">{logo.name}</span>
        </Link>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              color="foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section - Theme Switch & Resume Button */}
        <div className="flex items-center space-x-4">
            <ConnectButton
              client={client}
              wallets={wallets}
              theme="dark"
              connectButton={{
                  label: "Connect",
                  style: {
                      backgroundColor: "#242424ff",
                      borderRadius: "8px",
                      fontWeight: "400",
                      transition: "all 0.3s ease",
                      color: "#fff",
                  },
              }}
              connectModal={{
                  title: "Select a Wallet",
                  showThirdwebBranding: false,
                  termsOfServiceUrl: "/terms",
                  privacyPolicyUrl: "/privacy",
              }}
            />
        </div>
      </div>
    </nav>
  );
};
