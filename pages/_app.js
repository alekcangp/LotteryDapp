import "../styles/globals.css";
import { AppProvider } from "../context/context";
import "@rainbow-me/rainbowkit/styles.css";
import merge from "lodash.merge";
import {
  connectorsForWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rainbowWallet,
  coinbaseWallet,
  walletConnectWallet,
  trustWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { bsc } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const { chains, provider } = configureChains([bsc], [publicProvider()]);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      metaMaskWallet({ chains }),
      rainbowWallet({ chains }),
      coinbaseWallet({ chains }),
      walletConnectWallet({ chains }),
      trustWallet({ chains }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const myTheme = merge(darkTheme(), {
  colors: {
    connectButtonBackground: "#3e4754",
    connectButtonText: "#ff4080",
    accentColorForeground: "#ff4080",
    accentColor: "#3e4754",
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        coolMode
        chains={chains}
        theme={myTheme}
        modalSize="compact"
        showRecentTransactions={true}
      >
        <AppProvider>
          <Component {...pageProps} />
        </AppProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
