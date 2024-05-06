const { expect } = require("chai");
const { ethers } = require("hardhat");
const { verifyEvents } = require("../utils");
const { BRAINSTEMS_TOKEN_NAME, BRAINSTEMS_TOKEN_SYMBOL, BRAINSTEMS_TOKEN_DECIMALS } = require("../consts");

let owner,
  membership,
  ecosystemUnit,
  neuronUnit,
  neuronUnitTwo,
  brainstemUnit,
  errorTestsEcosystemUnit,
  errorTestsNeuronUnit,
  errorTestsNeuronUnitTwo,
  errorTestsBrainstemUnit,
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

    ecosystemUnit = {
      id: 1n,
      name: "Ecosystem",
    }

    neuronUnit = {
      id: 1n,
      name: "Coca Cola",
    }

    neuronUnitTwo = {
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

    const memberTx = await membership.createNeuron(
      neuronUnit
    );
    await memberTx.wait();

    const memberTxTwo = await membership.createNeuron(
      neuronUnitTwo
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

    errorTestsNeuronUnit = {
      id: 2n,
      name: "Coca Cola Two",
    }

    errorTestsNeuronUnitTwo = {
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

    const errorMemberTx = await membership.createNeuron(
      errorTestsNeuronUnit
    );
    await errorMemberTx.wait();

    const errorMemberTxTwo = await membership.createNeuron(
      errorTestsNeuronUnitTwo
    );
    await errorMemberTxTwo.wait();

    const errorBrainstemTx = await membership.createBrainstem(
      errorTestsBrainstemUnit,
      errorTestsEcosystemUnit.id
    );
    await errorBrainstemTx.wait();

    await membership.addEcosystemNeuron(
      errorTestsEcosystemUnit.id,
      errorTestsNeuronUnit.id
    );
    await membership.addEcosystemNeuron(
      errorTestsEcosystemUnit.id,
      errorTestsNeuronUnitTwo.id
    );
    await membership.addUsers(
      errorTestsNeuronUnit.id,
      [user1.address]
    );
    await membership.addBrainstemNeuron(
      errorTestsEcosystemUnit.id,
      errorTestsBrainstemUnit.id,
      errorTestsNeuronUnit.id
    );
  });

  describe("should be able to", function () {
    it("add a neuron to an ecosystem with valid parameters", async function () {
      const tx = await membership.addEcosystemNeuron(
        ecosystemUnit.id,
        neuronUnit.id
      );
      await tx.wait();

      await verifyEvents(tx, membership, "EcosystemNeuronAdded", [
        { ecosystemId: ecosystemUnit.id, memberId: neuronUnit.id },
      ]);

      const contractNeuronAssociatedToEcosystem = await membership.neuronInEcosystem(ecosystemUnit.id, neuronUnit.id);
      expect(contractNeuronAssociatedToEcosystem).to.equal(true);

      const tx2 = await membership.addEcosystemNeuron(
        ecosystemUnit.id,
        neuronUnitTwo.id
      );
      await tx2.wait();

      await verifyEvents(tx2, membership, "EcosystemNeuronAdded", [
        { ecosystemId: ecosystemUnit.id, memberId: neuronUnitTwo.id },
      ]);

      const contractNeuronAssociatedToEcosystem2 = await membership.neuronInEcosystem(ecosystemUnit.id, neuronUnitTwo.id);
      expect(contractNeuronAssociatedToEcosystem2).to.equal(true);
    });

    it("remove a neuron from an ecosystem with valid parameters", async function () {
      const tx = await membership.removeEcosystemNeuron(
        ecosystemUnit.id,
        neuronUnitTwo.id
      );
      await tx.wait();

      await verifyEvents(tx, membership, "EcosystemNeuronRemoved", [
        { ecosystemId: ecosystemUnit.id, memberId: neuronUnitTwo.id },
      ]);

      const contractNeuronAssociatedToEcosystem = await membership.neuronInEcosystem(ecosystemUnit.id, neuronUnitTwo.id);
      expect(contractNeuronAssociatedToEcosystem).to.equal(false);
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

    it("add a neuron to a brainstem with valid parameters", async function () {
      const tx = await membership.addBrainstemNeuron(
        ecosystemUnit.id,
        brainstemUnit.id,
        neuronUnit.id
      );
      await tx.wait();

      await verifyEvents(tx, membership, "BrainstemNeuronAdded", [
        { ecosystemId: ecosystemUnit.id, brainstemId: brainstemUnit.id, memberId: neuronUnit.id },
      ]);

      const contractNeuronAssociatedToBrainstem = await membership.neuronInBrainstem(ecosystemUnit.id, brainstemUnit.id, neuronUnit.id);
      expect(contractNeuronAssociatedToBrainstem).to.equal(true);
    });

    it("remove a neuron from a brainstem with valid parameters", async function () {
      const tx = await membership.removeBrainstemNeuron(
        ecosystemUnit.id,
        brainstemUnit.id,
        neuronUnit.id
      );
      await tx.wait();

      await verifyEvents(tx, membership, "BrainstemNeuronRemoved", [
        { ecosystemId: ecosystemUnit.id, brainstemId: brainstemUnit.id, memberId: neuronUnit.id },
      ]);

      const contractNeuronAssociatedToBrainstem = await membership.neuronInBrainstem(ecosystemUnit.id, brainstemUnit.id, neuronUnit.id);
      expect(contractNeuronAssociatedToBrainstem).to.equal(false);
    });
  });

  describe("should fail to", function () {
    it("add a neuron to an ecosystem with invalid parameters", async function () {
      const tx = membership.addEcosystemNeuron(
        errorTestsEcosystemUnit.id,
        errorTestsNeuronUnit.id
      );
      await expect(tx).to.be.revertedWith("neuron already part of ecosystem");

      const tx2 = membership.addEcosystemNeuron(
        3n,
        errorTestsNeuronUnit.id
      );
      await expect(tx2).to.be.revertedWith("ecosystem id not found");

      const tx3 = membership.addEcosystemNeuron(
        errorTestsEcosystemUnit.id,
        3n
      );
      await expect(tx3).to.be.revertedWith("neuron id not found");

      await expect(
        membership
          .connect(user1)
          .addEcosystemNeuron(
            errorTestsEcosystemUnit.id,
            errorTestsNeuronUnit.id
          )
      ).to.be.revertedWithCustomError(
        membership,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("remove a neuron from an ecosystem with invalid parameters", async function () {
      const tx = membership.removeEcosystemNeuron(
        ecosystemUnit.id,
        errorTestsNeuronUnit.id
      );
      await expect(tx).to.be.revertedWith("neuron not part of ecosystem");

      const tx2 = membership.removeEcosystemNeuron(
        3n,
        errorTestsNeuronUnit.id
      );
      await expect(tx2).to.be.revertedWith("ecosystem id not found");

      const tx3 = membership.removeEcosystemNeuron(
        errorTestsEcosystemUnit.id,
        3n
      );
      await expect(tx3).to.be.revertedWith("neuron id not found");

      await expect(
        membership
          .connect(user1)
          .removeEcosystemNeuron(
            errorTestsEcosystemUnit.id,
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

    it("add a neuron to a brainstem with invalid parameters", async function () {
      const tx = membership.addBrainstemNeuron(
        errorTestsEcosystemUnit.id,
        errorTestsBrainstemUnit.id,
        errorTestsNeuronUnit.id
      );
      await expect(tx).to.be.revertedWith("neuron already part of brainstem");

      const tx2 = membership.addBrainstemNeuron(
        3n,
        errorTestsBrainstemUnit.id,
        errorTestsNeuronUnit.id
      );
      await expect(tx2).to.be.revertedWith("ecosystem id not found");

      const tx3 = membership.addBrainstemNeuron(
        errorTestsEcosystemUnit.id,
        3n,
        errorTestsNeuronUnit.id
      );
      await expect(tx3).to.be.revertedWith("brainstem id not found");

      const tx4 = membership.addBrainstemNeuron(
        errorTestsEcosystemUnit.id,
        errorTestsBrainstemUnit.id,
        3n
      );
      await expect(tx4).to.be.revertedWith("neuron id not found");

      await expect(
        membership
          .connect(user1)
          .addBrainstemNeuron(
            errorTestsEcosystemUnit.id,
            errorTestsBrainstemUnit.id,
            errorTestsNeuronUnit.id
          )
      ).to.be.revertedWithCustomError(
        membership,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("remove a neuron from a brainstem with invalid parameters", async function () {
      const tx = membership.removeBrainstemNeuron(
        errorTestsEcosystemUnit.id,
        errorTestsBrainstemUnit.id,
        errorTestsNeuronUnitTwo.id
      );
      await expect(tx).to.be.revertedWith("neuron not part of brainstem");

      const tx2 = membership.removeBrainstemNeuron(
        3n,
        errorTestsBrainstemUnit.id,
        errorTestsNeuronUnit.id
      );
      await expect(tx2).to.be.revertedWith("ecosystem id not found");

      const tx3 = membership.removeBrainstemNeuron(
        errorTestsEcosystemUnit.id,
        3n,
        errorTestsNeuronUnit.id
      );
      await expect(tx3).to.be.revertedWith("brainstem id not found");

      const tx4 = membership.removeBrainstemNeuron(
        errorTestsEcosystemUnit.id,
        errorTestsBrainstemUnit.id,
        3n
      );
      await expect(tx4).to.be.revertedWith("neuron id not found");

      await expect(
        membership
          .connect(user1)
          .removeBrainstemNeuron(
            errorTestsEcosystemUnit.id,
            errorTestsBrainstemUnit.id,
            errorTestsNeuronUnit.id
          )
      ).to.be.revertedWithCustomError(
        membership,
        "AccessControlUnauthorizedAccount"
      );
    });
  });
});
