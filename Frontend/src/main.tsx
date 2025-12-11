import { Buffer } from "buffer";

// Polyfill Buffer globally for browser BEFORE any other imports
globalThis.Buffer = Buffer;
window.Buffer = Buffer;

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import { Provider } from "./provider.tsx";
import "@/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <Provider>
        <App />
      </Provider>
    </BrowserRouter>
);
