const { expect } = require("chai");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");
const { json } = require("express/lib/response");
require("hardhat");

async function deployFixture() {
  const [owner, addr1, addr2] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("ERC20");
  const token = await Token.deploy();

  const ERC20Factory = await ethers.getContractFactory("ERC20Factory");
  const Factory = await ERC20Factory.deploy(token.address);

  return {owner ,addr1, addr2, Factory, token};
}

describe("Staking contract function", async function () {

  it("it should initaialize FeeManager to true", async function () {
    let {owner, addr1, Factory, token} = await loadFixture(deployFixture);
    expect(await Factory.FeeManager()).to.equal(true);
  });
  
  it("it should switch mode of Factory contract", async function () {
    let {owner, addr1, Factory, token} = await loadFixture(deployFixture);
    await Factory.switchMode();
    expect(await Factory.ReferralManager()).to.equal(true);
  });

});