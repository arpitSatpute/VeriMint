# VeriMint Frontend - NFT Marketplace with Escrow

A comprehensive web3 marketplace frontend built with React, TypeScript, HeroUI, and Wagmi for interacting with the VeriMint smart contracts. This frontend showcases all features of the `MultiProduct` and `EscrowMultiProduct` contracts.

## 📋 Features

### 1. **Merchant Dashboard** (`/merchant`)
Allows merchants to manage their NFT products:
- **Mint Products**: Create new ERC1155 NFTs with metadata
  - Set supply quantity
  - Define price per unit
  - Add product name and description
  - Provide IPFS/metadata URI
- **Product Management**: View all minted products
- **List Products**: Put products on marketplace with custom pricing
- **Product Analytics**: See total products, listed items, and active orders

**Components Used**:
- `MintProductForm`: Modal-based form for creating new NFTs
- `ProductCard`: Display individual product information
- `ListProductForm`: Quick listing interface

### 2. **Marketplace** (`/marketplace`)
Main shopping interface for buyers:
- **Browse Products**: View all listed products
- **Search & Filter**: Find products by name or description
- **Product Details**: See merchant, price, and supply information
- **Purchase Flow**: Initiate purchases with quantity selection
- **Real-time Pricing**: Calculate total cost in Wei and ETH
- **Marketplace Stats**: Total listings, active merchants, TVL

**Components Used**:
- `MarketplaceListing`: Grid display of available products
- `PurchaseForm`: Quantity selector with cost calculation
- Search functionality with real-time filtering

### 3. **Order & Escrow Management** (`/orders`)
Track and manage secure transactions:
- **Order Tracking**: View all orders with current status
- **Escrow Status**: Monitor fund status (Funded → Released/Refunded)
- **Buyer Actions**:
  - Confirm receipt to release payment to merchant
- **Merchant Actions**:
  - Issue refund if needed
- **Order History**: Detailed order information and timelines
- **Escrow Statistics**: Orders breakdown by status

**Components Used**:
- `OrderTracking`: Detailed order card with action buttons
- `OrderHistory`: List view of all orders
- `PurchaseForm`: Embedded in orders for reference

## 🗂️ Project Structure

```
Frontend/src/
├── components/
│   ├── product/
│   │   └── ProductForm.tsx          # Minting and product display
│   ├── marketplace/
│   │   └── MarketplaceComponents.tsx # Listing and purchasing
│   ├── escrow/
│   │   └── EscrowComponents.tsx      # Order tracking and escrow
│   ├── navbar.tsx                    # Navigation component
│   ├── icons.tsx                     # SVG icons
│   ├── theme-switch.tsx              # Dark/light mode
│   └── primitives.ts                 # Reusable styles
├── hooks/
│   └── useContractInteraction.ts    # Web3 contract hooks
├── pages/
│   ├── merchant.tsx                  # Merchant dashboard
│   ├── marketplace.tsx               # Marketplace page
│   ├── orders.tsx                    # Order management
│   └── index.tsx                     # Home page
├── config/
│   ├── config.ts                     # Wagmi configuration
│   └── site.ts                       # Site navigation config
└── layouts/
    └── default.tsx                   # Main layout wrapper
```

## 🔧 Contract Integration

### MultiProduct Contract Integration
```typescript
// Mint a product
await multiProduct.mintProductNft(
  supply,      // Total units available
  pricePerUnit, // Price in Wei
  name,        // Product name
  description, // Product description
  tokenURI     // IPFS metadata URI
);

// List a product
await multiProduct.listProduct(tokenId, pricePerUnit);

// View listings
const { listings, tokenIds } = await multiProduct.getAllListing();

// Get merchant products
await multiProduct.getMerchantProducts(merchantAddress);
```

### EscrowMultiProduct Contract Integration
```typescript
// Fund escrow (buyer initiates purchase)
const orderId = await escrow.fundEscrow(
  tokenId,
  supply,
  { value: totalPrice } // ETH value
);

// Release payment to merchant (buyer confirms)
await escrow.releaseFundToMerchant(orderId);

// Refund to buyer (merchant issues refund)
await escrow.refundToBuyer(orderId);

// Check order details
await escrow.getOrderDetails(orderId);
```

## 🎨 UI Components

### HeroUI Components Used
- **Button**: Primary CTA, action triggers
- **Input**: Form fields and searches
- **Card**: Product and order display
- **Modal**: Forms and dialogs (can be implemented)
- **Navbar**: Navigation header
- **Link**: Navigation links
- **Dropdown**: Menu options

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Dark Mode**: Built-in support via HeroUI theme
- **Responsive**: Mobile-first, responsive design
- **Custom Colors**: Violet primary, semantic status colors

## 📱 Responsive Design

