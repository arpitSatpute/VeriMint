import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  resolve: {
    alias: {
      buffer: "buffer/",
      process: "process",
      stream: "stream-browserify",
      util: "util",
    },
    conditions: ['import', 'module', 'browser', 'default']
  },
  define: {
    'global': 'globalThis',
    'process.env': {},
    'process.version': JSON.stringify(''),
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      conditions: ['import', 'module', 'browser', 'default'],
    },
    include: [
      'buffer',
      'process/browser',
      'multiformats',
      'multiformats/cid',
      'multiformats/hashes/digest',
      'multiformats/bases/base58',
      '@lit-protocol/lit-node-client',
    ]
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  }
});
