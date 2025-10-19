#!/bin/bash

# VeriMint Frontend Setup & Deployment Guide

## 📦 INSTALLATION & SETUP

### 1. Install Dependencies
cd Frontend
npm install

### 2. Environment Configuration
Create `.env.local` file with:

```
# Network RPC URLs
VITE_SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_KEY
VITE_MAINNET_RPC=https://mainnet.infura.io/v3/YOUR_KEY

# Contract Addresses (Sepolia Testnet)
VITE_MULTIPRODUCT_ADDRESS=0x...
VITE_ESCROW_ADDRESS=0x...

# Contract Addresses (Mainnet)
VITE_MAINNET_MULTIPRODUCT=0x...
VITE_MAINNET_ESCROW=0x...
```

### 3. Development Server
npm run dev

The app will be available at http://localhost:5173

## 🏗️ CONTRACT ABI SETUP

### 1. Copy ABIs from Solidity Build
```bash
cp Contract/artifacts/MultiProduct.json Frontend/src/abis/
cp Contract/artifacts/EscrowMultiProduct.json Frontend/src/abis/
```

### 2. Create Contract Config
Create `src/config/contracts.ts`:

```typescript
import { Address } from 'viem';

export const CONTRACT_ADDRESSES: Record<string, Address> = {
  // Sepolia Testnet
  sepolia: {
    multiProduct: (import.meta.env.VITE_MULTIPRODUCT_ADDRESS || '0x') as Address,
    escrow: (import.meta.env.VITE_ESCROW_ADDRESS || '0x') as Address,
  },
  // Mainnet
  mainnet: {
    multiProduct: (import.meta.env.VITE_MAINNET_MULTIPRODUCT || '0x') as Address,
    escrow: (import.meta.env.VITE_MAINNET_ESCROW || '0x') as Address,
  },
};
```

## 🧪 TESTING

### 1. Local Testing with Testnet

Connect to Sepolia testnet with MetaMask:
1. Get Sepolia ETH from faucet: https://sepoliafaucet.com
2. Configure wallet for Sepolia
3. Test each flow:
   - Mint product
   - List product
   - Purchase
   - Release/Refund

### 2. Test Flows

**Test 1: Merchant Workflow**
- [ ] Connect wallet
- [ ] Go to /merchant
- [ ] Mint a test NFT
- [ ] Verify in "Your Products"
- [ ] List product to marketplace
- [ ] Confirm listing on /marketplace

**Test 2: Buyer Workflow**
- [ ] Switch to different wallet
- [ ] Go to /marketplace
- [ ] Find listed product
- [ ] Initiate purchase
- [ ] Confirm transaction
- [ ] Check order in /orders

**Test 3: Escrow Completion**
- [ ] As buyer: Confirm receipt in /orders
- [ ] Verify payment released to merchant
- [ ] Check merchant received funds

**Test 4: Refund Flow**
- [ ] Create new order
- [ ] As merchant: Issue refund from /orders
- [ ] Verify buyer receives refund
- [ ] Order marked as refunded

## 🚀 DEPLOYMENT

### Option 1: Vercel (Recommended)

```bash
# 1. Push to GitHub
git push origin main

# 2. Import on Vercel
# - Go to vercel.com
# - Connect GitHub account
# - Import the Frontend folder
# - Add environment variables

# 3. Configure build
# Project Settings > Build & Development Settings
# - Framework: Vite
# - Build command: npm run build
# - Output directory: dist

# 4. Add Environment Variables
# Add all from .env.local to Vercel dashboard
```

### Option 2: GitHub Pages

```bash
# 1. Update vite.config.ts
export default {
  base: '/VeriMint/',
  // ... rest of config
}

# 2. Build
npm run build

# 3. Deploy
npm install gh-pages --save-dev
npx gh-pages -d dist
```

### Option 3: Traditional Hosting

```bash
# 1. Build production bundle
npm run build

# 2. Upload dist/ folder to:
# - AWS S3 + CloudFront
# - Google Cloud Storage
# - Azure Static Web Apps
# - DigitalOcean
# - Netlify
# - Any standard web host

# 3. Configure for SPA
# Ensure all routes redirect to index.html
```

## 🔒 Production Checklist

### Security
- [ ] Environment variables are never exposed
- [ ] Contract addresses verified
- [ ] RPC endpoints are private
- [ ] Input validation on all forms
- [ ] Transaction signing by user wallet
- [ ] No private keys in code
- [ ] HTTPS enforced
- [ ] Content Security Policy headers

### Performance
- [ ] Production build created (`npm run build`)
- [ ] Assets optimized and minified
- [ ] Lazy loading for routes
- [ ] Image optimization
- [ ] Caching strategies configured
- [ ] CDN configured (if applicable)

