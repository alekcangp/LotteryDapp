import style from "../styles/Header.module.css";
import truncateEthAddress from "truncate-eth-address";
import ConnectWalletBtn from "./ConnectWalletBtn";
import UserCard from "./UserCard";
import { useAppContext } from "../context/context";

import "@rainbow-me/rainbowkit/styles.css";
import merge from "lodash.merge";
import {
  getDefaultWallets,
  connectorsForWallets,
  RainbowKitProvider,
  darkTheme,
  Theme,
} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rainbowWallet,
  coinbaseWallet,
  walletConnectWallet,
  trustWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { goerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const { chains, provider } = configureChains([goerli], [publicProvider()]);

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

const Header = () => {
  // TODO: Get the connectWallet and address from context.
  // TODO: Replace the static address with the currently logged in user.
  const { connectWallet, address } = useAppContext();

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        chains={chains}
        theme={myTheme}
        modalSize="compact"
        showRecentTransactions={true}
      >
        <div className={style.wrapper}>
          <div className={style.neon}>BGL Lottery</div>
          <svg>
            <defs>
              <filter id="stroke">
                <feMorphology
                  operator="dilate"
                  radius="1"
                  in="SourceGraphic"
                  result="outside"
                />
                <feMorphology
                  operator="dilate"
                  radius="2"
                  in="outside"
                  result="thickened"
                />
                <feComposite
                  operator="out"
                  in2="SourceGraphic"
                  in="thickened"
                  result="stroke"
                />
              </filter>

              <filter id="inner-glow">
                <feFlood floodColor="#e10b8d" />
                <feComposite in2="SourceAlpha" operator="out" />
                <feGaussianBlur stdDeviation="0.5" result="blur" />
                <feComposite operator="atop" in2="SourceGraphic" />
              </filter>

              <filter id="outer-glow">
                <feMorphology
                  operator="dilate"
                  radius="2"
                  in="SourceAlpha"
                  result="thicken"
                />
                <feGaussianBlur
                  in="thicken"
                  stdDeviation="5"
                  result="blurred"
                />
                <feFlood floodColor="#db0273" result="glowColor" />
                <feComposite
                  in="glowColor"
                  in2="blurred"
                  operator="in"
                  result="softGlow_colored"
                />
                <feMerge>
                  <feMergeNode in="softGlow_colored" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="outer-glow1">
                <feMorphology
                  operator="dilate"
                  radius="20"
                  in="SourceAlpha"
                  result="thicken"
                />
                <feGaussianBlur
                  in="thicken"
                  stdDeviation="25"
                  result="blurred"
                />
                <feFlood floodColor="#383c47" result="glowColor" />
                <feComposite
                  in="glowColor"
                  in2="blurred"
                  operator="in"
                  result="softGlow_colored"
                />
                <feMerge>
                  <feMergeNode in="softGlow_colored" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>
          {/* TODO: Conditionally render connect button if no user is logged in. */}
          {/* TODO: pass in the address to the userCard */}
          {/* TODO: pass in the connect Wallet function to the connect Wallet Button. */}
          <ConnectButton />

          {address ? (
            <UserCard address={address} />
          ) : (
            <ConnectWalletBtn connectWallet={connectWallet} />
          )}
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
};
export default Header;