- **Mobile**: Single column layout, hamburger menu
- **Tablet**: 2-column grids, optimized spacing
- **Desktop**: 3-column grids, full feature display

## 🔐 Web3 Integration

### Wagmi & Viem
- **Wallet Connection**: WagmiProvider setup
- **Contract Reading**: useContractRead hooks
- **Contract Writing**: useContractWrite hooks
- **Account Info**: useAccount for address/connection
- **Transaction Status**: Real-time feedback

### Supported Networks
- Mainnet
- Sepolia (testnet)

## 🚀 Getting Started

### Installation
```bash
cd Frontend
npm install
```

### Environment Setup
```bash
# Add to .env.local (if needed)
VITE_CONTRACT_MULTIPRODUCT=0x...
VITE_CONTRACT_ESCROW=0x...
```

### Running Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

## 📊 Data Flow

### Purchase Flow
1. **Buyer** searches marketplace
2. **Buyer** selects product and quantity
3. **Buyer** initiates purchase → Escrow funded
4. **Merchant** sees pending order
5. **Buyer** confirms receipt → Payment released
6. **Merchant** receives payment

### Refund Flow
1. **Issue exists** with order
2. **Merchant** initiates refund via Order Management
3. **Buyer** receives refund automatically
4. **Order** marked as refunded

## 🎯 Key Features by Page

### Home (`/`)
- Welcome section
- Quick navigation
- Feature highlights

### Merchant (`/merchant`)
- Mint new products
- View inventory
- List products for sale
- Track product stats

### Marketplace (`/marketplace`)
- Browse available products
- Search functionality
- Purchase products
- View marketplace analytics

### Orders (`/orders`)
- Track all orders
- View order details
- Manage escrow (buyer: confirm, merchant: refund)
- See order history with status

## 🔄 State Management

Currently using React hooks (useState). For production, consider:
- Redux / Redux Toolkit
- Zustand
- Jotai
- TanStack Query (React Query) - already installed

## 🛠️ Development Workflow

### Adding New Components
1. Create component in appropriate directory
2. Export from index or directly import
3. Use TypeScript for type safety
4. Add HeroUI components as needed

### Connecting to Contracts
1. Update `useContractInteraction` hooks
2. Add contract ABIs
3. Implement write functions with error handling
4. Add loading states and user feedback

### Testing
```bash
npm run lint
```

## 📚 Documentation

### Smart Contract ABIs
Place contract ABIs in a new `abis/` folder:
```
src/
├── abis/
│   ├── MultiProduct.json
│   └── EscrowMultiProduct.json
```

Then import and use in hooks:
```typescript
import MultiProductABI from '@/abis/MultiProduct.json';
import EscrowABI from '@/abis/EscrowMultiProduct.json';
```

## 🎓 Learning Resources

- [HeroUI Documentation](https://heroui.com)
- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)
- [Tailwind CSS](https://tailwindcss.com)
- [React Documentation](https://react.dev)

## 🐛 Common Issues & Solutions

### Wallet Not Connecting
- Ensure wallet extension is installed
- Check network is supported
- Verify RPC endpoints in config

### Contract Calls Failing
- Verify contract addresses are correct
- Check ABIs match deployed contract
- Ensure sufficient gas/funds
- Check account has correct permissions

### Styling Issues
- Clear Tailwind cache: `npm run build -- --force`
- Check dark mode is enabled in browser

## 🔐 Security Considerations

- ✅ Form validation before contract calls
- ✅ Wallet connection verification
- ✅ Error handling for failed transactions
- ✅ User confirmation for critical actions
- ⚠️ **TODO**: Add rate limiting
- ⚠️ **TODO**: Input sanitization
- ⚠️ **TODO**: Transaction timeout handling

## 📦 Dependencies

### Core
- react 18.3.1
- react-dom 18.3.1
- react-router-dom 6.23.0
- typescript 5.6.3

### Web3
- wagmi ^2.18.1
- viem ^2.38.3
- @tanstack/react-query ^5.90.5

### UI
- @heroui/button 2.2.27
- @heroui/input 2.4.28
- @heroui/link 2.2.23
- @heroui/navbar 2.2.25
- framer-motion 11.18.2
- tailwindcss 4.1.11

## 🎨 Future Enhancements

- [ ] Advanced filtering and sorting
- [ ] Product ratings and reviews
- [ ] Dispute resolution system
- [ ] Transaction history export
- [ ] Portfolio dashboard
- [ ] Analytics for merchants
- [ ] Payment splitting for bundles
- [ ] Social features (sharing, wishlists)
- [ ] Multi-currency support
- [ ] Bulk operations
- [ ] Automated market maker (AMM) integration
- [ ] Staking and governance

## 📝 License

Same as main VeriMint project

## 🤝 Contributing

Follow the project structure and conventions. Submit PRs with clear descriptions.

---

**Built with ❤️ for the Web3 community**
