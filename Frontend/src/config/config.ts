import { createConfig, http, injected } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { metaMask, safe } from 'wagmi/connectors'
// removed metamask import (not available in this wagmi version)

export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
  connectors: [
    injected(),
    safe(),
    metaMask(),
    
  ],
})