const { expect } = require("chai");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");
const { json } = require("express/lib/response");
require("hardhat");

async function deployFixture() {
  const [owner, addr1, addr2] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("Coins");
  const token = await Token.deploy();

  const Stake = await ethers.getContractFactory("Staking");
  const stake = await Stake.deploy();
  await stake.initialize();

  return {owner ,addr1, addr2, stake, token};
}

describe("Staking contract function", async function () {

  it("it should initialze contract only once", async function () {
    let {stake} = await loadFixture(deployFixture);
    await expect(stake.initialize()).to.be.revertedWith("Initializable: contract is already initialized");
  });

  it("it should add contract address in whitList", async function () {
    let {stake, token} = await loadFixture(deployFixture);
    await stake.addWhiteList(token.address);
    expect(await stake.isWhitList(token.address)).to.equal(true);
  });

  it("it should remove contract address in whitList", async function () {
    let {stake, token} = await loadFixture(deployFixture);
    await stake.addWhiteList(token.address);
    await stake.removeWhiteList(token.address);
    expect(await stake.isWhitList(token.address)).to.equal(false);
  });

  it("it should start stake time for user to stake", async function () {
    let {stake} = await loadFixture(deployFixture);
    expect(await stake.start()).to.equal(0);
    await stake.startStack(2);
    expect(await stake.start()).to.not.equal(0);
  });

  it("it should stake amount to staking contract", async function () {
    let {owner, stake, token} = await loadFixture(deployFixture);
    await stake.startStack(2);
    await stake.addWhiteList(token.address);
    await token.mint(1000);
    await token.approve(stake.address, 100);
    await stake.stake(100, token.address);
    expect(await token.balanceOf(stake.address)).to.equal(100);
  });

  it("it should withdraw staked user token", async function () {
    let {owner, stake, token} = await loadFixture(deployFixture);
    await stake.startStack(2);
    await stake.addWhiteList(token.address);
    await token.mint(1000);
    await token.approve(stake.address, 100);
    await stake.stake(100, token.address);
    expect(await stake.balance(owner.address)).to.equal(100);
    await stake.withdrawStakToken();
    expect(await stake.balance(owner.address)).to.equal(0);
  });

  it("it should withdraw staked user token before end time", async function () {
    let {owner, stake, token} = await loadFixture(deployFixture);
    await stake.startStack(2);
    await stake.addWhiteList(token.address);
    await token.mint(1000);
    await token.approve(stake.address, 100);
    await stake.stake(100, token.address);
    expect(await stake.balance(owner.address)).to.equal(100);
    await stake.withdrawStakToken();
    expect(await stake.balance(owner.address)).to.equal(0);
  });

  it("it should withdraw staked user token after end time", async function () {
    let {owner, stake, token} = await loadFixture(deployFixture);
    await stake.startStack(2);
    await stake.addWhiteList(token.address);
    await token.mint(1000);
    await token.approve(stake.address, 100);
    await stake.stake(100, token.address);
    expect(await stake.balance(owner.address)).to.equal(100);
    const et = parseInt(await stake.end());
    await time.increaseTo(et-1);
    await stake.updateTimestamp();
    await stake.withdrawStakToken();
    expect(await stake.balance(owner.address)).to.equal(0);
  });

  it("it should return reward amount of user", async function () {
    let {owner, stake, token} = await loadFixture(deployFixture);
    expect(await stake.getRewardBalance(owner.address)).to.equal(0);
  });

  it("it should check user is valid to claim reward", async function () {
    let {owner, stake, token} = await loadFixture(deployFixture);
    await stake.startStack(5);
    await stake.addWhiteList(token.address);
    await token.mint(1000);
    await token.approve(stake.address, 100);
    await stake.stake(100, token.address);
    expect(await stake.balance(owner.address)).to.equal(100);
    await stake.withdrawStakToken();
    const et = parseInt(await stake.end());
    await time.increaseTo(et+1);
    expect(await stake.check(owner.address)).to.equal(true);
  });

  it("it should update updatedBlocknumber", async function () {
    let {stake} = await loadFixture(deployFixture);
    await stake.startStack(1);
    const et = parseInt(await stake.end());
    await time.increaseTo(et-1);
    await stake.updateTimestamp();
  });

  it("it should revert if user try to stak before start", async function () {
    let {stake, token} = await loadFixture(deployFixture);
    await stake.addWhiteList(token.address);
    await token.mint(1000);
    await token.approve(stake.address, 100);
    await expect(stake.stake(100, token.address)).to.be.revertedWith("stake has not start");
  });

});
