import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

interface MintProductFormProps {
  onMint: (data: {
    supply: number;
    price: string;
    name: string;
    description: string;
    tokenURI: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export const MintProductForm = ({
  onMint,
  isLoading = false,
}: MintProductFormProps) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    supply: "",
    price: "",
    tokenURI: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await onMint({
        supply: parseInt(formData.supply),
        price: formData.price,
        name: formData.name,
        description: formData.description,
        tokenURI: formData.tokenURI,
      });
      setFormData({
        name: "",
        description: "",
        supply: "",
        price: "",
        tokenURI: "",
      });
      setShowForm(false);
    } catch (error) {
      console.error("Failed to mint product:", error);
    }
  };

  if (!showForm) {
    return (
      <Button
        color="primary"
        onPress={() => setShowForm(true)}
        disabled={isLoading}
      >
        Mint New Product
      </Button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold mb-6">Mint NFT Product</h2>

      <div className="space-y-4 mb-6">
        <Input
          label="Product Name"
          name="name"
          placeholder="Enter product name"
          value={formData.name}
          onChange={handleInputChange}
          disabled={isLoading}
          fullWidth
        />
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            placeholder="Enter product description"
            value={formData.description}
            onChange={handleInputChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            rows={3}
          />
        </div>
        <Input
          label="Initial Supply"
          name="supply"
          type="number"
          placeholder="0"
          value={formData.supply}
          onChange={handleInputChange}
          disabled={isLoading}
          fullWidth
        />
        <Input
          label="Price Per Unit (Wei)"
          name="price"
          type="number"
          placeholder="0"
          value={formData.price}
          onChange={handleInputChange}
          disabled={isLoading}
          fullWidth
        />
        <Input
          label="Token URI (IPFS/URL)"
          name="tokenURI"
          placeholder="https://... or ipfs://..."
          value={formData.tokenURI}
          onChange={handleInputChange}
          disabled={isLoading}
          fullWidth
        />
      </div>

      <div className="flex gap-3">
        <Button
          color="default"
          variant="bordered"
          onPress={() => setShowForm(false)}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          color="primary"
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Minting..." : "Mint Product"}
        </Button>
      </div>
    </div>
  );
};

interface ProductCardProps {
  tokenId: number;
  name: string;
  description: string;
  price: string;
  supply: number;
  merchant: string;
  onList?: () => void;
  isListed?: boolean;
}

export const ProductCard = ({
  tokenId,
  name,
  description,
  price,
  supply,
  merchant,
  onList,
  isListed = false,
}: ProductCardProps) => {
  const shortAddress = `${merchant.slice(0, 6)}...${merchant.slice(-4)}`;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-sm text-gray-500">Token ID: {tokenId}</p>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">{description}</p>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Price Per Unit
            </p>
            <p className="text-lg font-semibold">{price} Wei</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">Supply</p>
            <p className="text-lg font-semibold">{supply}</p>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400">Merchant</p>
          <p className="text-sm font-mono">{shortAddress}</p>
        </div>

        {onList && (
          <Button
            fullWidth
            color={isListed ? "default" : "primary"}
            onPress={onList}
          >
            {isListed ? "Listed" : "List Product"}
          </Button>
        )}
      </div>
    </div>
  );
};
