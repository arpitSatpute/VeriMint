import DefaultLayout from "@/layouts/default";
import { useAccount } from "wagmi";
import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useNavigate } from "react-router-dom";
import {
  MarketplaceListing,
} from "@/components/marketplace/MarketplaceComponents";
import { PurchaseForm } from "@/components/escrow/EscrowComponents";
import { title, subtitle } from "@/components/primitives";

interface Listing {
  tokenId: number;
  merchant: string;
  price: string;
  name: string;
  description: string;
  image?: string;
}

import { demoListings as demoData } from "@/data/demoListings";

export default function MarketplacePage() {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  // Use shared demo listings
  const demoListings: Listing[] = demoData;

  const handlePurchase = async (supply: number) => {
    if (!selectedProduct) return;

    setIsLoading(true);
    try {
      console.log("Purchasing:", selectedProduct, "Quantity:", supply);
      alert(
        `Purchase initiated for product ${selectedProduct} with quantity ${supply}`
      );
      setSelectedProduct(null);
      navigate(`/buy/${selectedProduct}`, { state: { tokenId: selectedProduct } });
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredListings = demoListings.filter(
    (listing: Listing) =>
      listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isConnected) {
    return (
      <DefaultLayout>
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
          <h1 className={title()}>VeriMint Marketplace</h1>
          <p className={subtitle({ class: "mt-4" })}>
            Connect your wallet to browse and purchase products
          </p>
        </section>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <section className="py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={title()}>VeriMint Marketplace</h1>
            <p className={subtitle({ class: "mt-4" })}>
              Discover and purchase digital products with secure escrow
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <Input
              isClearable
              fullWidth
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
            />
          </div>

          {/* Active Purchase Form */}
          {selectedProduct && (
            <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Purchase Details</h2>
                <Button
                  size="sm"
                  color="default"
                  variant="light"
                  onPress={() => setSelectedProduct(null)}
                >
                  ✕ Close
                </Button>
              </div>
              {filteredListings.map((listing: Listing) => {
                if (listing.tokenId === selectedProduct) {
                  return (
                    <PurchaseForm
                      key={listing.tokenId}
                      tokenId={listing.tokenId}
                      pricePerUnit={listing.price}
                      onPurchase={handlePurchase}
                      isLoading={isLoading}
                    />
                  );
                }
                return null;
              })}
            </div>
          )}

          {/* Listings Grid */}
          <MarketplaceListing
            listings={filteredListings}
            onPurchase={(tokenId: number) => navigate(`/buy/${tokenId}`, { state: { listing: filteredListings.find(l => l.tokenId === tokenId) } })}
          />

          {/* Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Total Products Listed
              </p>
              <p className="text-3xl font-bold">{filteredListings.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Active Merchants
              </p>
              <p className="text-3xl font-bold">
                {new Set(filteredListings.map((l: Listing) => l.merchant)).size}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Total Value Locked
              </p>
              <p className="text-3xl font-bold">
                {(
                  filteredListings.reduce(
                    (sum: number, l: Listing) => sum + parseFloat(l.price) / 1e18,
                    0
                  ) * filteredListings.length
                ).toFixed(2)}{" "}
                ETH
              </p>
            </div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
