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
    productType: "virtual", // 'virtual' or 'physical'
    identityNumber: "",
    serialNumber: "",
    otherDetails: "",
  });
  // Keep all hooks at the top-level to preserve hook order across renders
  const [image, setImage] = useState("");
  const [productFile, setProductFile] = useState<File | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target as HTMLInputElement & HTMLTextAreaElement & HTMLSelectElement;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setImage("");
      setProductFile(null);
      return;
    }
    const preview = URL.createObjectURL(file);
    setImage(preview);
    setProductFile(file);
  };

  const handleSubmit = async () => {
    try {
      // metadata collected for virtual/physical product details
      const metadata = {
        productType: (formData as any).productType,
        identityNumber: (formData as any).identityNumber,
        serialNumber: (formData as any).serialNumber,
        otherDetails: (formData as any).otherDetails,
        productFileName: productFile?.name ?? null,
      };
      console.log("Collected product metadata:", metadata);
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
        productType: "virtual",
        identityNumber: "",
        serialNumber: "",
        otherDetails: "",
      });
      setProductFile(null);
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

        <div>
            <Input
            type="file"
            name="productImage" onChange={handleFileChange}
            disabled={isLoading} className="w-full"
            fullWidth
            label="Product Image"
            />
            {image && (
            <img src={image} alt="preview" className="mt-2 w-32 h-32 object-cover rounded" />
            )}
          </div>



        {/* // Replace this with form details to store in ipfs and get hash and pass to mint function */}
        {/* Product type selector + conditional fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-2">Product Type</label>
            <select
              name="productType"
              value={(formData as any).productType}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="virtual">Virtual</option>
              <option value="physical">Physical</option>
            </select>
          </div>
        </div>

        
        {(formData as any).productType === "virtual" && (
          <div>
            <label className="block text-sm font-medium mb-2">Upload Product File (virtual)</label>
            <Input
              type="file"
              name="productFile"
              onChange={handleFileChange}
              disabled={isLoading}
              className="w-full"
              fullWidth
              label="Product File"
            />
            {image && (
              <img src={image} alt="preview" className="mt-2 w-32 h-32 object-cover rounded" />
            )}
          </div>
        )}

        {(formData as any).productType === "physical" && (
          <div className="space-y-3">
            <Input
              label="Identity Number"
              name="identityNumber"
              placeholder="Serial, or identity number"
              value={(formData as any).identityNumber}
              onChange={handleInputChange}
              disabled={isLoading}
              fullWidth
            />
            <Input
              label="Serial / SKU"
              name="serialNumber"
              placeholder="Serial number or SKU"
              value={(formData as any).serialNumber}
              onChange={handleInputChange}
              disabled={isLoading}
              fullWidth
            />
            <div>
              <label className="block text-sm font-medium mb-2">Other Identifiable Details</label>
              <textarea
                name="otherDetails"
                placeholder="Add any additional product identifiers"
                value={(formData as any).otherDetails}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                rows={3}
              />
            </div>
          </div>
        )}
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
