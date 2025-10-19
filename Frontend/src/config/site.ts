export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "VeriMint - NFT Marketplace with Escrow",
  description: "Secure NFT marketplace with integrated escrow for safe transactions.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Marketplace",
      href: "/marketplace",
    },
    {
      label: "Merchant",
      href: "/merchant",
    },
    {
      label: "Orders",
      href: "/orders",
    },
    {
      label: "Docs",
      href: "/docs",
    },
  ],
  navMenuItems: [
    {
      label: "Marketplace",
      href: "/marketplace",
    },
    {
      label: "Merchant Dashboard",
      href: "/merchant",
    },
    {
      label: "Order Management",
      href: "/orders",
    },
    {
      label: "Docs",
      href: "/docs",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  links: {
    github: "https://github.com/arpitSatpute/VeriMint",
    twitter: "https://twitter.com",
    docs: "/docs",
    discord: "https://discord.gg",
    sponsor: "https://patreon.com",
  },
};
