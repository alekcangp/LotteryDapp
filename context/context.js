import { createContext, useState, useEffect, useContext } from "react";
//import Web3 from "web3";
//import createLotteryContract from "../utils/lotteryContract";
//import createTokenContract from "../utils/tokenContract";
//import { contractAddress } from "../utils/constants.js";
import spin from "./spin.svg";
import {
  contractAddress,
  contractABI,
  tokenABI,
  tokenAddress,
} from "../utils/constants.js";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

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
  //const [web3, setWeb3] = useState();
  //const [lotteryContract, setLotteryContract] = useState();
  // const [tokenContract, setTokenContract] = useState();
  const [lotteryPot, setLotteryPot] = useState(" ");
  const [wait, setWait] = useState("ENTER");
  const [lotteryPlayers, setLotteryPlayers] = useState([]);
  const [lastWinner, setLastWinner] = useState([]);
  const [lotteryId, setLotteryId] = useState(" ");
  const owner = "0xA1485801Ea9d4c890BC7563Ca92d90c4ae52eC75";

  const { address: addr } = useAccount();

  // ENTERING
  const { config: conf1 } = usePrepareContractWrite({
    address: contractAddress,
    abi: contractABI,
    functionName: "enter",
    args: [],
  });
  const { write: ente, data: has1 } = useContractWrite({
    ...conf1,
    onSuccess(data) {
      setWait(<img src={spin} />);
    },
  });

  const waitForEntering = useWaitForTransaction({
    hash: has1?.hash,
    timeout: 30_000,
    onSettled(data, error) {
      setWait("ENTER");
      updateLottery();
    },
  });

  // APPROVING
  const { config: conf2 } = usePrepareContractWrite({
    address: tokenAddress,
    abi: tokenABI,
    functionName: "approve",
    args: [contractAddress, "10000000000000000000000"],
  });
  const { write: appr, data: has2 } = useContractWrite({
    ...conf2,
    onSuccess(data) {
      setWait(<img src={spin} />);
    },
  });
  const waitForApproving = useWaitForTransaction({
    hash: has2?.hash,
    timeout: 30_000,
    onSettled(data, error) {
      setWait("ENTER");
      if (!error) ente();
    },
  });

  // CHECK ALLOW
  const { data: allow } = useContractRead({
    address: tokenAddress,
    abi: tokenABI,
    functionName: "allowance",
    args: [addr, contractAddress],
  });

  //PICKING
  const { config: conf3 } = usePrepareContractWrite({
    address: contractAddress,
    abi: contractABI,
    functionName: "pickWinner",
    args: [],
  });
  const { write: pick, data: has3 } = useContractWrite({
    ...conf3,
    onSuccess(data) {
      setWait(<img src={spin} />);
    },
  });

  const waitForPicking = useWaitForTransaction({
    hash: has3?.hash,
    timeout: 30_000,
    onSettled(data, error) {
      setWait("ENTER");
      updateLottery();
    },
  });

  const pickWinner = () => {
    pick();
  };

  useEffect(() => {
    updateLottery();
    setAddress(addr);
    //connectWallet();
  }, [addr]);

  const enterLottery = () => {
    if (!addr || wait != "ENTER") return;
    if (allow == 0x00) {
      appr();
    } else {
      ente();
    }
  };

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
    /*
    if (lotteryContract) {
      const pot = await lotteryContract.methods.getbalance().call();
      setLotteryPot(web3.utils.fromWei(pot, "ether") + " WBGL");
      setLotteryId(await lotteryContract.methods.lotteryId().call());
      setLotteryPlayers(await lotteryContract.methods.getPlayers().call());
      // console.log(lotteryPlayers);
      setLastWinner(await lotteryContract.methods.getWinners().call());
      // console.log([...lastWinner], "Last Winners");
    } else {
     */
    setLotteryId(await tg("lotteryId"));
    setLotteryPot(Math.floor((await tg("getbalance")) * 10 ** -18) + " WBGL");
    setLastWinner(await tg("getWinners"));
    setLotteryPlayers(await tg("getPlayers"));
    // }
  };
  /*
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
    if (wait != "ENTER") return;
    try {
      const bal = await tokenContract.methods.balanceOf(address).call();
      //console.log(bal);
      if (bal < 5) {
        alert("Insufficient Balance. Requires 5 WBGL");
        return;
      }

      const appr = await tokenContract.methods
        .allowance(address, contractAddress)
        .call();
      if (appr == 0) {
        setWait(<img src={spin} />);
        await tokenContract.methods
          .approve(contractAddress, web3.utils.toWei("100000"))
          .send({
            from: address,
            value: 0,
            gas: 100000,
            gasPrice: null,
          });
      }
      setWait(<img src={spin} />);
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
    //setWait("ENTER");
  };

  //pick winner
  const pickWinner = async () => {
    setWait(<img src={spin} />);
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
    //setWait("ENTER");
  };
*/
  return (
    <appContext.Provider
      value={{
        //connectWallet,
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
