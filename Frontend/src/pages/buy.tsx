import DefaultLayout from "@/layouts/default";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { demoListings as demoData } from "@/data/demoListings";
import { PurchaseForm } from "@/components/escrow/EscrowComponents";
import { title, subtitle } from "@/components/primitives";
import { useState } from "react";
import { weiToEth, weiToGwei } from "@/utils/priceFormatter";

export default function BuyPage() {
  const { tokenId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Try to get listing from location.state first, then fallback to demo data
  const stateListing = (location.state as any)?.listing;
  const id = tokenId ? parseInt(tokenId, 10) : (stateListing?.tokenId ?? null);

  const listing =
    stateListing || demoData.find((l) => l.tokenId === id) || null;

  const handlePurchase = async (supply: number) => {
    if (!listing) return;
    setIsLoading(true);
    try {
      // Here you'd call your escrow / contract interaction
      alert(`Purchasing ${supply} × ${listing.name} (token ${listing.tokenId})`);
      navigate("/marketplace");
    } catch (err) {
      console.error(err);
      alert("Purchase failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!listing) {
    return (
      <DefaultLayout>
        <section className="py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className={title()}>Product not found</h1>
            <p className={subtitle({ class: "mt-4" })}>
              We couldn't find that product. Try returning to the marketplace.
            </p>
            <div className="mt-6">
              <button className="btn" onClick={() => navigate('/marketplace')}>
                Back to Marketplace
              </button>
            </div>
          </div>
        </section>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <section className="py-8">
        <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Image */}
            <div className="w-full flex items-start">
              <img
                src={listing.image || "https://via.placeholder.com/600"}
                alt={listing.name}
                className="w-full h-64 md:h-80 object-cover rounded-lg shadow-sm"
              />
            </div>

            {/* Right: Details + Purchase */}
            <div className="w-full">
              <h1 className={title()}>{listing.name}</h1>
              <p className={subtitle({ class: "mt-2" })}>{listing.description}</p>

              <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400">Price</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{weiToEth(listing.price)} ETH</p>
                <p className="text-xs text-gray-500 mt-1">{weiToGwei(listing.price)} Gwei • {listing.price} Wei</p>
              </div>

              <div className="mt-6">
                <PurchaseForm
                  tokenId={listing.tokenId}
                  pricePerUnit={listing.price}
                  onPurchase={handlePurchase}
                  isLoading={isLoading}
                />
              </div>

              <div className="mt-6 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <div>
                  <p className="text-xs">Owner</p>
                  <p className="font-mono">{listing.merchant.slice(0,6)}...{listing.merchant.slice(-4)}</p>
                </div>
                <div>
                  <p className="text-xs">Token ID</p>
                  <p className="font-medium">#{listing.tokenId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
