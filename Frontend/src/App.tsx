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
import { Toaster } from "react-hot-toast";


const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <div className="dark text-foreground bg-background">
      <ThirdwebProvider>
        <QueryClientProvider client={queryClient} >
          <ScrollToTop />
          <Toaster
            position="bottom-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              // Define default options
              className: '',
              duration: 3000,
              style: {
                background: '#18181b',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.75rem',
              },

              // Default options for specific types
              success: {
                duration: 3000,
                style: {
                  background: '#18181b',
                  color: '#fff',
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                },
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#18181b',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#18181b',
                  color: '#fff',
                  border: '1px solid rgba(248, 113, 113, 0.3)',
                },
                iconTheme: {
                  primary: '#f87171',
                  secondary: '#18181b',
                },
              },
            }}
          />
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
