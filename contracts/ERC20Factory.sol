// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./ERC20.sol";

contract ERC20Factory {

    address owner;
    address implementation;
    bool public Manager;

    /// @dev initialize owner equal to msg.sender and make FeeManager as default mode
    constructor(address _implementation) {
        owner = msg.sender;
        implementation = _implementation;
        Manager = true;
    }
  
    /// @notice user change mode of its requirements
    /// @dev switch mode from current on mode to another
    function switchMode() internal {
        if(Manager) {
            Manager = false;
        }
        else {
            Manager = true;

        }
    }


    /// @notice user can create clone of ERC20 token
    /// @param _name name of the token to create
    /// @param _symbol symbol of token to create
    /// @param _totalSupply totalsupply of token
    function createToken(string memory _name, string memory _symbol, uint256 _totalSupply) external returns(address) {
        address clone = Clones.clone(implementation);
        ERC20(clone).init(_name, _symbol, _totalSupply);
        
        if(Manager) {
            switchMode();
            uint256 fees = (_totalSupply*3)/1000000;
            ERC20(clone).transfer(owner, fees);
            ERC20(clone).transfer(msg.sender, _totalSupply - fees);
        }
        else {
            uint256 fees = (_totalSupply*2)/1000000;
            ERC20(clone).transfer(owner, fees);
            ERC20(clone).transfer(msg.sender, _totalSupply - fees);
        }

        ERC20(clone).transferOwner(msg.sender);
        return address(clone);
    }
}

