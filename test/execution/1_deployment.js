const { expect } = require("chai");
const { ethers } = require("hardhat");
const { admin } = require("../../scripts/config");

let Execution;

describe("Execution: Deployment", function () {
  before(async () => {
    [owner] = await ethers.getSigners();

    Execution = await ethers.getContractFactory("Execution");
  });

  describe("execution should deploy successfully", function () {
    it("with valid parameters", async function () {
      const execution = await upgrades.deployProxy(Execution, [
        admin
      ]);
      await execution.waitForDeployment();

      const adminRole = await execution.DEFAULT_ADMIN_ROLE();
      const adminHasAdminRole = await execution.hasRole(adminRole, admin);
      expect(adminHasAdminRole).to.be.true;
    });
  });
});
