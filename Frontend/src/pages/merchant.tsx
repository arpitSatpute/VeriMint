import DefaultLayout from "@/layouts/default";
import { useAccount } from "wagmi";
import { useState } from "react";
import { MintProductForm, ProductCard } from "@/components/product/ProductForm";
import { ListProductForm } from "@/components/marketplace/MarketplaceComponents";
import { title, subtitle } from "@/components/primitives";

export default function MerchantPage() {
  const { address, isConnected } = useAccount();
  const [products, setProducts] = useState<any[]>([]);
  const [listedProducts, setListedProducts] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const handleMintProduct = async (data: {
    supply: number;
    price: string;
    name: string;
    description: string;
    tokenURI: string;
  }) => {
    setIsLoading(true);
    try {
      // TODO: Implement contract interaction for minting
      console.log("Minting product:", data);
      // Add product to local state for demo
      const newProduct = {
        tokenId: products.length + 1,
        ...data,
        merchant: address,
      };
      setProducts([...products, newProduct]);
    } catch (error) {
      console.error("Error minting product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleListProduct = async (
    tokenId: number,
    pricePerUnit: string
  ) => {
    setIsLoading(true);
    try {
      // TODO: Implement contract interaction for listing
      console.log("Listing product:", tokenId, pricePerUnit);
      setListedProducts(new Set([...listedProducts, tokenId]));
    } catch (error) {
      console.error("Error listing product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <DefaultLayout>
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
          <h1 className={title()}>Merchant Dashboard</h1>
          <p className={subtitle({ class: "mt-4" })}>
            Connect your wallet to get started
          </p>
          {/* Wallet connection UI would go here */}
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
            <h1 className={title()}>Merchant Dashboard</h1>
            <p className={subtitle({ class: "mt-4" })}>
              Manage your products and listings
            </p>
          </div>

          {/* Mint Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Mint New Product</h2>
            <MintProductForm onMint={handleMintProduct} isLoading={isLoading} />
          </div>

          {/* Products List */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Your Products</h2>
            {products.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <p className="text-gray-500 dark:text-gray-400">
                  No products yet. Mint your first NFT!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product.tokenId}>
                    <ProductCard
                      tokenId={product.tokenId}
                      name={product.name}
                      description={product.description}
                      price={product.price}
                      supply={product.supply}
                      merchant={product.merchant || address || ""}
                      isListed={listedProducts.has(product.tokenId)}
                    />
                    {!listedProducts.has(product.tokenId) && (
                      <div className="mt-3">
                        <ListProductForm
                          tokenId={product.tokenId}
                          onList={(price) =>
                            handleListProduct(product.tokenId, price)
                          }
                          isLoading={isLoading}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Total Products
              </p>
              <p className="text-3xl font-bold">{products.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Listed Products
              </p>
              <p className="text-3xl font-bold">{listedProducts.size}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Active Orders
              </p>
              <p className="text-3xl font-bold">0</p>
            </div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
