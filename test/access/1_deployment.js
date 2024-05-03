const { expect } = require("chai");
const { ethers } = require("hardhat");
const { admin } = require("../../scripts/config");
const {
  BRAINSTEMS_TOKEN_NAME,
  BRAINSTEMS_TOKEN_SYMBOL,
  BRAINSTEMS_TOKEN_DECIMALS,
} = require("../consts");

let Assets,
  Membership,
  brainstemsToken,
  assetsContract,
  membership,
  owner;

describe("Access: Deployment", function () {
  before(async () => {
    [owner] = await ethers.getSigners();

    const TestErc20 = await ethers.getContractFactory("TestERC20");
    brainstemsToken = await TestErc20.deploy(
      BRAINSTEMS_TOKEN_NAME,
      BRAINSTEMS_TOKEN_SYMBOL,
      BRAINSTEMS_TOKEN_DECIMALS
    );
    await brainstemsToken.waitForDeployment();

    Assets = await ethers.getContractFactory("Assets");
    assetsContract = await upgrades.deployProxy(Assets, [
      owner.address,
      brainstemsToken.target,
    ]);

    Membership = await ethers.getContractFactory("Membership");
    membership = await upgrades.deployProxy(Membership, [
      owner.address,
      assetsContract.target
    ]);

    Access = await ethers.getContractFactory("Access");
    
  });

  describe("access should deploy successfully", function () {
    it("with valid parameters", async function () {
      const access = await upgrades.deployProxy(Access, [
        owner.address,
        assetsContract.target,
        membership.target
      ]);
      await access.waitForDeployment();

      const adminRole = await access.DEFAULT_ADMIN_ROLE();
      const adminHasAdminRole = await access.hasRole(adminRole, owner.address);
      expect(adminHasAdminRole).to.be.true;
    });
  });
});
