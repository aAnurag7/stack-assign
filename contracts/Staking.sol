// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";

contract Staking is Initializable, Ownable2StepUpgradeable, AccessControlUpgradeable {
    uint256 public start;
    uint256 public end;
    struct StackerDetail{
        uint256 amount;
        uint256 blockNumber;
        address ERC20Contract;
    }
    address contractOwner;
    IERC20Upgradeable public rewardToken;
    bytes32 public constant DEFAULT_ROLE = keccak256("DEFAULT_ROLE");
    mapping (address => uint256) reward;
    mapping (address => uint256) balance;
    mapping (address => StackerDetail) stacker;

    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;
    EnumerableSetUpgradeable.AddressSet private _whitList;
    
    /// @notice initialize state once
    /// @dev it initializes contract owner, rewardToken and setupRole
    function initialize(address _rewardToken) external initializer {
        contractOwner = msg.sender;
        rewardToken = IERC20Upgradeable(_rewardToken);
         _setupRole(DEFAULT_ROLE, msg.sender);
    }
    
    /// @notice add new ERC20 contract to whiteList
    /// @dev add ERC20 contract address in whiteList set
    function addWhiteList(address value) external returns (bool) {
        require(hasRole(DEFAULT_ROLE, msg.sender), "Caller is not a owner");
        return _whitList.add(value);
    }

    /// @notice remove ERC20 contract from whiteList
    /// @dev remove ERC20 contract address in whiteList set
    function removeWhiteList(address value) external returns (bool) {
        require(hasRole(DEFAULT_ROLE, msg.sender), "Caller is not a owner");
        return _whitList.remove(value);
    }

    /// @notice owner start staking so that user can stake
    /// @dev owner change state of start and end for user to stake
    function startStack(uint256 _hours) external {
        require(hasRole(DEFAULT_ROLE, msg.sender), "Caller is not a owner");
        start = block.timestamp;
        end += start + _hours*60*60;
    }

    /// @notice user can stake its coins by this stake function
    /// @dev this add user stake amount and contract token address and block number at staking time in stacker
    function stake(uint256 _amount, address _ERC20) external {
        require(block.timestamp >= start, "stack time has not start");
        require(block.timestamp <= end, "stack time has ended");
        require(_whitList.contains(_ERC20), "token is not white list token");
        balance[msg.sender] += _amount;
        stacker[msg.sender] = StackerDetail(_amount, block.number, _ERC20);
        IERC20Upgradeable(_ERC20).transferFrom(msg.sender, address(this), _amount);
    }

    function withdraw() external {
        require(balance[msg.sender] != 0, "not haved stacked");
        address _ERC20 = stacker[msg.sender].ERC20Contract;
        IERC20Upgradeable(_ERC20).transfer(msg.sender, balance[msg.sender]);
        uint256 rewardAmount = (block.number - stacker[msg.sender].blockNumber)/5;
        reward[msg.sender] = rewardAmount;
    }

}
