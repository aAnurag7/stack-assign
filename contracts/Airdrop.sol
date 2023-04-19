// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface Stake {
    function check(address owner) external returns(bool);
    function getRewardBalance(address owner) external returns(uint256);
}

interface IERC20 {
    function mint(uint256 amount) external;
    function transfer(address to,uint256 amount) external returns(bool);
}

contract Airdrop is Initializable {
    
    address AirdropOwner;
    Stake stakeContract;
    IERC20 RewardToken;

    /// @dev To check if msg.sender is owner or not
    modifier onlyOwner1 {
        require(msg.sender == AirdropOwner, "not owner");
        _;
    }

    /// @dev initialize AirdropOwner, stakContract and RewardToken
    /// @param _stake gives address of staking contract
    /// @param _RewardToken gives address of ERC20 contract
    function init(address _stake, address _RewardToken) external initializer {
        AirdropOwner = msg.sender;
        stakeContract = Stake(_stake);
        RewardToken = IERC20(_RewardToken);
    }

    /// @dev owner can mint reward tokens in its address
    function mintToken() external onlyOwner1 {
        RewardToken.mint(1000);
    }

    /// @notice user can claim its reward 
    /// @dev Airdrop checks if msg.sender is valid to claim reward and give reward to msg.sender
    function distributeReward() external {
        require(stakeContract.check(msg.sender), "user not authorized to claim reward");
        uint256 reward = stakeContract.getRewardBalance(msg.sender);
        RewardToken.transfer(msg.sender, reward);
    }
    
}