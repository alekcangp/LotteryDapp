import { createContext, useState, useEffect, useContext } from "react";
import Web3 from "web3";
import createLotteryContract from "../utils/lotteryContract";
import createTokenContract from "../utils/tokenContract";
import { contractAddress } from "../utils/constants.js";

const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");
const abii = require("../utils/Lottery.json");

Moralis.start({
  apiKey: "N3pNsnH8D0XFr6NURZu4RupAcrQALGHKYzsyAGKQN8Vd7d7RV4SjU52stZVb1T55",
});

export const appContext = createContext();

export const AppProvider = ({ children }) => {
  const [address, setAddress] = useState("");
  //const [chainId, setChain] = useState("");
  const [web3, setWeb3] = useState();
  const [lotteryContract, setLotteryContract] = useState();
  const [tokenContract, setTokenContract] = useState();
  const [lotteryPot, setLotteryPot] = useState(" ");
  const [wait, setWait] = useState();
  const [lotteryPlayers, setLotteryPlayers] = useState([]);
  const [lastWinner, setLastWinner] = useState([]);
  const [lotteryId, setLotteryId] = useState(" ");
  const owner = "0xA1485801Ea9d4c890BC7563Ca92d90c4ae52eC75";

  useEffect(() => {
    updateLottery();
    //connectWallet();
  }, [lotteryContract]);

  // Call contract function
  async function tg(func) {
    const abi = abii.abi;
    const chain = EvmChain.GOERLI; // BSC, GOERLI
    const address = contractAddress;
    var functionName = func;
    const resp = await Moralis.EvmApi.utils.runContractFunction({
      address,
      functionName,
      abi,
      chain,
    });
    return resp.toJSON();
  }
  //Update the lottery Card
  const updateLottery = async () => {
    if (lotteryContract) {
      const pot = await lotteryContract.methods.getbalance().call();
      setLotteryPot(web3.utils.fromWei(pot, "ether") + " WBGL");
      setLotteryId(await lotteryContract.methods.lotteryId().call());
      setLotteryPlayers(await lotteryContract.methods.getPlayers().call());
      // console.log(lotteryPlayers);
      setLastWinner(await lotteryContract.methods.getWinners().call());
      // console.log([...lastWinner], "Last Winners");
    } else {
      setLotteryId(await tg("lotteryId"));
      setLotteryPot(Math.floor((await tg("getbalance")) * 10 ** -18) + " WBGL");
      setLastWinner(await tg("getWinners"));
      setLotteryPlayers(await tg("getPlayers"));
    }
  };

  const connectWallet = async () => {
    // Check if MetaMask is installed
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      const chid = 5;
      try {
        // request wallet connection
        await window.ethereum.request({ method: "eth_requestAccounts" });
        // create web3 instance & set to state
        const web3 = new Web3(window.ethereum);
        // set web3 instance in React state
        setWeb3(web3);
        // get list of accounts
        const accounts = await web3.eth.getAccounts();
        const chain = await web3.eth.getChainId();
        window.ethereum.on("chainChanged", async () => {
          const chai = await web3.eth.getChainId();
          if (chai != chid) window.location.reload();
        });
        if (chain == chid) {
          // set account 1 to React state
          //setChain(chain);
          setAddress(accounts[0]);
          setLotteryContract(createLotteryContract(web3));
          setTokenContract(createTokenContract(web3));
          window.ethereum.on("accountsChanged", async () => {
            const accounts = await web3.eth.getAccounts();
            // set account 1 to react state
            setAddress(accounts[0]);
          });
        } else {
          try {
            await web3.currentProvider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x5" }],
            });
            connectWallet();
            // updateLottery();
          } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
              alert("add this chain id");
            }
          }
        }
      } catch (error) {
        console.log(error, "connect wallet");
      }
    } else {
      alert("Please install Metamask");
    }
  };

  //Enter Lottery
  const enterLottery = async () => {
    setWait(true);
    try {
      const bal = await tokenContract.methods.balanceOf(address).call();
      //console.log(bal);
      if (bal < 50) {
        alert("Insufficient Balance WBGL");
        return;
      }

      const appr = await tokenContract.methods
        .allowance(address, contractAddress)
        .call();
      if (appr == 0) {
        await tokenContract.methods
          .approve(contractAddress, web3.utils.toWei("100000"))
          .send({
            from: address,
            value: 0,
            gas: 100000,
            gasPrice: null,
          });
      }

      await lotteryContract.methods.enter().send({
        from: address,
        value: 0,
        gas: 300000,
        gasPrice: null,
      });
      updateLottery();
    } catch (error) {
      console.log(error);
    }
    setWait(false);
  };

  //pick winner
  const pickWinner = async () => {
    setWait(true);
    try {
      let tx = await lotteryContract.methods.pickWinner().send({
        from: address,
        gas: 300000,
        gasPrice: null,
      });

      console.log(tx);
      updateLottery();
    } catch (err) {
      console.log(err, "pick Winner");
    }
    setWait(false);
  };

  return (
    <appContext.Provider
      value={{
        connectWallet,
        address,
        enterLottery,
        lotteryPot,
        lotteryId,
        lotteryPlayers,
        pickWinner,
        lastWinner,
        owner,
        wait,
      }}
    >
      {children}
    </appContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(appContext);
};
