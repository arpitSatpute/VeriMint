/**
 * Convert Wei to ETH
 * @param wei - Amount in Wei (as string or bigint)
 * @returns Amount in ETH formatted to 6 decimal places
 */
export const weiToEth = (wei: string | bigint): string => {
  try {
    const weiNum = typeof wei === "string" ? BigInt(wei) : wei;
    const ethNum = Number(weiNum) / 1e18;
    return ethNum.toFixed(6);
  } catch {
    return "0";
  }
};

/**
 * Format price for display with both Wei and ETH
 * @param wei - Amount in Wei (as string or bigint)
 * @returns Formatted string like "0.001234 ETH"
 */
export const formatPrice = (wei: string | bigint): string => {
  return `${weiToEth(wei)} ETH`;
};

/**
 * Format price with Wei notation
 * @param wei - Amount in Wei (as string or bigint)
 * @returns Formatted string like "1000000000000000 Wei (0.001 ETH)"
 */
export const formatPriceDetailed = (wei: string | bigint): string => {
  const weiStr = typeof wei === "string" ? wei : wei.toString();
  const eth = weiToEth(wei);
  return `${weiStr} Wei (${eth} ETH)`;
};
