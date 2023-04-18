// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Stacking is Initializable, Ownable2Step, AccessControl {
    uint256 public start;
    uint256 public end;
    struct StackerDetail{
        uint256 amount;
        uint256 blockNumber;
        address ERC20Contract;
    }
    address contractOwner;
    IERC20 public rewardToken;
    bytes32 public constant DEFAULT_ROLE = keccak256("DEFAULT_ROLE");
    mapping (address => uint256) reward;
    mapping (address => uint256) balance;
    mapping (address => StackerDetail) stacker;

    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private _whitList;
    
    function initialize(address _rewardToken) external initializer {
        contractOwner = msg.sender;
        rewardToken = IERC20(_rewardToken);
         _setupRole(DEFAULT_ROLE, msg.sender);
    }

    function addWhiteList(address value) external returns (bool) {
        require(hasRole(DEFAULT_ROLE, msg.sender), "Caller is not a owner");
        return _whitList.add(value);
    }

    function removeWhiteList(address value) external returns (bool) {
        require(hasRole(DEFAULT_ROLE, msg.sender), "Caller is not a owner");
        return _whitList.remove(value);
    }
    
    function startStack(uint256 _hours) external {
        require(hasRole(DEFAULT_ROLE, msg.sender), "Caller is not a owner");
        start = block.timestamp;
        end += start + _hours*60*60;
    }

    function stack(uint256 _amount, address _ERC20) external {
        require(block.timestamp >= start, "stack time has not start");
        require(block.timestamp <= end, "stack time has ended");
        require(_whitList.contains(_ERC20), "token is not white list token");
        balance[msg.sender] += _amount;
        stacker[msg.sender] = StackerDetail(_amount, block.number, _ERC20);
        IERC20(_ERC20).transferFrom(msg.sender, address(this), _amount);
    }

    function withdraw() external {
        require(balance[msg.sender] != 0, "not haved stacked");
        address _ERC20 = stacker[msg.sender].ERC20Contract;
        IERC20(_ERC20).transfer(msg.sender, balance[msg.sender]);

        uint256 rewardAmount = (block.number - stacker[msg.sender].blockNumber)/5;
        reward[msg.sender] = rewardAmount;
    }

}
