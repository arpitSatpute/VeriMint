import DefaultLayout from "@/layouts/default";
import { useAccount } from "wagmi";
import { useState } from "react";
import { Button } from "@heroui/button";
import {
  OrderTracking,
} from "@/components/escrow/EscrowComponents";
import { title, subtitle } from "@/components/primitives";

interface Order {
  orderId: number;
  tokenId: number;
  buyer: string;
  merchant: string;
  totalPrice: string;
  supply: number;
  status: "funded" | "released" | "refunded";
}

export default function OrdersPage() {
  const { address, isConnected } = useAccount();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Demo orders
  const demoOrders: Order[] = [
    {
      orderId: 1,
      tokenId: 1,
      buyer: address || "0x1111111111111111111111111111111111111111",
      merchant: "0x1234567890123456789012345678901234567890",
      totalPrice: "1000000000000000000",
      supply: 1,
      status: "funded",
    },
    {
      orderId: 2,
      tokenId: 2,
      buyer: "0x2222222222222222222222222222222222222222",
      merchant: address || "0x1234567890123456789012345678901234567890",
      totalPrice: "2500000000000000000",
      supply: 1,
      status: "released",
    },
    {
      orderId: 3,
      tokenId: 3,
      buyer: address || "0x3333333333333333333333333333333333333333",
      merchant: "0x0987654321098765432109876543210987654321",
      totalPrice: "1500000000000000000",
      supply: 3,
      status: "refunded",
    },
  ];

  const handleReleasePayment = async (orderId: number) => {
    setIsLoading(true);
    try {
      // TODO: Implement escrow release logic
      console.log("Releasing payment for order:", orderId);
      const updatedOrders = orders.map((o) =>
        o.orderId === orderId ? { ...o, status: "released" as const } : o
      );
      setOrders(updatedOrders);
      alert(`Payment released for order ${orderId}`);
    } catch (error) {
      console.error("Release failed:", error);
      alert("Failed to release payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIssueRefund = async (orderId: number) => {
    setIsLoading(true);
    try {
      // TODO: Implement escrow refund logic
      console.log("Issuing refund for order:", orderId);
      const updatedOrders = orders.map((o) =>
        o.orderId === orderId ? { ...o, status: "refunded" as const } : o
      );
      setOrders(updatedOrders);
      alert(`Refund issued for order ${orderId}`);
    } catch (error) {
      console.error("Refund failed:", error);
      alert("Failed to issue refund. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const displayOrders = orders.length > 0 ? orders : demoOrders;

  if (!isConnected) {
    return (
      <DefaultLayout>
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
          <h1 className={title()}>Order Management</h1>
          <p className={subtitle({ class: "mt-4" })}>
            Connect your wallet to view orders and manage escrow
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
            <h1 className={title()}>Order & Escrow Management</h1>
            <p className={subtitle({ class: "mt-4" })}>
              Track orders and manage secure payments
            </p>
          </div>

          {/* Tabs/Filter Buttons */}
          <div className="flex gap-2 mb-8 flex-wrap">
            <Button
              size="sm"
              color={selectedOrderId === null ? "primary" : "default"}
              variant={selectedOrderId === null ? "solid" : "bordered"}
              onPress={() => setSelectedOrderId(null)}
            >
              All Orders
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Total Orders
              </p>
              <p className="text-3xl font-bold">{displayOrders.length}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 p-6">
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                Funded (Pending)
              </p>
              <p className="text-3xl font-bold">
                {displayOrders.filter((o) => o.status === "funded").length}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-6">
              <p className="text-green-700 dark:text-green-300 text-sm">
                Released
              </p>
              <p className="text-3xl font-bold">
                {displayOrders.filter((o) => o.status === "released").length}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
              <p className="text-blue-700 dark:text-blue-300 text-sm">Refunded</p>
              <p className="text-3xl font-bold">
                {displayOrders.filter((o) => o.status === "refunded").length}
              </p>
            </div>
          </div>

          {/* Orders List */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>

            {selectedOrderId !== null ? (
              // Detail view
              <div>
                {displayOrders.map((order) => {
                  if (order.orderId === selectedOrderId) {
                    const isBuyer = address?.toLowerCase() === order.buyer.toLowerCase();
                    const isMerchant = address?.toLowerCase() === order.merchant.toLowerCase();

                    return (
                      <div key={order.orderId} className="mb-4">
                        <div className="mb-4">
                          <Button
                            size="sm"
                            color="default"
                            variant="bordered"
                            onPress={() => setSelectedOrderId(null)}
                          >
                            ← Back to List
                          </Button>
                        </div>
                        <OrderTracking
                          orderId={order.orderId}
                          tokenId={order.tokenId}
                          buyer={order.buyer}
                          merchant={order.merchant}
                          totalPrice={order.totalPrice}
                          supply={order.supply}
                          status={order.status}
                          isBuyer={isBuyer}
                          isMerchant={isMerchant}
                          onRelease={
                            isBuyer && order.status === "funded"
                              ? () => handleReleasePayment(order.orderId)
                              : undefined
                          }
                          onRefund={
                            isMerchant && order.status === "funded"
                              ? () => handleIssueRefund(order.orderId)
                              : undefined
                          }
                          isLoading={isLoading}
                        />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ) : (
              // List view
              <div className="space-y-3">
                {displayOrders.map((order) => {
                  const isBuyer = address?.toLowerCase() === order.buyer.toLowerCase();
                  const isMerchant = address?.toLowerCase() === order.merchant.toLowerCase();
                  const statusColors: Record<string, string> = {
                    funded:
                      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200",
                    released:
                      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
                    refunded:
                      "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
                  };

                  return (
                    <div
                      key={order.orderId}
                      className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedOrderId(order.orderId)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">
                            Order #{order.orderId}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Token ID {order.tokenId} • {order.supply} units
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">
                            Total
                          </p>
                          <p className="font-semibold">
                            {(parseFloat(order.totalPrice) / 1e18).toFixed(4)}{" "}
                            ETH
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">
                            Role
                          </p>
                          <p className="font-semibold">
                            {isBuyer ? "Buyer" : isMerchant ? "Merchant" : "—"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600 dark:text-gray-400">
                            Action
                          </p>
                          <p className="font-semibold text-blue-600 dark:text-blue-400">
                            View →
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
            <h3 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">
              How Escrow Works
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>
                ✓ <strong>Buyer funds order:</strong> Payment is held in escrow
                contract
              </li>
              <li>
                ✓ <strong>Buyer confirms:</strong> Buyer receives goods and
                confirms
              </li>
              <li>
                ✓ <strong>Payment released:</strong> Merchant receives payment
                upon confirmation
              </li>
              <li>
                ✓ <strong>Merchant refunds:</strong> Or merchant can issue
                refund if needed
              </li>
            </ul>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
