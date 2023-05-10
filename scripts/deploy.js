const { ethers, upgrades } = require("hardhat");

async function main() {
  const A = await ethers.getContractFactory("A");
  const a = await upgrades.deployProxy(A);
  await a.deployed();
  console.log("A deployed to:", a.address);
}

main();