### Testing
- [ ] All flows tested on testnet
- [ ] Error handling verified
- [ ] Wallet connection tested
- [ ] Network switching tested
- [ ] Mobile responsiveness verified
- [ ] Dark/light mode works
- [ ] Contract interactions verified

### Monitoring
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Analytics configured
- [ ] Transaction monitoring
- [ ] User session tracking
- [ ] API/RPC health checks

## 📊 MONITORING & MAINTENANCE

### 1. Error Tracking
```bash
# Install Sentry
npm install @sentry/react

# Initialize in main.tsx
import * as Sentry from "@sentry/react";
Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
});
```

### 2. Analytics
```bash
# Install Google Analytics or similar
npm install react-ga4

# Initialize
import ReactGA from "react-ga4";
ReactGA.initialize("GA_MEASUREMENT_ID");
```

### 3. Monitor Contract Interactions
- Watch transaction success rates
- Track failed transactions and errors
- Monitor gas price trends
- Alert on unusual activity

## 🔄 CI/CD PIPELINE

### GitHub Actions Workflow (.github/workflows/deploy.yml)

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'Frontend/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: |
          cd Frontend
          npm install
      
      - name: Lint
        run: |
          cd Frontend
          npm run lint
      
      - name: Build
        run: |
          cd Frontend
          npm run build
        env:
          VITE_MULTIPRODUCT_ADDRESS: ${{ secrets.VITE_MULTIPRODUCT_ADDRESS }}
          VITE_ESCROW_ADDRESS: ${{ secrets.VITE_ESCROW_ADDRESS }}
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./Frontend/dist
```

## 📱 MOBILE OPTIMIZATION

### Already Implemented
- ✅ Responsive grid layouts
- ✅ Mobile menu navigation
- ✅ Touch-friendly buttons
- ✅ Mobile-optimized forms
- ✅ Adaptive images

### Additional Mobile Considerations
- Test on various screen sizes
- Verify wallet integration on mobile (WalletConnect, etc.)
- Ensure fast load times (Lighthouse score)
- Test on slow networks (3G simulation)

## 🌐 MULTI-NETWORK SUPPORT

### Add Network Support

```typescript
// In wagmi config
import { mainnet, sepolia, polygon, arbitrum } from 'wagmi/chains';

const config = createConfig({
  chains: [mainnet, sepolia, polygon, arbitrum],
  // ... rest
});
```

### Update Contract Addresses

```typescript
const CONTRACTS_BY_CHAIN = {
  [sepolia.id]: { multiProduct: '0x...', escrow: '0x...' },
  [mainnet.id]: { multiProduct: '0x...', escrow: '0x...' },
  [polygon.id]: { multiProduct: '0x...', escrow: '0x...' },
};
```

## 📚 USEFUL COMMANDS

```bash
# Development
npm run dev              # Start dev server
npm run lint             # Run linter
npm run build            # Production build
npm run preview          # Preview production build

# Maintenance
npm outdated             # Check for updates
npm update               # Update packages
npm audit                # Security audit
npm audit fix            # Auto-fix vulnerabilities

# Debugging
npm run build -- --sourcemap  # Build with source maps
```

## 🆘 TROUBLESHOOTING

### Common Issues

**1. Wallet Not Connecting**
- Ensure MetaMask is installed
- Check browser is supported
- Verify RPC endpoint is working
- Clear browser cache/cookies

**2. Contract Calls Failing**
- Verify contract addresses are correct
- Check ABI matches deployed contract
- Ensure caller has required permissions
- Check account has sufficient balance for gas

**3. Network Issues**
- Switch network manually in MetaMask
- Verify RPC endpoint health
- Try different RPC provider
- Check network is supported

**4. Build Errors**
- Delete node_modules and reinstall
- Clear npm cache: `npm cache clean --force`
- Verify Node.js version compatibility
- Check for circular dependencies

## 📖 ADDITIONAL RESOURCES

- [Wagmi Docs](https://wagmi.sh/)
- [Viem Docs](https://viem.sh/)
- [HeroUI Docs](https://heroui.com/)
- [Tailwind Docs](https://tailwindcss.com/)
- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)

## 🎯 NEXT STEPS

1. **Immediate**
   - [ ] Set up environment variables
   - [ ] Extract and add contract ABIs
   - [ ] Test on Sepolia testnet

2. **Short-term**
   - [ ] Add contract integration
   - [ ] Complete all test flows
   - [ ] Deploy to staging

3. **Long-term**
   - [ ] Optimize performance
   - [ ] Add analytics
   - [ ] Plan mainnet launch
   - [ ] Set up monitoring

---

For questions or issues, refer to FRONTEND_DOCS.md and CONTRACT_INTEGRATION.md
