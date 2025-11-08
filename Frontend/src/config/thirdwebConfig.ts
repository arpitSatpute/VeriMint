import { createThirdwebClient } from "thirdweb";
import { createWallet } from "thirdweb/wallets";

export const client = createThirdwebClient({
  clientId: "454a2219fc0f5d84d11f0708b4c3b66f",
});

export const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
  createWallet("com.binance.wallet"),
  createWallet("app.phantom"),
];

