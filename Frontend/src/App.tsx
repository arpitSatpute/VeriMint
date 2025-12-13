import { Route, Routes } from "react-router-dom";

import IndexPage from "./pages/index";
import DocsPage from "./pages/DocsPage";
import Order from "./pages/Order";
import Product from "./pages/Product";
import AboutPage from "./pages/about";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/config/config";
import {ThirdwebProvider} from "thirdweb/react";
import PhysicalProductMint from "./forms/PhysicalProductMint";
import VirtualProductMint from "./forms/VirtualProductMint";
import CreateOrderForm from "./forms/CreateOrder";
import ProductDetails from "./pages/ProductDetails";
import Merchant from "./pages/Merchant";
import DeliveryPage from "./pages/Delivery";
import DecryptPage from "./pages/DecryptPage";


const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <div className="dark text-foreground bg-background">
      <ThirdwebProvider>
        <QueryClientProvider client={queryClient} >
          <Routes>
            <Route element={<IndexPage />} path="/" />
            <Route element={<DocsPage />} path="/docs" />
            <Route element={<Merchant />} path="/merchant" />
            <Route element={<Product />} path="/product" />
            <Route element={<Order />} path="/order" />
            <Route element={<AboutPage />} path="/about" />
            <Route element={<PhysicalProductMint />} path="/physicalMint" />
            <Route element={<VirtualProductMint />} path="/virtualMint" />
            <Route element={<CreateOrderForm />} path="/createOrder/:id" />
            <Route element={<ProductDetails />} path="/productDetails/:id" />
            <Route element={<DeliveryPage />} path="/delivery/:orderId" />
            <Route element={<DecryptPage />} path="/decrypt/:orderId" />
          </Routes>
        </QueryClientProvider>
      </ThirdwebProvider>
      </div>
    </WagmiProvider>
   
  );
}

export default App;
