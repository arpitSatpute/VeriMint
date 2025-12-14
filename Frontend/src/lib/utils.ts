import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts CID from various IPFS URI formats
 * Handles: ipfs://QM..., https://gateway.pinata.cloud/ipfs/QM..., or raw CID
 */
export function extractCIDFromURI(uri: string): string {
  if (!uri) return ""
  
  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "")
  } else if (uri.includes("ipfs/")) {
    return uri.split("ipfs/").pop() || uri
  }
  
  return uri
}

/**
 * Converts CID to ipfs:// format for storage
 */
export function formatCIDAsIPFS(cid: string): string {
  if (!cid) return ""
  
  // Remove any existing ipfs:// prefix
  const cleanCID = cid.replace("ipfs://", "").split("ipfs/").pop() || cid
  
  return `ipfs://${cleanCID}`
}

/**
 * Converts CID to full gateway URL for retrieval
 */
export function getCIDGatewayURL(cid: string, gateway: string = "https://gateway.pinata.cloud"): string {
  if (!cid) return ""
  
  const cleanCID = extractCIDFromURI(cid)
  return `${gateway}/ipfs/${cleanCID}`
}

/**
 * Gets multiple gateway URLs for a CID (for fallback)
 */
export function getIPFSGatewayURLs(cid: string): string[] {
  if (!cid) return []
  
  const cleanCID = extractCIDFromURI(cid)
  
  return [
    `https://magenta-neat-tahr-183.mypinata.cloud/ipfs/${cleanCID}`, // Primary: Custom Pinata
    `https://gateway.pinata.cloud/ipfs/${cleanCID}`,                  // Secondary: Standard Pinata
    `https://cloudflare-ipfs.com/ipfs/${cleanCID}`,                   // Fallback: Cloudflare
    `https://ipfs.io/ipfs/${cleanCID}`,                               // Fallback: IPFS.io
  ]
}
