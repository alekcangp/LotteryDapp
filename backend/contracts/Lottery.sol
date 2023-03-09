/**
 *Submitted for verification at BscScan.com on 2023-02-18
*/

//SPDX-License-Identifier:MIT
pragma solidity ^0.8.15;

interface IERC20 {
    // mind the `view` modifier
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract BGLLottery{
    //State /Storage Variable
    address public owner;
    address public dao;
    address public token;
    address[] public players;
    address[] public winners;
    uint public lotteryId;

    constructor(){
        owner= msg.sender;
        lotteryId = 0;
        token = 0x2bA64EFB7A4Ec8983E22A49c81fa216AC33f383A; // WBGL token
        dao = 0x9Cc7585C46cA051d97F9938a935C5753667fB3C5; //DAO treasure
    }

    //Enter Function to enter in lottery
    function enter()public {
        require(IERC20(token).balanceOf(msg.sender) >= 50*10**18, "Insufficient Balance");
        IERC20(token).transferFrom(msg.sender, address(this), 50*10**18);
        players.push(msg.sender);
    }

    //Get Players
    function  getPlayers() public view returns(address[] memory){
        return players;
    }

    //Get Balance 
    function getbalance() public view returns(uint){
        return IERC20(token).balanceOf(address(this));
    }
     
    //Get Lottery Id
    function getLotteryId() public view returns(uint){
        return lotteryId;
    }
    
    //Get a random number (helper function for picking winner)
    function getRandomNumber() public view returns(uint){
        bytes32 blockHash = blockhash(block.number);
        return uint(keccak256(abi.encodePacked(block.timestamp, blockHash)));
    }

    //Pick Winner
    function pickWinner() public onlyOwner{
        require(players.length > 0, "No tickets were purchased");
        uint randomIndex =getRandomNumber()%players.length;
        IERC20(token).transfer(players[randomIndex], getbalance());
        winners.push(players[randomIndex]);
        //Current lottery done
        lotteryId++;
        //Clear the player array
        players =new address[](0);
    }
  
    function getWinners() public view returns(address[] memory){
        return winners;
    }

    modifier onlyOwner(){
        require(msg.sender == owner || msg.sender == dao,"Only owner or DAO have control");
        _;
    }


}
