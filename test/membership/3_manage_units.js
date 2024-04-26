const { expect } = require("chai");
const { ethers } = require("hardhat");
const { verifyEvents } = require("../utils");

let owner,
  membership,
  ecosystemUnit,
  companyUnit,
  companyUnitTwo,
  brainstemUnit,
  errorTestsEcosystemUnit,
  errorTestsCompanyUnit,
  errorTestsCompanyUnitTwo,
  errorTestsBrainstemUnit,
  user1,
  user2;

describe("Membership: Manage Units", function () {
  before(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    const Membership = await ethers.getContractFactory("Membership");
    membership = await upgrades.deployProxy(Membership, [
      owner.address
    ]);
    await membership.waitForDeployment();

    ecosystemUnit = {
      id: 1n,
      name: "Ecosystem",
    }

    companyUnit = {
      id: 1n,
      name: "Coca Cola",
    }

    companyUnitTwo = {
      id: 20n,
      name: "Pepsi",
    }

    brainstemUnit = {
      id: 1n,
      name: "Brainstem",
    }

    const ecosystemTx = await membership.createEcosystem(
      ecosystemUnit
    );
    await ecosystemTx.wait();

    const memberTx = await membership.createCompany(
      companyUnit
    );
    await memberTx.wait();

    const memberTxTwo = await membership.createCompany(
      companyUnitTwo
    );
    await memberTxTwo.wait();

    const brainstemTx = await membership.createBrainstem(
      brainstemUnit,
      ecosystemUnit.id
    );
    await brainstemTx.wait();

    // Test data for error cases.
    errorTestsEcosystemUnit = {
      id: 2n,
      name: "Ecosystem Two",
    }

    errorTestsCompanyUnit = {
      id: 2n,
      name: "Coca Cola Two",
    }

    errorTestsCompanyUnitTwo = {
      id: 8n,
      name: "Pepsi Two",
    }

    errorTestsBrainstemUnit = {
      id: 2n,
      name: "Brainstem Two",
    }

    const errorEcosystemTx = await membership.createEcosystem(
      errorTestsEcosystemUnit
    );
    await errorEcosystemTx.wait();

    const errorMemberTx = await membership.createCompany(
      errorTestsCompanyUnit
    );
    await errorMemberTx.wait();

    const errorMemberTxTwo = await membership.createCompany(
      errorTestsCompanyUnitTwo
    );
    await errorMemberTxTwo.wait();

    const errorBrainstemTx = await membership.createBrainstem(
      errorTestsBrainstemUnit,
      errorTestsEcosystemUnit.id
    );
    await errorBrainstemTx.wait();

    await membership.addEcosystemCompany(
      errorTestsEcosystemUnit.id,
      errorTestsCompanyUnit.id
    );
    await membership.addEcosystemCompany(
      errorTestsEcosystemUnit.id,
      errorTestsCompanyUnitTwo.id
    );
    await membership.addUsers(
      errorTestsCompanyUnit.id,
      [user1.address]
    );
    await membership.addBrainstemCompany(
      errorTestsEcosystemUnit.id,
      errorTestsBrainstemUnit.id,
      errorTestsCompanyUnit.id
    );
  });

  describe("should be able to", function () {
    it("add a company to an ecosystem with valid parameters", async function () {
      const tx = await membership.addEcosystemCompany(
        ecosystemUnit.id,
        companyUnit.id
      );
      await tx.wait();

      await verifyEvents(tx, membership, "EcosystemCompanyAdded", [
        { ecosystemId: ecosystemUnit.id, memberId: companyUnit.id },
      ]);

      const contractCompanyAssociatedToEcosystem = await membership.companyInEcosystem(ecosystemUnit.id, companyUnit.id);
      expect(contractCompanyAssociatedToEcosystem).to.equal(true);

      const tx2 = await membership.addEcosystemCompany(
        ecosystemUnit.id,
        companyUnitTwo.id
      );
      await tx2.wait();

      await verifyEvents(tx2, membership, "EcosystemCompanyAdded", [
        { ecosystemId: ecosystemUnit.id, memberId: companyUnitTwo.id },
      ]);

      const contractCompanyAssociatedToEcosystem2 = await membership.companyInEcosystem(ecosystemUnit.id, companyUnitTwo.id);
      expect(contractCompanyAssociatedToEcosystem2).to.equal(true);
    });

    it("remove a company from an ecosystem with valid parameters", async function () {
      const tx = await membership.removeEcosystemCompany(
        ecosystemUnit.id,
        companyUnitTwo.id
      );
      await tx.wait();

      await verifyEvents(tx, membership, "EcosystemCompanyRemoved", [
        { ecosystemId: ecosystemUnit.id, memberId: companyUnitTwo.id },
      ]);

      const contractCompanyAssociatedToEcosystem = await membership.companyInEcosystem(ecosystemUnit.id, companyUnitTwo.id);
      expect(contractCompanyAssociatedToEcosystem).to.equal(false);
    });

    it("add a user to a company with valid parameters", async function () {
      const tx = await membership.addUsers(
        companyUnitTwo.id,
        [user1.address]
      );
      await tx.wait();

      await verifyEvents(tx, membership, "UserAdded", [
        { companyId: companyUnitTwo.id, user: user1.address },
      ]);

      const contractUserAssociatedToCompany = await membership.userInCompany(companyUnitTwo.id, user1.address);
      expect(contractUserAssociatedToCompany).to.equal(true);
    });

    it("remove a user from a company with valid parameters", async function () {
      const tx = await membership.removeUsers(
        companyUnitTwo.id,
        [user1.address]
      );
      await tx.wait();

      await verifyEvents(tx, membership, "UserRemoved", [
        { companyId: companyUnitTwo.id, user: user1.address },
      ]);

      const contractUserAssociatedToCompany = await membership.userInCompany(companyUnitTwo.id, user1.address);
      expect(contractUserAssociatedToCompany).to.equal(false);
    });

    it("add a company to a brainstem with valid parameters", async function () {
      const tx = await membership.addBrainstemCompany(
        ecosystemUnit.id,
        brainstemUnit.id,
        companyUnit.id
      );
      await tx.wait();

      await verifyEvents(tx, membership, "BrainstemCompanyAdded", [
        { ecosystemId: ecosystemUnit.id, brainstemId: brainstemUnit.id, memberId: companyUnit.id },
      ]);

      const contractCompanyAssociatedToBrainstem = await membership.companyInBrainstem(ecosystemUnit.id, brainstemUnit.id, companyUnit.id);
      expect(contractCompanyAssociatedToBrainstem).to.equal(true);
    });

    it("remove a company from a brainstem with valid parameters", async function () {
      const tx = await membership.removeBrainstemCompany(
        ecosystemUnit.id,
        brainstemUnit.id,
        companyUnit.id
      );
      await tx.wait();

      await verifyEvents(tx, membership, "BrainstemCompanyRemoved", [
        { ecosystemId: ecosystemUnit.id, brainstemId: brainstemUnit.id, memberId: companyUnit.id },
      ]);

      const contractCompanyAssociatedToBrainstem = await membership.companyInBrainstem(ecosystemUnit.id, brainstemUnit.id, companyUnit.id);
      expect(contractCompanyAssociatedToBrainstem).to.equal(false);
    });
  });

  describe("should fail to", function () {
    it("add a company to an ecosystem with invalid parameters", async function () {
      const tx = membership.addEcosystemCompany(
        errorTestsEcosystemUnit.id,
        errorTestsCompanyUnit.id
      );
      await expect(tx).to.be.revertedWith("company already part of ecosystem");

      const tx2 = membership.addEcosystemCompany(
        3n,
        errorTestsCompanyUnit.id
      );
      await expect(tx2).to.be.revertedWith("ecosystem id not found");

      const tx3 = membership.addEcosystemCompany(
        errorTestsEcosystemUnit.id,
        3n
      );
      await expect(tx3).to.be.revertedWith("company id not found");

      await expect(
        membership
          .connect(user1)
          .addEcosystemCompany(
            errorTestsEcosystemUnit.id,
            errorTestsCompanyUnit.id
          )
      ).to.be.revertedWithCustomError(
        membership,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("remove a company from an ecosystem with invalid parameters", async function () {
      const tx = membership.removeEcosystemCompany(
        ecosystemUnit.id,
        errorTestsCompanyUnit.id
      );
      await expect(tx).to.be.revertedWith("company not part of ecosystem");

      const tx2 = membership.removeEcosystemCompany(
        3n,
        errorTestsCompanyUnit.id
      );
      await expect(tx2).to.be.revertedWith("ecosystem id not found");

      const tx3 = membership.removeEcosystemCompany(
        errorTestsEcosystemUnit.id,
        3n
      );
      await expect(tx3).to.be.revertedWith("company id not found");

      await expect(
        membership
          .connect(user1)
          .removeEcosystemCompany(
            errorTestsEcosystemUnit.id,
            errorTestsCompanyUnit.id
          )
      ).to.be.revertedWithCustomError(
        membership,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("add a user to a company with invalid parameters", async function () {
      const tx = membership.addUsers(
        errorTestsCompanyUnit.id,
        [user1.address]
      );
      await expect(tx).to.be.revertedWith("user already part of company");

      const tx2 = membership.addUsers(
        3n,
        [user1.address]
      );
      await expect(tx2).to.be.revertedWith("company id not found");

      await expect(
        membership
          .connect(user1)
          .addUsers(
            errorTestsCompanyUnit.id,
            [user1.address]
          )
      ).to.be.revertedWithCustomError(
        membership,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("remove a user from a company with invalid parameters", async function () {
      const tx = membership.removeUsers(
        errorTestsCompanyUnit.id,
        [user2.address]
      );
      await expect(tx).to.be.revertedWith("user not part of company");

      const tx2 = membership.removeUsers(
        3n,
        [user1.address]
      );
      await expect(tx2).to.be.revertedWith("company id not found");

      await expect(
        membership
          .connect(user1)
          .removeUsers(
            errorTestsCompanyUnit.id,
            [user1.address]
          )
      ).to.be.revertedWithCustomError(
        membership,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("add a company to a brainstem with invalid parameters", async function () {
      const tx = membership.addBrainstemCompany(
        errorTestsEcosystemUnit.id,
        errorTestsBrainstemUnit.id,
        errorTestsCompanyUnit.id
      );
      await expect(tx).to.be.revertedWith("company already part of brainstem");

      const tx2 = membership.addBrainstemCompany(
        3n,
        errorTestsBrainstemUnit.id,
        errorTestsCompanyUnit.id
      );
      await expect(tx2).to.be.revertedWith("ecosystem id not found");

      const tx3 = membership.addBrainstemCompany(
        errorTestsEcosystemUnit.id,
        3n,
        errorTestsCompanyUnit.id
      );
      await expect(tx3).to.be.revertedWith("brainstem id not found");

      const tx4 = membership.addBrainstemCompany(
        errorTestsEcosystemUnit.id,
        errorTestsBrainstemUnit.id,
        3n
      );
      await expect(tx4).to.be.revertedWith("company id not found");

      await expect(
        membership
          .connect(user1)
          .addBrainstemCompany(
            errorTestsEcosystemUnit.id,
            errorTestsBrainstemUnit.id,
            errorTestsCompanyUnit.id
          )
      ).to.be.revertedWithCustomError(
        membership,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("remove a company from a brainstem with invalid parameters", async function () {
      const tx = membership.removeBrainstemCompany(
        errorTestsEcosystemUnit.id,
        errorTestsBrainstemUnit.id,
        errorTestsCompanyUnitTwo.id
      );
      await expect(tx).to.be.revertedWith("company not part of brainstem");

      const tx2 = membership.removeBrainstemCompany(
        3n,
        errorTestsBrainstemUnit.id,
        errorTestsCompanyUnit.id
      );
      await expect(tx2).to.be.revertedWith("ecosystem id not found");

      const tx3 = membership.removeBrainstemCompany(
        errorTestsEcosystemUnit.id,
        3n,
        errorTestsCompanyUnit.id
      );
      await expect(tx3).to.be.revertedWith("brainstem id not found");

      const tx4 = membership.removeBrainstemCompany(
        errorTestsEcosystemUnit.id,
        errorTestsBrainstemUnit.id,
        3n
      );
      await expect(tx4).to.be.revertedWith("company id not found");

      await expect(
        membership
          .connect(user1)
          .removeBrainstemCompany(
            errorTestsEcosystemUnit.id,
            errorTestsBrainstemUnit.id,
            errorTestsCompanyUnit.id
          )
      ).to.be.revertedWithCustomError(
        membership,
        "AccessControlUnauthorizedAccount"
      );
    });
  });
});
