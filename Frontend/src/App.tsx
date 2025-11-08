import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import Merchant from "@/pages/Merchant";
import Order from "@/pages/Order";
import Product from "@/pages/Product";
import AboutPage from "@/pages/about";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/config/config";
import {ThirdwebProvider} from "thirdweb/react";


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
          </Routes>
        </QueryClientProvider>
      </ThirdwebProvider>
      </div>
    </WagmiProvider>
   
  );
}

export default App;
