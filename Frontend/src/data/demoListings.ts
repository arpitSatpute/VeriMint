export interface Listing {
  tokenId: number;
  merchant: string;
  price: string;
  name: string;
  description: string;
  image?: string;
}

export const demoListings: Listing[] = [
  {
    tokenId: 1,
    merchant: "0x1234567890123456789012345678901234567890",
    price: "1000000000000000000",
    name: "Digital Art #1",
    description: "Unique digital artwork by talented artist",
    image: "https://picsum.photos/seed/1/600/600",
  },
  {
    tokenId: 2,
    merchant: "0x0987654321098765432109876543210987654321",
    price: "2500000000000000000",
    name: "Virtual Land Plot",
    description: "Premium metaverse real estate",
    image: "https://picsum.photos/seed/2/600/600",
  },
  {
    tokenId: 3,
    merchant: "0x1234567890123456789012345678901234567890",
    price: "500000000000000000",
    name: "Limited Edition Collectible",
    description: "Scarce NFT with utility",
    image: "https://picsum.photos/seed/3/600/600",
  },
  {
    tokenId: 4,
    merchant: "0x5555555555555555555555555555555555555555",
    price: "750000000000000000",
    name: "Art Print #4",
    description: "Signed art print",
    image: "https://picsum.photos/seed/4/600/600",
  },
];
