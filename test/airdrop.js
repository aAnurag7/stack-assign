const { expect } = require("chai");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");
const { json } = require("express/lib/response");
require("hardhat");
const {MerkleTree} = require("merkletreejs")
const keccak256 = require("keccak256")

async function deployOneYearLockFixture() {
  const [owner, addr1, addr2] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("Coins");
  const token = await Token.deploy();

  const Stake = await ethers.getContractFactory("Staking");
  const stake = await Stake.deploy();
  await stake.initialize();

  const Airdrop = await ethers.getContractFactory("Airdrop");
  const airdrop = await Airdrop.deploy();
  let addresses = [owner.address, "0xb7e390864a90b7b923c9f9310c6f98aafe43f707", "0xea674fdde714fd979de3edf0f56aa9716b898ec8"];
  const leafNodes = addresses.map((balance) => keccak256(balance));
  const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
  await airdrop.init(stake.address, token.address, merkleTree.getRoot());


  return {owner ,addr1, addr2, stake, token, airdrop, merkleTree};
}

describe("Airdrop contract function", async function () {

  it("it should initialze contract only once", async function () {
    let {airdrop, stake, token, merkleTree} = await loadFixture(deployOneYearLockFixture);
    await expect(airdrop.init(stake.address, token.address, merkleTree.getRoot())).to.be.revertedWith("Initializable: contract is already initialized");
  });

  it("it should mint token to distribute token", async function () {
    let { airdrop, token} = await loadFixture(deployOneYearLockFixture);
    await airdrop.mintToken();
    expect(await token.balanceOf(airdrop.address)).to.equal(1000);
  });

  it("it should not mint token if user is not owner ", async function () {
    let {addr1, airdrop, token} = await loadFixture(deployOneYearLockFixture);
    await expect(airdrop.connect(addr1).mintToken()).to.be.revertedWith("not owner");
  });

  it("it should distribute reward to valid user", async function () {
    let {owner, airdrop, stake, token, merkleTree} = await loadFixture(deployOneYearLockFixture);
    await airdrop.mintToken();
    await stake.startStack(1);
    await stake.addWhiteList(token.address);
    await token.mint(1000);
    await token.approve(stake.address, 100);
    await stake.stake(100, token.address);
    const et = parseInt(await stake.end());
    await time.increaseTo(et-1);
    await stake.updateTimestamp();
    await stake.withdrawStakToken();
    let proof = merkleTree.getHexProof(keccak256(owner.address))
    await airdrop.verify(proof);
    await airdrop.distributeReward();
  });

  it("it should verify if user is valid", async function () {
    let {owner, airdrop, merkleTree} = await loadFixture(deployOneYearLockFixture)
    let proof = merkleTree.getHexProof(keccak256(owner.address))
    await airdrop.verify(proof);
  }); 

  it("it should revert user if proof and user is not valid", async function () {
    let {owner, addr1, airdrop, merkleTree} = await loadFixture(deployOneYearLockFixture)
    let proof = merkleTree.getHexProof(keccak256(addr1.address))
    await expect(airdrop.verify(proof)).to.be.revertedWith('Invalid proof');
  }); 

  it("it should revert if user is not valid to claim", async function () {
    let {owner, airdrop, merkleTree} = await loadFixture(deployOneYearLockFixture)
    let proof = merkleTree.getHexProof(keccak256(owner.address))
    await expect(airdrop.distributeReward()).to.be.revertedWith('user is not valid');
  }); 

  it("it should revert if user is try claim its reward before stake end", async function () {
    let {owner, airdrop, merkleTree} = await loadFixture(deployOneYearLockFixture)
    let proof = merkleTree.getHexProof(keccak256(owner.address))
    await airdrop.verify(proof);
    await expect(airdrop.distributeReward()).to.be.revertedWith('stake period has not ended');
  }); 

  it("it should revert if not white listed token owner try to claim", async function () {
    let {owner, airdrop, stake,  merkleTree} = await loadFixture(deployOneYearLockFixture)
    let proof = merkleTree.getHexProof(keccak256(owner.address))
    await airdrop.verify(proof);
    await stake.startStack(1);
    const et = parseInt(await stake.end());
    await time.increaseTo(et);
    await expect(airdrop.distributeReward()).to.be.revertedWith('token is not white list token');
  });

});
