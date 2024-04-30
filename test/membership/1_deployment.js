const { expect } = require("chai");
const { ethers } = require("hardhat");
const { admin } = require("../../scripts/config");
const { BRAINSTEMS_TOKEN_DECIMALS, BRAINSTEMS_TOKEN_SYMBOL, BRAINSTEMS_TOKEN_NAME } = require("../consts");

let Membership;

describe("Membership: Deployment", function () {
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
  });

  describe("membership should deploy successfully", function () {
    it("with valid parameters", async function () {
      const membership = await upgrades.deployProxy(Membership, [
        admin,
        assetsContract.target
      ]);
      await membership.waitForDeployment();

      const adminRole = await membership.DEFAULT_ADMIN_ROLE();
      const adminHasAdminRole = await membership.hasRole(adminRole, admin);
      expect(adminHasAdminRole).to.be.true;
    });
  });
});
