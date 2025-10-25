  import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useState } from "react";
import { weiToEth } from "@/utils/priceFormatter";

interface PurchaseFormProps {
  tokenId: number;
  pricePerUnit: string;
  maxSupply?: number;
  onPurchase: (supply: number) => Promise<void>;
  isLoading?: boolean;
}

export const PurchaseForm = ({
  tokenId,
  pricePerUnit,
  maxSupply = 100,
  onPurchase,
  isLoading = false,
}: PurchaseFormProps) => {
  const [supply, setSupply] = useState("1");
  const [showForm, setShowForm] = useState(false);

  const totalPrice = (
    BigInt(pricePerUnit) * BigInt(supply || "0")
  ).toString();

  const handlePurchase = async () => {
    const supplyNum = parseInt(supply);
    if (supplyNum < 1 || supplyNum > maxSupply) {
      alert(`Please enter a quantity between 1 and ${maxSupply}`);
      return;
    }
    try {
      await onPurchase(supplyNum);
      setSupply("1");
      setShowForm(false);
    } catch (error) {
      console.error("Purchase failed:", error);
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
        Purchase
      </Button>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
      <h3 className="font-semibold mb-3">Purchase Product #{tokenId}</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Quantity</label>
          <Input
            type="number"
            placeholder="1"
            value={supply}
            onChange={(e) => setSupply(e.target.value)}
            disabled={isLoading}
            fullWidth
            min="1"
            max={maxSupply}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Cost
          </p>
          <p className="text-2xl font-bold">
            {weiToEth(totalPrice)} ETH
          </p>
          <p className="text-xs text-gray-500 mt-1">
            = {totalPrice} Wei
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            color="default"
            variant="bordered"
            onPress={() => {
              setShowForm(false);
              setSupply("1");
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            color="primary"
            onPress={handlePurchase}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Processing..." : "Complete Purchase"}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface OrderTrackingProps {
  orderId: number;
  tokenId: number;
  buyer: string;
  merchant: string;
  totalPrice: string;
  supply: number;
  status: "funded" | "released" | "refunded";
  isBuyer?: boolean;
  isMerchant?: boolean;
  onRelease?: () => Promise<void>;
  onRefund?: () => Promise<void>;
  isLoading?: boolean;
}

export const OrderTracking = ({
  orderId,
  tokenId,
  buyer,
  merchant,
  totalPrice,
  supply,
  status,
  isBuyer = false,
  isMerchant = false,
  onRelease,
  onRefund,
  isLoading = false,
}: OrderTrackingProps) => {
  const statusColors: Record<string, string> = {
    funded: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200",
    released:
      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
    refunded: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
  };

  const statusEmoji: Record<string, string> = {
    funded: "💰",
    released: "✅",
    refunded: "↩️",
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Order #{orderId}</h3>
          <p className="text-sm text-gray-500">Token ID: {tokenId}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}
        >
          {statusEmoji[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
          <p className="text-xs text-gray-600 dark:text-gray-400">Quantity</p>
          <p className="font-semibold">{supply}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Total Price
          </p>
          <p className="font-semibold text-blue-600 dark:text-blue-400">
            {weiToEth(totalPrice)} ETH
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {totalPrice} Wei
          </p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded mb-4 space-y-2">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Buyer</p>
          <p className="text-sm font-mono">
            {buyer.slice(0, 6)}...{buyer.slice(-4)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Merchant</p>
          <p className="text-sm font-mono">
            {merchant.slice(0, 6)}...{merchant.slice(-4)}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {isBuyer && status === "funded" && onRelease && (
          <Button
            size="sm"
            color="success"
            onPress={onRelease}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Processing..." : "Confirm Receipt"}
          </Button>
        )}

        {isMerchant && status === "funded" && onRefund && (
          <Button
            size="sm"
            color="danger"
            onPress={onRefund}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Processing..." : "Issue Refund"}
          </Button>
        )}

        {status === "released" && (
          <div className="flex-1 bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              ✅ Payment released to merchant
            </p>
          </div>
        )}

        {status === "refunded" && (
          <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              ↩️ Refund sent to buyer
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface OrderHistoryProps {
  orders: Array<{
    orderId: number;
    tokenId: number;
    buyer: string;
    merchant: string;
    totalPrice: string;
    supply: number;
    status: "funded" | "released" | "refunded";
  }>;
  currentUserAddress?: string;
}

export const OrderHistory = ({
  orders,
  currentUserAddress,
}: OrderHistoryProps) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const isBuyer = currentUserAddress?.toLowerCase() === order.buyer.toLowerCase();
        const isMerchant = currentUserAddress?.toLowerCase() === order.merchant.toLowerCase();

        return (
          <OrderTracking
            key={order.orderId}
            orderId={order.orderId}
            tokenId={order.tokenId}
            buyer={order.buyer}
            merchant={order.merchant}
            totalPrice={order.totalPrice}
            supply={order.supply}
            status={order.status}
            isBuyer={isBuyer}
            isMerchant={isMerchant}
          />
        );
      })}
    </div>
  );
};
