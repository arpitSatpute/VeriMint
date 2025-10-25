import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { weiToEth } from "@/utils/priceFormatter";
import { NFTCard } from "@/components/ui/nft-card/NFTCard";
import type { NFT } from "@/components/ui/nft-card/types";

interface ListProductFormProps {
  tokenId: number;
  onList: (pricePerUnit: string) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export const ListProductForm = ({
  tokenId,
  onList,
  isLoading = false,
  onCancel,
}: ListProductFormProps) => {
  const [price, setPrice] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async () => {
    if (!price) {
      alert("Please enter a price");
      return;
    }
    try {
      await onList(price);
      setPrice("");
      setShowForm(false);
    } catch (error) {
      console.error("Failed to list product:", error);
    }
  };

  if (!showForm) {
    return (
      <Button
        size="sm"
        color="primary"
        onPress={() => setShowForm(true)}
        disabled={isLoading}
      >
        List for Sale
      </Button>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold mb-3">List Product (Token #{tokenId})</h3>
      <div className="space-y-3">
        <Input
          label="Price Per Unit (Wei)"
          type="number"
          placeholder="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={isLoading}
          fullWidth
          description={price ? `≈ ${weiToEth(price)} ETH` : ""}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            color="default"
            variant="bordered"
            onPress={() => {
              setShowForm(false);
              setPrice("");
              onCancel?.();
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            color="primary"
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Listing..." : "List Product"}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface MarketplaceListingProps {
  listings: Array<{
    tokenId: number;
    merchant: string;
    price: string;
    name?: string;
    description?: string;
    image?: string;
  }>;
  onPurchase?: (tokenId: number) => void;
  singleRow?: boolean;
  /**
   * When true, render only the first 2 listings in a single row (2 columns)
   */
}

export const MarketplaceListing = ({
  listings,
  onPurchase,
  singleRow = false,
}: MarketplaceListingProps) => {
  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No products listed yet
        </p>
      </div>
    );
  }

  const displayListings = singleRow ? listings.slice(0, 2) : listings;
  const gridClass = "grid grid-cols-1 md:grid-cols-2 gap-4"; // max 2 columns on md+

  return (
    <div className={gridClass}>
      {displayListings.map((listing) => {
        const nft: NFT = {
          id: `product-${listing.tokenId}`,
          name: listing.name || `Product #${listing.tokenId}`,
          description: listing.description || "",
          image: (listing as any).image || "https://via.placeholder.com/500",
          owner: listing.merchant,
          collection: "VeriMint",
          tokenId: String(listing.tokenId),
          contractAddress: "",
          chainId: 1,
          attributes: [],
        };

        return (
          <div key={listing.tokenId} className="h-full">
            <NFTCard
              nft={nft}
              priceWei={listing.price}
              onOwnerClick={() => {
                /* optional: open explorer or merchant profile */
              }}
              onNFTClick={() => {
                // delegate to parent (e.g. navigate to buy page)
                onPurchase?.(listing.tokenId);
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
