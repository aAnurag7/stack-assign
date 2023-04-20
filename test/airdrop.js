const { expect } = require("chai");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");
const { json } = require("express/lib/response");
require("hardhat");

async function deployOneYearLockFixture() {
  const [owner, addr1, addr2] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("Coins");
  const token = await Token.deploy();

  const Stake = await ethers.getContractFactory("Staking");
  const stake = await Stake.deploy();
  await stake.initialize();

  const Airdrop = await ethers.getContractFactory("Airdrop");
  const airdrop = await Airdrop.deploy();
  await airdrop.init(stake.address, token.address);


  return {owner ,addr1, addr2, stake, token, airdrop};
}

describe("Airdrop contract function", async function () {

  it("it should initialze contract only once", async function () {
    let {airdrop, stake, token} = await loadFixture(deployOneYearLockFixture);
    await expect(airdrop.init(stake.address, token.address)).to.be.revertedWith("Initializable: contract is already initialized");
  });

  it("it should mint token to distribute token", async function () {
    let {airdrop, token} = await loadFixture(deployOneYearLockFixture);
    await airdrop.mintToken();
    expect(await token.balanceOf(airdrop.address)).to.equal(1000);
  });

  it("it should distribute reward to valid user", async function () {
    let {owner, addr1,airdrop, stake,token} = await loadFixture(deployOneYearLockFixture);
    await airdrop.mintToken();
    await stake.startStack(1);
    await stake.addWhiteList(token.address);
    await token.mint(1000);
    await token.approve(stake.address, 100);
    await stake.stake(100, token.address);
    const et = parseInt(await stake.end());
    await time.increaseTo(et);
    await stake.updateTimestamp();
    await stake.withdrawStakToken();
    await airdrop.distributeReward();
  });

});
