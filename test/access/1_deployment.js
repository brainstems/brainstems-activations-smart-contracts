const { expect } = require("chai");
const { ethers } = require("hardhat");
const { admin } = require("../../scripts/config");

let Access;

describe("Access: Deployment", function () {
  before(async () => {
    [owner] = await ethers.getSigners();

    Access = await ethers.getContractFactory("Access");
  });

  describe("access should deploy successfully", function () {
    it("with valid parameters", async function () {
      const access = await upgrades.deployProxy(Access, [
        admin
      ]);
      await access.waitForDeployment();

      const adminRole = await access.DEFAULT_ADMIN_ROLE();
      const adminHasAdminRole = await access.hasRole(adminRole, admin);
      expect(adminHasAdminRole).to.be.true;
    });
  });
});
