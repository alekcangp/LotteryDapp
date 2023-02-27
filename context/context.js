import { createContext, useState, useEffect, useContext } from "react";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
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
  useNetwork,
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

  const addRecentTransaction = useAddRecentTransaction();

  const { address: addr, isDisconnected } = useAccount();
  const { chain } = useNetwork();

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
      //console.log(data?.hash);
      setWait(<img src={spin} />);
      addRecentTransaction({
        hash: data?.hash,
        description: "Enter",
      });
    },
  });

  const waitForEntering = useWaitForTransaction({
    hash: has1?.hash,
    timeout: 60_000,
    onSettled(data, error) {
      setWait("ENTER");
      updateLottery();
    },
  });

  /*
  const contractId = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: 'lotteryId',
    watch: true,
  })
  
  const contractBalance = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getbalance',
    watch: true,
  })
  
  const contractWinners = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getWinners',
    watch: true,
  })
  
  const contractPlayers = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getPlayers',
    watch: true,
  })
  
*/
  // CHECK ALLOW
  const { data: allow } = useContractRead({
    address: tokenAddress,
    abi: tokenABI,
    functionName: "allowance",
    args: [addr, contractAddress],
    watch: true,
  });

  // CHECK BALANCE
  const { data: bala } = useContractRead({
    address: tokenAddress,
    abi: tokenABI,
    functionName: "balanceOf",
    args: [addr],
    watch: true,
  });

  //PICKING
  const { config: conf3 } = usePrepareContractWrite({
    address: contractAddress,
    abi: contractABI,
    functionName: "pickWinner",
    args: [],
  });
  const { write: pickwin, data: has3 } = useContractWrite({
    ...conf3,
    onSuccess(data) {
      setWait(<img src={spin} />);
      addRecentTransaction({
        hash: data?.hash,
        description: "Pick winner",
      });
    },
  });

  const waitForPicking = useWaitForTransaction({
    hash: has3?.hash,
    timeout: 60_000,
    onSettled(data, error) {
      setWait("ENTER");
      updateLottery();
    },
  });

  useEffect(() => {
    updateLottery();
    setAddress(addr);
    //connectWallet();
  }, [contractAddress, addr]);

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
      addRecentTransaction({
        hash: data?.hash,
        description: "Approve",
      });
    },
  });
  const waitForApproving = useWaitForTransaction({
    hash: has2?.hash,
    timeout: 60_000,
    onSettled(data, error) {
      if (!error) {
        setTimeout(ente, 2000);
      } else {
        setWait("ENTER");
      }
    },
  });

  //ENTER
  const enterLottery = () => {
    //console.log(parseInt(bala._hex));
    if (isDisconnected) alert("Connect wallet");
    if (!addr || wait != "ENTER" || chain?.id != 5) return;

    if (parseInt(bala._hex) < 5 * 10 ** 18) {
      alert("Insufficient Balance. Requires 5 WBGL");
      return;
    }
    if (allow._hex == 0x00) {
      appr();
    } else {
      ente();
    }
  };

  const pickWinner = async () => {
    if (!addr || wait != "ENTER" || chain?.id != 5) return;
    /*
    const receipt = await client.proposal(web3, addr, {
      space: "bgldao.eth",
      type: "single-choice", // define the voting system
      title: "Pick winner #1",
      body: "https://lottery.bglnode.online",
      choices: ["Yes", "No"],
      start: 1677427433,
      end: 1677686633,
      snapshot: 26005935,
      network: "56",
      plugins: JSON.stringify({
        safeSnap: {
          safes: [
            {
              network: "56",
              realityAddress: "0xa7B8d36708604c46dc896893ea58357A975d6E6b",
              txs: [
                {
                  hash: "0xc4868a46ac22bee2156986a90f5d1c2de91ec3b16c2e49bb8d2570177d3939dc",
                  nonce: 0,
                  mainTransaction: {
                    to: "0xad9E04188058B877Bc894b4c30Ba39A5c442AF27",
                    data: "0x5d495aea",
                    nonce: "0",
                    operation: "0",
                    type: "contractInteraction",
                    value: "0",
                    abi: ["function pickWinner()"],
                  },
                  transactions: [
                    {
                      to: "0xad9E04188058B877Bc894b4c30Ba39A5c442AF27",
                      data: "0x5d495aea",
                      nonce: 0,
                      operation: "0",
                      type: "contractInteraction",
                      value: "0",
                      abi: ["function pickWinner()"],
                    },
                  ],
                },
              ],
              multiSendAddress: "0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761",
              hash: "0x552cca439bfb45142b3e7ccf5d90e0e6403e87a7a05d2fab246bd287ace351e2",
            },
          ],
          valid: true,
        },
      }),
      app: "snapshot", // provide the name of your project which is using this snapshot.js integration
    });
    //pickwin();
    receipt();
    */
    pickwin();
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
