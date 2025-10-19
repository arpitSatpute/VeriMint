import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { weiToEth } from "@/utils/priceFormatter";

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
  }>;
  isLoading?: boolean;
  onPurchase?: (tokenId: number) => void;
}

export const MarketplaceListing = ({
  listings,
  isLoading = false,
  onPurchase,
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {listings.map((listing) => (
        <div
          key={listing.tokenId}
          className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">
              {listing.name || `Product #${listing.tokenId}`}
            </h3>
            {listing.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {listing.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Token ID
                </p>
                <p className="font-semibold">{listing.tokenId}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Price
                </p>
                <p className="font-semibold text-green-600 dark:text-green-400">
                  {weiToEth(listing.price)} ETH
                </p>
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mb-4">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Merchant
              </p>
              <p className="text-sm font-mono">
                {listing.merchant.slice(0, 6)}...{listing.merchant.slice(-4)}
              </p>
            </div>

            {onPurchase && (
              <Button
                fullWidth
                color="primary"
                onPress={() => onPurchase(listing.tokenId)}
                disabled={isLoading}
              >
                Buy Now
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
