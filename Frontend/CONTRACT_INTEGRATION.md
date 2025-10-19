/* Contract Integration Guide for VeriMint Frontend */

// ============================================================================
// 1. SETUP - Add Contract ABIs
// ============================================================================

// Create src/abis/ folder and add:
// - MultiProduct.json (ABI from Contract/artifacts/)
// - EscrowMultiProduct.json (ABI from Contract/artifacts/)

// Export from src/config/contracts.ts
export const CONTRACT_ADDRESSES = {
  multiProduct: process.env.VITE_MULTIPRODUCT_ADDRESS || "0x...",
  escrow: process.env.VITE_ESCROW_ADDRESS || "0x...",
};

// ============================================================================
// 2. HOOK IMPLEMENTATIONS
// ============================================================================

// Example: Update src/hooks/useContractInteraction.ts

import { useContractWrite, useContractRead, useAccount } from "wagmi";
import { parseEther } from "viem";
import MultiProductABI from "@/abis/MultiProduct.json";
import EscrowABI from "@/abis/EscrowMultiProduct.json";
import { CONTRACT_ADDRESSES } from "@/config/contracts";

export const useMultiProduct = () => {
  const { address } = useAccount();

  // Mint Product
  const { write: mintProduct, isPending: isMintLoading } = useContractWrite({
    address: CONTRACT_ADDRESSES.multiProduct,
    abi: MultiProductABI,
    functionName: "mintProductNft",
  });

  // List Product
  const { write: listProduct, isPending: isListLoading } = useContractWrite({
    address: CONTRACT_ADDRESSES.multiProduct,
    abi: MultiProductABI,
    functionName: "listProduct",
  });

  // Get All Listings
  const { data: listings, isLoading: isListingsLoading } = useContractRead({
    address: CONTRACT_ADDRESSES.multiProduct,
    abi: MultiProductABI,
    functionName: "getAllListing",
  });

  // Get Merchant Products
  const { data: merchantProducts } = useContractRead({
    address: CONTRACT_ADDRESSES.multiProduct,
    abi: MultiProductABI,
    functionName: "getMerchantProducts",
    args: [address],
    enabled: !!address,
  });

  return {
    mintProduct,
    isMintLoading,
    listProduct,
    isListLoading,
    listings,
    isListingsLoading,
    merchantProducts,
  };
};

export const useEscrowMultiProduct = () => {
  const { address } = useAccount();

  // Fund Escrow
  const { write: fundEscrow, isPending: isFundLoading } = useContractWrite({
    address: CONTRACT_ADDRESSES.escrow,
    abi: EscrowABI,
    functionName: "fundEscrow",
  });

  // Release Fund
  const { write: releaseFund, isPending: isReleaseLoading } = useContractWrite({
    address: CONTRACT_ADDRESSES.escrow,
    abi: EscrowABI,
    functionName: "releaseFundToMerchant",
  });

  // Refund
  const { write: refundFund, isPending: isRefundLoading } = useContractWrite({
    address: CONTRACT_ADDRESSES.escrow,
    abi: EscrowABI,
    functionName: "refundToBuyer",
  });

  // Get Order Details
  const { data: orderDetails } = useContractRead({
    address: CONTRACT_ADDRESSES.escrow,
    abi: EscrowABI,
    functionName: "getOrderDetails",
    args: [0], // orderId
  });

  return {
    fundEscrow,
    isFundLoading,
    releaseFund,
    isReleaseLoading,
    refundFund,
    isRefundLoading,
    orderDetails,
  };
};

// ============================================================================
// 3. COMPONENT INTEGRATION
// ============================================================================

// Example: Merchant Page with contract integration

import { MintProductForm } from "@/components/product/ProductForm";
import { useMultiProduct } from "@/hooks/useContractInteraction";

export function MerchantPage() {
  const { mintProduct, isMintLoading } = useMultiProduct();

  const handleMint = async (data) => {
    mintProduct({
      args: [
        BigInt(data.supply),           // supply
        parseEther(data.price),        // price in ETH or parseUnits for Wei
        data.name,                     // name
        data.description,              // description
        data.tokenURI,                 // tokenURI
      ],
      onSuccess: (hash) => {
        console.log("Minting started:", hash);
        // Wait for confirmation
      },
      onError: (error) => {
        console.error("Mint failed:", error);
      },
    });
  };

  return (
    <MintProductForm onMint={handleMint} isLoading={isMintLoading} />
  );
}

// ============================================================================
// 4. MARKETPLACE INTEGRATION
// ============================================================================

// Example: Marketplace page with listings

import { useMultiProduct } from "@/hooks/useContractInteraction";
import { useEscrowMultiProduct } from "@/hooks/useContractInteraction";

export function MarketplacePage() {
  const { listings, isListingsLoading } = useMultiProduct();
  const { fundEscrow, isFundLoading } = useEscrowMultiProduct();

  const handlePurchase = async (tokenId, supply) => {
    // Get listing price
    const listing = listings?.find((l) => l.tokenId === tokenId);
    const totalPrice = BigInt(listing.price) * BigInt(supply);

    fundEscrow({
      args: [BigInt(tokenId), BigInt(supply)],
      value: totalPrice,
      onSuccess: (hash) => {
        console.log("Purchase funded:", hash);
      },
      onError: (error) => {
        console.error("Purchase failed:", error);
      },
    });
  };

  return (
    <MarketplaceListing
      listings={listings || []}
      isLoading={isListingsLoading}
      onPurchase={handlePurchase}
    />
  );
}

