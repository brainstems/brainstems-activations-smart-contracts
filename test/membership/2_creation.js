const { expect } = require("chai");
const { ethers } = require("hardhat");
const { verifyEvents } = require("../utils");
const { BRAINSTEMS_TOKEN_NAME, BRAINSTEMS_TOKEN_SYMBOL, BRAINSTEMS_TOKEN_DECIMALS } = require("../consts");

let owner,
  user1,
  membership,
  ecosystemUnit,
  ecosystemUnit2,
  invalidEcosystemName,
  invalidEcosystemId,
  memberUnit;

describe("Membership: Creation", function () {
  before(async () => {
    [owner, user1] = await ethers.getSigners();

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

    const Membership = await ethers.getContractFactory("Membership");
    membership = await upgrades.deployProxy(Membership, [
      owner.address,
      assetsContract.target
    ]);
    await membership.waitForDeployment();

    ecosystemUnit = {
      id: 1n,
      name: "Ecosystem",
    }

    ecosystemUnit2 = {
      id: 2n,
      name: "Ecosystem2",
    }

    invalidEcosystemName = {
      id: 2n,
      name: "Ecosystem"
    }

    invalidEcosystemId = {
      id: 1n,
      name: "Invalid"
    }

    memberUnit = {
      id: 1n,
      name: "Member",
    }

    brainstemUnit = {
      id: 1n,
      name: "Brainstem",
    }
  });

  describe("should be able to", function () {
    it("create an ecosystem with valid parameters", async function () {
      const tx = await membership.createEcosystem(
        ecosystemUnit
      );
      await tx.wait();

      const expectedEcosystem = [
        ecosystemUnit.id,
        ecosystemUnit.name
      ];

      await verifyEvents(tx, membership, "EcosystemCreated", [
        { id: ecosystemUnit.id, ecosystem: expectedEcosystem },
      ]);

      const contractEcosystem = await membership.getEcosystem(ecosystemUnit.id);
      expect(contractEcosystem.name).to.equal(ecosystemUnit.name);
      expect(contractEcosystem.id).to.equal(ecosystemUnit.id);
    });

    it("create a neuron with valid parameters", async function () {
      const tx = await membership.createNeuron(
        memberUnit
      );
      await tx.wait();

      const expectedNeuron = [
        memberUnit.id,
        memberUnit.name
      ];

      await verifyEvents(tx, membership, "NeuronCreated", [
        { id: memberUnit.id, neuron: expectedNeuron },
      ]);

      const contractEcosystem = await membership.getNeuron(memberUnit.id);
      expect(contractEcosystem.name).to.equal(memberUnit.name);
      expect(contractEcosystem.id).to.equal(memberUnit.id);
    });

    it("create a brainstem with valid parameters", async function() {
      const ecosystemId = 1n;
      const tx = await membership.createBrainstem(
        brainstemUnit,
        ecosystemId
      );
      await tx.wait();

      const expectedBrainstem = [
        brainstemUnit.id,
        brainstemUnit.name
      ];

      await verifyEvents(tx, membership, "BrainstemCreated", [
        { id: brainstemUnit.id, brainstem: expectedBrainstem, ecosystemId },
      ]);

      const contractBrainstem = await membership.getBrainstem(ecosystemId, brainstemUnit.id);
      expect(contractBrainstem.name).to.equal(brainstemUnit.name);
      expect(contractBrainstem.id).to.equal(brainstemUnit.id);
    });
  });

  describe("should fail to", function () {
    it("create an ecosystem with invalid parameters", async function () {
      await expect(
        membership.createEcosystem(
          { id: 0n, name: "Ecosystem" }
        )
      ).to.be.revertedWith("ecosystem id cannot be 0");

      await expect(
        membership.createEcosystem(
          invalidEcosystemName
        )
      ).to.be.revertedWith("ecosystem name already registered");

      await expect(
        membership.createEcosystem(
          invalidEcosystemId
        )
      ).to.be.revertedWith("ecosystem id already registered");

      await expect(
        membership
          .connect(user1)
          .createEcosystem(ecosystemUnit2)
      ).to.be.revertedWithCustomError(
        membership,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("create a neuron with invalid parameters", async function () {
      await expect(
        membership.createNeuron(
          { id: 0n, name: "Neuron" }
        )
      ).to.be.revertedWith("neuron id cannot be 0");
      
      await expect(
        membership.createNeuron(
          memberUnit
        )
      ).to.be.revertedWith("neuron id already registered");

      await expect(
        membership
          .connect(user1)
          .createNeuron(memberUnit)
      ).to.be.revertedWithCustomError(
        membership,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("create a brainstem with invalid parameters", async function() {
      const ecosystemId = 1n;

      await expect(
        membership.createBrainstem(
          { id: 0n, name: "Brainstem" },
          ecosystemId
        )
      ).to.be.revertedWith("brainstem id cannot be 0");

      await expect(
        membership.createBrainstem(
          brainstemUnit,
          123n
        )
      ).to.be.revertedWith("ecosystem id not found");

      await expect(
        membership.createBrainstem(
          brainstemUnit,
          ecosystemId
        )
      ).to.be.revertedWith("brainstem id already registered in ecosystem");

      await expect(
        membership
          .connect(user1)
          .createBrainstem(brainstemUnit, ecosystemId)
      ).to.be.revertedWithCustomError(
        membership,
        "AccessControlUnauthorizedAccount"
      );
    });
  });
});
