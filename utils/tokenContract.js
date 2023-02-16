import { tokenAddress, tokenABI } from "./constants";

const createTokenContract = (web3) => {
  return new web3.eth.Contract(tokenABI, tokenAddress);
};

export default createTokenContract;
