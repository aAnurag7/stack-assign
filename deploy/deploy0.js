module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
  
    const Coins = await deploy("Coins", {
      from: deployer,
      args: [],
      log: true,
    });
  
    const Staking = await deploy("Staking", {
      from: deployer,
      proxy: {
        owner: deployer,
        proxyContract: "OpenZeppelinTransparentProxy",
        execute: {
          methodName: "initialize",
          args: [],
        },
        upgradeIndex: 0,
      },
    });
  
    const Airdrop = await deploy("Airdrop", {
        from: deployer,
        proxy: {
          owner: deployer,
          proxyContract: "OpenZeppelinTransparentProxy",
          upgradeIndex: 0,
        },
    });
  };
  
  module.exports.tags = [
    "RewardToken",
    "Staking",
    "Airdrop",
  ];