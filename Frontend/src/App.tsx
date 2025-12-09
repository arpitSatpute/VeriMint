import { Route, Routes } from "react-router-dom";

import IndexPage from "./pages/index.tsx";
import Order from "./pages/Order.tsx";
import Product from "./pages/Product.tsx";
import AboutPage from "./pages/about.tsx";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/config/config";
import {ThirdwebProvider} from "thirdweb/react";
import PhysicalProductMint from "./forms/PhysicalProductMint.tsx";
import VirtualProductMint from "./forms/VirtualProductMint.tsx";
import CreateOrderForm from "./forms/CreateOrder.tsx";
import ProductDetails from "./pages/ProductDetails.tsx";
import Merchant from "./pages/Merchant.tsx";


const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <div className="dark text-foreground bg-background">
      <ThirdwebProvider>
        <QueryClientProvider client={queryClient} >
          <Routes>
            <Route element={<IndexPage />} path="/" />
            <Route element={<Merchant />} path="/merchant" />
            <Route element={<Product />} path="/product" />
            <Route element={<Order />} path="/order" />
            <Route element={<AboutPage />} path="/about" />
            <Route element={<PhysicalProductMint />} path="/physicalMint" />
            <Route element={<VirtualProductMint />} path="/virtualMint" />
            <Route element={<CreateOrderForm />} path="/createOrder/:id" />
            <Route element={<ProductDetails />} path="/productDetails/:id" />
          </Routes>
        </QueryClientProvider>
      </ThirdwebProvider>
      </div>
    </WagmiProvider>
   
  );
}

export default App;
