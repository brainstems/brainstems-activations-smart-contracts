const { expect } = require("chai");
const { ethers } = require("hardhat");
const { verifyEvents } = require("../utils");
const { BRAINSTEMS_TOKEN_NAME, BRAINSTEMS_TOKEN_SYMBOL, BRAINSTEMS_TOKEN_DECIMALS } = require("../consts");

let owner,
  user1,
  membership,
  brainstemUnit,
  brainstemUnit2,
  invalidBrainstemName,
  invalidBrainstemId,
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

    brainstemUnit = {
      id: 1n,
      name: "Food service",
    }

    brainstemUnit2 = {
      id: 2n,
      name: "Automotive",
    }

    invalidBrainstemName = {
      id: 2n,
      name: "Food service"
    }

    invalidBrainstemId = {
      id: 1n,
      name: "Invalid"
    }

    memberUnit = {
      id: 1n,
      name: "Member",
    }

    pathwayUnit = {
      id: 1n,
      name: "Pathway",
    }
  });

  describe("should be able to", function () {
    it("create an brainstem with valid parameters", async function () {
      const tx = await membership.createBrainstem(
        brainstemUnit
      );
      await tx.wait();

      const expectedBrainstem = [
        brainstemUnit.id,
        brainstemUnit.name
      ];

      await verifyEvents(tx, membership, "BrainstemCreated", [
        { id: brainstemUnit.id, brainstem: expectedBrainstem },
      ]);

      const contractBrainstem = await membership.getBrainstem(brainstemUnit.id);
      expect(contractBrainstem.name).to.equal(brainstemUnit.name);
      expect(contractBrainstem.id).to.equal(brainstemUnit.id);
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

      const contractBrainstem = await membership.getNeuron(memberUnit.id);
      expect(contractBrainstem.name).to.equal(memberUnit.name);
      expect(contractBrainstem.id).to.equal(memberUnit.id);
    });

    it("create a pathway with valid parameters", async function() {
      const brainstemId = 1n;
      const tx = await membership.createPathway(
        pathwayUnit,
        brainstemId
      );
      await tx.wait();

      const expectedPathway = [
        pathwayUnit.id,
        pathwayUnit.name
      ];

      await verifyEvents(tx, membership, "PathwayCreated", [
        { id: pathwayUnit.id, pathway: expectedPathway, brainstemId },
      ]);

      const contractPathway = await membership.getPathway(brainstemId, pathwayUnit.id);
      expect(contractPathway.name).to.equal(pathwayUnit.name);
      expect(contractPathway.id).to.equal(pathwayUnit.id);
    });
  });

  describe("should fail to", function () {
    it("create an brainstem with invalid parameters", async function () {
      await expect(
        membership.createBrainstem(
          { id: 0n, name: "Food service" }
        )
      ).to.be.revertedWith("brainstem id cannot be 0");

      await expect(
        membership.createBrainstem(
          invalidBrainstemName
        )
      ).to.be.revertedWith("brainstem name already registered");

      await expect(
        membership.createBrainstem(
          invalidBrainstemId
        )
      ).to.be.revertedWith("brainstem id already registered");

      await expect(
        membership
          .connect(user1)
          .createBrainstem(brainstemUnit2)
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

    it("create a pathway with invalid parameters", async function() {
      const brainstemId = 1n;

      await expect(
        membership.createPathway(
          { id: 0n, name: "Pathway" },
          brainstemId
        )
      ).to.be.revertedWith("pathway id cannot be 0");

      await expect(
        membership.createPathway(
          pathwayUnit,
          123n
        )
      ).to.be.revertedWith("brainstem id not found");

      await expect(
        membership.createPathway(
          pathwayUnit,
          brainstemId
        )
      ).to.be.revertedWith("pathway id already registered in brainstem");

      await expect(
        membership
          .connect(user1)
          .createPathway(pathwayUnit, brainstemId)
      ).to.be.revertedWithCustomError(
        membership,
        "AccessControlUnauthorizedAccount"
      );
    });
  });
});