// ============================================================================
// 5. ORDER MANAGEMENT INTEGRATION
// ============================================================================

// Example: Orders page with escrow management

import { useEscrowMultiProduct } from "@/hooks/useContractInteraction";

export function OrdersPage() {
  const { releaseFund, isReleaseLoading, refundFund, isRefundLoading } =
    useEscrowMultiProduct();

  const handleRelease = async (orderId) => {
    releaseFund({
      args: [BigInt(orderId)],
      onSuccess: (hash) => {
        console.log("Payment released:", hash);
        // Update order status
      },
      onError: (error) => {
        console.error("Release failed:", error);
      },
    });
  };

  const handleRefund = async (orderId) => {
    refundFund({
      args: [BigInt(orderId)],
      onSuccess: (hash) => {
        console.log("Refund issued:", hash);
        // Update order status
      },
      onError: (error) => {
        console.error("Refund failed:", error);
      },
    });
  };

  return (
    <OrderTracking
      orderId={1}
      // ... other props
      onRelease={() => handleRelease(1)}
      onRefund={() => handleRefund(1)}
      isLoading={isReleaseLoading || isRefundLoading}
    />
  );
}

// ============================================================================
// 6. ENVIRONMENT VARIABLES (.env.local)
// ============================================================================

/*
# Sepolia Testnet
VITE_MULTIPRODUCT_ADDRESS=0x...
VITE_ESCROW_ADDRESS=0x...
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Mainnet
VITE_MAINNET_MULTIPRODUCT=0x...
VITE_MAINNET_ESCROW=0x...
VITE_MAINNET_RPC=https://mainnet.infura.io/v3/YOUR_KEY
*/

// ============================================================================
// 7. WAGMI CONFIG UPDATES
// ============================================================================

// In src/config/config.ts
import { createConfig, http, multicall } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

export const config = createConfig({
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC),
    [mainnet.id]: http(import.meta.env.VITE_MAINNET_RPC),
  },
  connectors: [
    // Add other wallet connectors as needed
  ],
});

// ============================================================================
// 8. TESTING FLOWS
// ============================================================================

/*
TEST FLOW 1: Merchant Minting
1. Go to /merchant
2. Click "Mint New Product"
3. Fill form:
   - Name: "Test NFT"
   - Description: "Test Description"
   - Supply: 10
   - Price: 0.1 (ETH)
   - URI: ipfs://QmTest...
4. Submit and confirm transaction
5. Wait for confirmation
6. See product in "Your Products"

TEST FLOW 2: Listing Product
1. From merchant dashboard
2. Click "List Product" on minted item
3. Enter price per unit
4. Confirm transaction
5. Product appears on /marketplace

TEST FLOW 3: Purchasing
1. Go to /marketplace
2. Find product
3. Click "Purchase"
4. Select quantity
5. Review total cost
6. Confirm purchase
7. Wait for escrow funding
8. See order in /orders

TEST FLOW 4: Order Completion
1. As buyer: Go to /orders
2. Find your order with "Funded" status
3. Click "Confirm Receipt"
4. Confirm transaction
5. Order status changes to "Released"
6. Merchant receives payment

TEST FLOW 5: Refund
1. As merchant: Go to /orders
2. Find order with "Funded" status
3. Click "Issue Refund"
4. Confirm transaction
5. Order status changes to "Refunded"
6. Buyer receives payment back
*/

// ============================================================================
// 9. ERROR HANDLING
// ============================================================================

const handleContractError = (error) => {
  if (error.message.includes("insufficient balance")) {
    return "Insufficient balance for transaction";
  }
  if (error.message.includes("user rejected")) {
    return "Transaction rejected by user";
  }
  if (error.message.includes("revert")) {
    return "Transaction reverted: Check contract requirements";
  }
  return error.message || "Transaction failed";
};

// ============================================================================
// 10. GAS OPTIMIZATION TIPS
// ============================================================================

/*
1. Use batch operations where possible
2. Cache contract reads using React Query
3. Avoid redundant reads in useEffect
4. Use useMemo for complex calculations
5. Consider event listeners for real-time updates
6. Implement pagination for large datasets
7. Use multicall for multiple reads
8. Monitor gas prices before transactions
*/

// ============================================================================
// QUICK START CHECKLIST
// ============================================================================

/*
[ ] Extract ABIs from Contract/artifacts/
[ ] Create src/abis/ folder with ABI files
[ ] Create src/config/contracts.ts
[ ] Update WAGMI config with RPC endpoints
[ ] Add contract address environment variables
[ ] Implement hooks in useContractInteraction.ts
[ ] Update component files with contract calls
[ ] Add error handling and loading states
[ ] Test on testnet first
[ ] Verify all transactions are working
[ ] Test refund and dispute flows
[ ] Deploy to mainnet when ready
*/
