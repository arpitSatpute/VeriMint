import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import MerchantPage from "@/pages/merchant";
import MarketplacePage from "@/pages/marketplace";
import OrdersPage from "@/pages/orders";
import BuyPage from "@/pages/buy";
import { WagmiProvider } from "wagmi";
import { config } from "@/config/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route element={<IndexPage />} path="/" />
          <Route element={<AboutPage />} path="/about" />
          <Route element={<MerchantPage />} path="/merchant" />
          <Route element={<MarketplacePage />} path="/marketplace" />
          <Route element={<BuyPage />} path="/buy/:tokenId" />
          <Route element={<OrdersPage />} path="/orders" />
        </Routes>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
