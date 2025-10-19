# VeriMint Frontend - NFT Marketplace with Escrow

A production-ready React + TypeScript frontend for the VeriMint NFT marketplace featuring integrated escrow system, merchant dashboard, and secure order management.

## 🚀 Features

### **Merchant Dashboard** (`/merchant`)
- Mint ERC1155 NFTs with custom metadata
- Manage product inventory
- List products with custom pricing
- Track sales and orders

### **Marketplace** (`/marketplace`)
- Browse all listed products
- Advanced search & filtering
- Detailed product information
- Secure purchase flow with quantity selection
- Real-time price calculation (Wei ↔ ETH)

### **Order Management** (`/orders`)
- Track all orders with real-time status
- Buyer confirmation workflow
- Merchant refund capabilities
- Escrow security features
- Order history and analytics

## 🛠 Technologies Used

- **React 18.3** - UI Framework
- **TypeScript 5.6** - Type Safety
- **Vite 6.0** - Build Tool
- **HeroUI 2.x** - Component Library
- **Tailwind CSS 4.1** - Styling
- **Wagmi 2.18** - Web3 Integration
- **Viem 2.38** - Contract Interactions
- **React Router 6.23** - Navigation
- **React Query 5.90** - Data Fetching

## 📦 Installation

### Clone & Install
```bash
cd Frontend
npm install
```

### Environment Setup
Create `.env.local`:
```env
VITE_MULTIPRODUCT_ADDRESS=0x...
VITE_ESCROW_ADDRESS=0x...
VITE_SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_KEY
VITE_MAINNET_RPC=https://mainnet.infura.io/v3/YOUR_KEY
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## 📚 Documentation

- **[FRONTEND_DOCS.md](./FRONTEND_DOCS.md)** - Complete feature guide & architecture (370 lines)
- **[CONTRACT_INTEGRATION.md](./CONTRACT_INTEGRATION.md)** - Smart contract integration guide (400 lines)
- **[SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md)** - Setup, testing, deployment (350 lines)
- **[FEATURE_OVERVIEW.md](./FEATURE_OVERVIEW.md)** - Visual diagrams & feature matrix (300 lines)

## 🎯 Quick Start

### 1. Setup Contract ABIs
```bash
cp ../Contract/artifacts/MultiProduct.json src/abis/
cp ../Contract/artifacts/EscrowMultiProduct.json src/abis/
```

### 2. Configure Contracts
Update `.env.local` with your deployed contract addresses and RPC endpoints

### 3. Start Development
```bash
npm run dev
```

### 4. Test Flows
- Go to `/merchant` to mint products
- Go to `/marketplace` to browse and purchase
- Go to `/orders` to track transactions

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Tablet optimized
- ✅ Desktop full-featured
- ✅ Dark/Light mode support

## 🔐 Security

- ✅ Input validation
- ✅ Wallet verification
- ✅ Transaction confirmation
- ✅ No private key exposure
- ✅ Smart contract security (ReentrancyGuard, Ownable)

## 🚢 Deployment

See [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md) for detailed deployment instructions for:
- Vercel
- GitHub Pages
- Netlify
- AWS S3 + CloudFront
- Google Cloud
- Traditional hosting

## 📊 Project Structure

```
src/
├── components/
│   ├── product/ProductForm.tsx          # Minting & product display
│   ├── marketplace/MarketplaceComponents.tsx # Listings & purchase
│   ├── escrow/EscrowComponents.tsx       # Order tracking & escrow
│   ├── navbar.tsx                        # Navigation
│   └── ...
├── pages/
│   ├── merchant.tsx                      # Merchant dashboard
│   ├── marketplace.tsx                   # Marketplace page
│   ├── orders.tsx                        # Order management
│   └── ...
├── hooks/
│   └── useContractInteraction.ts         # Web3 hooks
├── config/
│   └── config.ts                         # Wagmi config
└── ...
```

## 🔄 Contract Integration

The frontend is ready for integration with:
- **MultiProduct Contract** - ERC1155 token & marketplace logic
- **EscrowMultiProduct Contract** - Secure payment escrow

See [CONTRACT_INTEGRATION.md](./CONTRACT_INTEGRATION.md) for implementation examples.

## 🧪 Testing

### Test Flows Provided
1. Merchant Minting & Listing
2. Buyer Browsing & Purchasing
3. Escrow Completion
4. Refund Processing
5. Order Management

### Supported Networks
- Sepolia Testnet (for testing)
- Mainnet (for production)

## 📈 Features Completeness

| Feature | Status |
|---------|--------|
| Wallet Connection | ✅ |
| Mint NFTs | ✅ |
| List Products | ✅ |
| Browse Marketplace | ✅ |
| Purchase Products | ✅ |
| Escrow Management | ✅ |
| Order Tracking | ✅ |
| Dark Mode | ✅ |
| Responsive Design | ✅ |
| Error Handling | ✅ |

## 🆘 Troubleshooting

See [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md#troubleshooting) for common issues and solutions.

## 📞 Support

- Read the documentation files
- Check the CONTRACT_INTEGRATION.md guide
- Review test flows in SETUP_AND_DEPLOYMENT.md

## 📄 License

Same as main VeriMint project

## 🤝 Contributing

Follow project conventions and submit PRs with clear descriptions.

---

**Built with ❤️ for Web3**
