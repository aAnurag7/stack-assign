// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Coins is ERC20 {

    constructor () ERC20("myt", "m") {}
    
    function mint(uint256 _amount) external {
       _mint(msg.sender, _amount);
    }
}