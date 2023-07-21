//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Neopolis {
	string public constant name = "Neopolis";
	string public constant symbol = "BLX";
	uint public constant initialTowerHeight = 100;
	uint public constant initialTowerPosition = 1;

	event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
	event Transfer(address indexed from, address indexed to, uint tokens);
	event Placement(uint position, uint newHeight);

	mapping(address => uint) balances;
	mapping(address => mapping (address => uint)) allowed;
	mapping(uint => uint) towers;
  
	uint totalSupply_;
	uint totalBalanceInPlay_ = 0;

	using SafeMath for uint;

	constructor(uint initialOwnerBalance) {
		totalSupply_ = initialOwnerBalance + initialTowerHeight;
		totalBalanceInPlay_ = initialTowerHeight;
		balances[msg.sender] = initialOwnerBalance;
		towers[initialTowerPosition] = initialTowerHeight;
	}

  function totalSupply() public view returns (uint) {
		return totalSupply_;
  }

	function balanceOf(address tokenOwner) public view returns (uint) {
		return balances[tokenOwner];
	}

	function transfer(address receiver, uint numTokens) public returns (bool) {
		require(numTokens <= balances[msg.sender], "Error: Transfer amount exceeds account balance");
		balances[msg.sender] = balances[msg.sender].sub(numTokens);
		balances[receiver] = balances[receiver].add(numTokens);
		emit Transfer(msg.sender, receiver, numTokens);
		return true;
	}

	function approve(address delegate, uint numTokens) public returns (bool) {
		allowed[msg.sender][delegate] = numTokens;
		emit Approval(msg.sender, delegate, numTokens);
		return true;
	}

	function allowance(address owner, address delegate) public view returns (uint) {
		return allowed[owner][delegate];
	}

	function transferFrom(address owner, address buyer, uint numTokens) public returns (bool) {
		require(numTokens <= balances[owner], "Error: transfer amount exceeds account balance");    
		require(numTokens <= allowed[owner][msg.sender], "Error: transfer amount exceeds approved withdrawal amount");

		balances[owner] = balances[owner].sub(numTokens);
		allowed[owner][msg.sender] = allowed[owner][msg.sender].sub(numTokens);
		balances[buyer] = balances[buyer].add(numTokens);
		emit Transfer(owner, buyer, numTokens);
		return true;
	}

	function totalBalanceInPlay() public view returns (uint) {
		return totalBalanceInPlay_;
  }

	function heightOf(uint position) public view returns (uint) {
		return towers[position];
	}

	function place(uint position) public returns (bool) {
		require(balances[msg.sender] >= 1, "Error: account has no available balance to place");
		require(position >= 0 && position <= 20, "Error: placement position out of range");

		bool toppled = _toppled(towers[position]);

		if (toppled) {
			balances[msg.sender] = balances[msg.sender].add(towers[position]);
			totalBalanceInPlay_ = totalBalanceInPlay_.sub(towers[position]);
			towers[position] = 0;
		} else {
			balances[msg.sender] = balances[msg.sender].sub(1);
			totalBalanceInPlay_ = totalBalanceInPlay_.add(1);
			towers[position] = towers[position].add(1);
		}
		emit Placement(position, towers[position]);
		return true;
	}

	function _toppled(uint towerHeight) private view returns(bool) {
		return _randomNumberUpToNinetyNine() + towerHeight > 100;
	}

	function _randomNumberUpToNinetyNine() private view returns(uint) {
		return uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % 99;
	}
}

library SafeMath { 
	function sub(uint a, uint b) internal pure returns (uint) {
		assert(b <= a);
		return a - b;
	}
	
	function add(uint a, uint b) internal pure returns (uint) {
		uint c = a + b;
		assert(c >= a);
		return c;
	}
}
