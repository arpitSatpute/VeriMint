import { useParams } from "react-router-dom";
import DefaultLayout from "@/layouts/default";
import MerchantAddressDecrypt from "./MerchantAddressDecrypt";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DecryptPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  if (!orderId) {
    return (
      <DefaultLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white/70">Order ID not found</div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-screen py-8 px-4 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/order")}
            className="flex items-center gap-2 text-indigo-300 hover:text-indigo-200 transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Orders
          </button>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300 mb-2">
            Reveal Delivery Address
          </h1>
          <p className="text-white/60">Order #{orderId}</p>
        </div>

        {/* Decrypt Component */}
        <div className="max-w-2xl mx-auto">
          <MerchantAddressDecrypt orderId={orderId} />
        </div>
      </div>
    </DefaultLayout>
  );
}
