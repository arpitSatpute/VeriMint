import { Route, Routes } from "react-router-dom";

import IndexPage from "./pages/index";
import DocsPage from "./pages/essentials/DocsPage";
import Order from "./pages/order/Order";
import Product from "./pages/product/Product";
import AboutPage from "./pages/essentials/about";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/config/config";
import {ThirdwebProvider} from "thirdweb/react";
import PhysicalProductMint from "./pages/forms/PhysicalProductMint";
import VirtualProductMint from "./pages/forms/VirtualProductMint";
import CreateOrderForm from "./pages/forms/CreateOrder";
import ProductDetails from "./pages/product/ProductDetails";
import Merchant from "./pages/merchant/Merchant";
import DeliveryPage from "./pages/delivery/Delivery";
import DecryptPage from "./pages/delivery/DecryptPage";
import InfoPage from "./pages/essentials/info";
import ContactPage from "./pages/essentials/contact";
import ScrollToTop from "./components/ScrollToTop";


const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <div className="dark text-foreground bg-background">
      <ThirdwebProvider>
        <QueryClientProvider client={queryClient} >
          <ScrollToTop />
          <Routes>
            <Route element={<IndexPage />} path="/" />
            <Route element={<DocsPage />} path="/docs" />
            <Route element={<ContactPage />} path="/contact" />
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
            <Route element={<InfoPage />} path="/info" />
          </Routes>
        </QueryClientProvider>
      </ThirdwebProvider>
      </div>
    </WagmiProvider>
   
  );
}

export default App;
