//SPDX-License-Identifier:MIT
pragma solidity ^0.8.15;

interface IERC20 {
    // mind the `view` modifier
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract Lottery{
    //State /Storage Variable
    address public owner;
    address public token;
    address public module;
    address payable[] public players;
    address[] public winners;
    uint public lotteryId;

    //Constructor runs when the cintract is deployed
    constructor(){
        owner= msg.sender;
        lotteryId = 0;
        token = 0xFD4b70e285DfB9710eA9e95e58EaE824Fa00488A;
        module = 0xa7B8d36708604c46dc896893ea58357A975d6E6b;
    }

    //Enter Function to enter in lottery
    function enter()public payable{
        require(IERC20(token).balanceOf(msg.sender) >= 100*10**18, "Insufficient Balance");
        IERC20(token).transferFrom(msg.sender, address(this), 100*10**18);
        players.push(payable(msg.sender));
    }

    //Get Players
    function  getPlayers() public view returns(address payable[] memory){
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
        return uint(keccak256(abi.encodePacked(owner,block.timestamp)));
    }

    //Pick Winner
    function pickWinner() public onlyOwner{
        uint randomIndex =getRandomNumber()%players.length;
        IERC20(token).transfer(players[randomIndex], getbalance());
        winners.push(players[randomIndex]);
        //Current lottery done
        lotteryId++;
        //Clear the player array
        players =new address payable[](0);
    }
  
    function getWinners() public view returns(address[] memory){
        return winners;
    }

    modifier onlyOwner(){
        require(msg.sender == owner || msg.sender == module,"Only owner or DAO have control");
        _;
    }


}