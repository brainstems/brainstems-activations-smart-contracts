const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BRAINSTEMS_TOKEN_NAME, BRAINSTEMS_TOKEN_SYMBOL, BRAINSTEMS_TOKEN_DECIMALS } = require("../consts");

let Execution,
  Assets,
  Membership,
  Access,
  brainstemsToken,
  assetsContract,
  membership,
  access,
  owner;

describe("Execution: Deployment", function () {
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
    access = await upgrades.deployProxy(Access, [
      owner.address,
      assetsContract.target,
      membership.target
    ]);

    Execution = await ethers.getContractFactory("Execution");
  });

  describe("execution should deploy successfully", function () {
    it("with valid parameters", async function () {
      const execution = await upgrades.deployProxy(Execution, [
        owner.address,
        access.target,
        membership.target
      ]);
      await execution.waitForDeployment();

      const adminRole = await execution.DEFAULT_ADMIN_ROLE();
      const adminHasAdminRole = await execution.hasRole(adminRole, owner.address);
      expect(adminHasAdminRole).to.be.true;
    });
  });
});
