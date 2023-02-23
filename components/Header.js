import style from "../styles/Header.module.css";
import truncateEthAddress from "truncate-eth-address";
import ConnectWalletBtn from "./ConnectWalletBtn";
import UserCard from "./UserCard";
import { useAppContext } from "../context/context";
import { ConnectButton } from "@rainbow-me/rainbowkit";
const Header = () => {
  // TODO: Get the connectWallet and address from context.
  // TODO: Replace the static address with the currently logged in user.
  const { connectWallet, address } = useAppContext();

  return (
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
            <feGaussianBlur in="thicken" stdDeviation="5" result="blurred" />
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
            <feGaussianBlur in="thicken" stdDeviation="25" result="blurred" />
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
    </div>
  );
};
export default Header;
