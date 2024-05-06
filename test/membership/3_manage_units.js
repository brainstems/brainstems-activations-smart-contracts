const { expect } = require("chai");
const { ethers } = require("hardhat");
const { verifyEvents } = require("../utils");
const { BRAINSTEMS_TOKEN_NAME, BRAINSTEMS_TOKEN_SYMBOL, BRAINSTEMS_TOKEN_DECIMALS } = require("../consts");

let owner,
  membership,
  brainstemUnit,
  neuronUnit,
  neuronUnitTwo,
  pathwayUnit,
  errorTestsBrainstemUnit,
  errorTestsNeuronUnit,
  errorTestsNeuronUnitTwo,
  errorTestsPathwayUnit,
  user1,
  user2;

describe("Membership: Manage Units", function () {
  before(async () => {
    [owner, user1, user2] = await ethers.getSigners();

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
      name: "Brainstem",
    }

    neuronUnit = {
      id: 1n,
      name: "Coca Cola",
    }

    neuronUnitTwo = {
      id: 20n,
      name: "Pepsi",
    }

    pathwayUnit = {
      id: 1n,
      name: "Pathway",
    }

    const brainstemTx = await membership.createBrainstem(
      brainstemUnit
    );
    await brainstemTx.wait();

    const memberTx = await membership.createNeuron(
      neuronUnit
    );
    await memberTx.wait();

    const memberTxTwo = await membership.createNeuron(
      neuronUnitTwo
    );
    await memberTxTwo.wait();

    const pathwayTx = await membership.createPathway(
      pathwayUnit,
      brainstemUnit.id
    );
    await pathwayTx.wait();

    // Test data for error cases.
    errorTestsBrainstemUnit = {
      id: 2n,
      name: "Brainstem Two",
    }

    errorTestsNeuronUnit = {
      id: 2n,
      name: "Coca Cola Two",
    }

    errorTestsNeuronUnitTwo = {
      id: 8n,
      name: "Pepsi Two",
    }

    errorTestsPathwayUnit = {
      id: 2n,
      name: "Pathway Two",
    }

    const errorBrainstemTx = await membership.createBrainstem(
      errorTestsBrainstemUnit
    );
    await errorBrainstemTx.wait();

    const errorMemberTx = await membership.createNeuron(
      errorTestsNeuronUnit
    );
    await errorMemberTx.wait();

    const errorMemberTxTwo = await membership.createNeuron(
      errorTestsNeuronUnitTwo
    );
    await errorMemberTxTwo.wait();

    const errorPathwayTx = await membership.createPathway(
      errorTestsPathwayUnit,
      errorTestsBrainstemUnit.id
    );
    await errorPathwayTx.wait();

    await membership.addBrainstemNeuron(
      errorTestsBrainstemUnit.id,
      errorTestsNeuronUnit.id
    );
    await membership.addBrainstemNeuron(
      errorTestsBrainstemUnit.id,
      errorTestsNeuronUnitTwo.id
    );
    await membership.addUsers(
      errorTestsNeuronUnit.id,
      [user1.address]
    );
    await membership.addPathwayNeuron(
      errorTestsBrainstemUnit.id,
      errorTestsPathwayUnit.id,
      errorTestsNeuronUnit.id
    );
  });

  describe("should be able to", function () {
    it("add a neuron to an brainstem with valid parameters", async function () {
      const tx = await membership.addBrainstemNeuron(
        brainstemUnit.id,
        neuronUnit.id
      );
      await tx.wait();

      await verifyEvents(tx, membership, "BrainstemNeuronAdded", [
        { brainstemId: brainstemUnit.id, memberId: neuronUnit.id },
      ]);

      const contractNeuronAssociatedToBrainstem = await membership.neuronInBrainstem(brainstemUnit.id, neuronUnit.id);
      expect(contractNeuronAssociatedToBrainstem).to.equal(true);

      const tx2 = await membership.addBrainstemNeuron(
        brainstemUnit.id,
        neuronUnitTwo.id
      );
      await tx2.wait();

      await verifyEvents(tx2, membership, "BrainstemNeuronAdded", [
        { brainstemId: brainstemUnit.id, memberId: neuronUnitTwo.id },
      ]);

      const contractNeuronAssociatedToBrainstem2 = await membership.neuronInBrainstem(brainstemUnit.id, neuronUnitTwo.id);
      expect(contractNeuronAssociatedToBrainstem2).to.equal(true);
    });

    it("remove a neuron from an brainstem with valid parameters", async function () {
      const tx = await membership.removeBrainstemNeuron(
        brainstemUnit.id,
        neuronUnitTwo.id
      );
      await tx.wait();

      await verifyEvents(tx, membership, "BrainstemNeuronRemoved", [
        { brainstemId: brainstemUnit.id, memberId: neuronUnitTwo.id },
      ]);

      const contractNeuronAssociatedToBrainstem = await membership.neuronInBrainstem(brainstemUnit.id, neuronUnitTwo.id);
      expect(contractNeuronAssociatedToBrainstem).to.equal(false);
    });

    it("add a user to a neuron with valid parameters", async function () {
      const tx = await membership.addUsers(
        neuronUnitTwo.id,
        [user1.address]
      );
      await tx.wait();

      await verifyEvents(tx, membership, "UserAdded", [
        { neuronId: neuronUnitTwo.id, user: user1.address },
      ]);

      const contractUserAssociatedToNeuron = await membership.userInNeuron(neuronUnitTwo.id, user1.address);
      expect(contractUserAssociatedToNeuron).to.equal(true);
    });

    it("remove a user from a neuron with valid parameters", async function () {
      const tx = await membership.removeUsers(
        neuronUnitTwo.id,
        [user1.address]
      );
      await tx.wait();

      await verifyEvents(tx, membership, "UserRemoved", [
        { neuronId: neuronUnitTwo.id, user: user1.address },
      ]);

      const contractUserAssociatedToNeuron = await membership.userInNeuron(neuronUnitTwo.id, user1.address);
      expect(contractUserAssociatedToNeuron).to.equal(false);
    });

    it("add a neuron to a pathway with valid parameters", async function () {
      const tx = await membership.addPathwayNeuron(
        brainstemUnit.id,
        pathwayUnit.id,
        neuronUnit.id
      );
      await tx.wait();

      await verifyEvents(tx, membership, "PathwayNeuronAdded", [
        { brainstemId: brainstemUnit.id, pathwayId: pathwayUnit.id, memberId: neuronUnit.id },
      ]);

      const contractNeuronAssociatedToPathway = await membership.neuronInPathway(brainstemUnit.id, pathwayUnit.id, neuronUnit.id);
      expect(contractNeuronAssociatedToPathway).to.equal(true);
    });

    it("remove a neuron from a pathway with valid parameters", async function () {
      const tx = await membership.removePathwayNeuron(
        brainstemUnit.id,
        pathwayUnit.id,
        neuronUnit.id
      );
      await tx.wait();

      await verifyEvents(tx, membership, "PathwayNeuronRemoved", [
        { brainstemId: brainstemUnit.id, pathwayId: pathwayUnit.id, memberId: neuronUnit.id },
      ]);

      const contractNeuronAssociatedToPathway = await membership.neuronInPathway(brainstemUnit.id, pathwayUnit.id, neuronUnit.id);
      expect(contractNeuronAssociatedToPathway).to.equal(false);
    });
  });

  describe("should fail to", function () {
    it("add a neuron to an brainstem with invalid parameters", async function () {
      const tx = membership.addBrainstemNeuron(
        errorTestsBrainstemUnit.id,
        errorTestsNeuronUnit.id
      );
      await expect(tx).to.be.revertedWith("neuron already part of brainstem");

      const tx2 = membership.addBrainstemNeuron(
        3n,
        errorTestsNeuronUnit.id
      );
      await expect(tx2).to.be.revertedWith("brainstem id not found");

      const tx3 = membership.addBrainstemNeuron(
        errorTestsBrainstemUnit.id,
        3n
      );
      await expect(tx3).to.be.revertedWith("neuron id not found");

      await expect(
        membership
          .connect(user1)
          .addBrainstemNeuron(
            errorTestsBrainstemUnit.id,
            errorTestsNeuronUnit.id
          )
      ).to.be.revertedWithCustomError(
        membership,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("remove a neuron from an brainstem with invalid parameters", async function () {
      const tx = membership.removeBrainstemNeuron(
        brainstemUnit.id,
        errorTestsNeuronUnit.id
      );
      await expect(tx).to.be.revertedWith("neuron not part of brainstem");

      const tx2 = membership.removeBrainstemNeuron(
        3n,
        errorTestsNeuronUnit.id
      );
      await expect(tx2).to.be.revertedWith("brainstem id not found");

      const tx3 = membership.removeBrainstemNeuron(
        errorTestsBrainstemUnit.id,
        3n
      );
      await expect(tx3).to.be.revertedWith("neuron id not found");

      await expect(
        membership
          .connect(user1)
          .removeBrainstemNeuron(
            errorTestsBrainstemUnit.id,
            errorTestsNeuronUnit.id
          )
      ).to.be.revertedWithCustomError(
        membership,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("add a user to a neuron with invalid parameters", async function () {
      const tx = membership.addUsers(
        errorTestsNeuronUnit.id,
        [user1.address]
      );
      await expect(tx).to.be.revertedWith("user already part of neuron");

      const tx2 = membership.addUsers(
        3n,
        [user1.address]
      );
      await expect(tx2).to.be.revertedWith("neuron id not found");

      await expect(
        membership
          .connect(user1)
          .addUsers(
            errorTestsNeuronUnit.id,
            [user1.address]
          )
      ).to.be.revertedWithCustomError(
        membership,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("remove a user from a neuron with invalid parameters", async function () {
      const tx = membership.removeUsers(
        errorTestsNeuronUnit.id,
        [user2.address]
      );
      await expect(tx).to.be.revertedWith("user not part of neuron");

      const tx2 = membership.removeUsers(
        3n,
        [user1.address]
      );
      await expect(tx2).to.be.revertedWith("neuron id not found");

      await expect(
        membership
          .connect(user1)
          .removeUsers(
            errorTestsNeuronUnit.id,
            [user1.address]
          )
      ).to.be.revertedWithCustomError(
        membership,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("add a neuron to a pathway with invalid parameters", async function () {
      const tx = membership.addPathwayNeuron(
        errorTestsBrainstemUnit.id,
        errorTestsPathwayUnit.id,
        errorTestsNeuronUnit.id
      );
      await expect(tx).to.be.revertedWith("neuron already part of pathway");

      const tx2 = membership.addPathwayNeuron(
        3n,
        errorTestsPathwayUnit.id,
        errorTestsNeuronUnit.id
      );
      await expect(tx2).to.be.revertedWith("brainstem id not found");

      const tx3 = membership.addPathwayNeuron(
        errorTestsBrainstemUnit.id,
        3n,
        errorTestsNeuronUnit.id
      );
      await expect(tx3).to.be.revertedWith("pathway id not found");

      const tx4 = membership.addPathwayNeuron(
        errorTestsBrainstemUnit.id,
        errorTestsPathwayUnit.id,
        3n
      );
      await expect(tx4).to.be.revertedWith("neuron id not found");

      await expect(
        membership
          .connect(user1)
          .addPathwayNeuron(
            errorTestsBrainstemUnit.id,
            errorTestsPathwayUnit.id,
            errorTestsNeuronUnit.id
          )
      ).to.be.revertedWithCustomError(
        membership,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("remove a neuron from a pathway with invalid parameters", async function () {
      const tx = membership.removePathwayNeuron(
        errorTestsBrainstemUnit.id,
        errorTestsPathwayUnit.id,
        errorTestsNeuronUnitTwo.id
      );
      await expect(tx).to.be.revertedWith("neuron not part of pathway");

      const tx2 = membership.removePathwayNeuron(
        3n,
        errorTestsPathwayUnit.id,
        errorTestsNeuronUnit.id
      );
      await expect(tx2).to.be.revertedWith("brainstem id not found");

      const tx3 = membership.removePathwayNeuron(
        errorTestsBrainstemUnit.id,
        3n,
        errorTestsNeuronUnit.id
      );
      await expect(tx3).to.be.revertedWith("pathway id not found");

      const tx4 = membership.removePathwayNeuron(
        errorTestsBrainstemUnit.id,
        errorTestsPathwayUnit.id,
        3n
      );
      await expect(tx4).to.be.revertedWith("neuron id not found");

      await expect(
        membership
          .connect(user1)
          .removePathwayNeuron(
            errorTestsBrainstemUnit.id,
            errorTestsPathwayUnit.id,
            errorTestsNeuronUnit.id
          )
      ).to.be.revertedWithCustomError(
        membership,
        "AccessControlUnauthorizedAccount"
      );
    });
  });
});
