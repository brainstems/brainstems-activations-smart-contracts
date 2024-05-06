const { expect } = require("chai");
const { ethers } = require("hardhat");
const { admin } = require("../../scripts/config");
const {
  BRAINSTEMS_TOKEN_NAME,
  BRAINSTEMS_TOKEN_SYMBOL,
  BRAINSTEMS_TOKEN_DECIMALS,
} = require("../consts");
const { verifyEvents, Enum } = require("../utils");

let Access,
  AccessTypes,
  Assets,
  Membership,
  accessContract,
  brainstemsToken,
  assetsContract,
  membership,
  owner,
  user1,
  user2,
  user3,
  TestsEcosystemUnit,
  TestsNeuronUnit,
  TestsPathwayUnit,
  TestsPathwayUnitTwo,
  assetId,
  baseAssetId,
  contributors,
  ipfsHash,
  metadata;

describe("Access: Grant Acceses", function () {
  before(async () => {
    [owner, user1, user2, user3] = await ethers.getSigners();

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
    accessContract = await upgrades.deployProxy(Access, [
      owner.address,
      assetsContract.target,
      membership.target
    ]);

    TestsEcosystemUnit = {
      id: 1n,
      name: "Ecosystem",
    }

    TestsNeuronUnit = {
      id: 1n,
      name: "Coca Cola",
    }

    TestsPathwayUnit = {
      id: 1n,
      name: "Pathways",
    }

    TestsPathwayUnitTwo = {
      id: 2n,
      name: "PathwaysTwo",
    }

    const EcosystemTx = await membership.createEcosystem(
      TestsEcosystemUnit
    );
    await EcosystemTx.wait();

    const MemberTx = await membership.createNeuron(
      TestsNeuronUnit
    );
    await MemberTx.wait();

    const PathwayTx = await membership.createPathway(
      TestsPathwayUnit,
      TestsEcosystemUnit.id
    );
    await PathwayTx.wait();

    const PathwayTxTwo = await membership.createPathway(
      TestsPathwayUnitTwo,
      TestsEcosystemUnit.id
    );
    await PathwayTxTwo.wait();

    await membership.addEcosystemNeuron(
      TestsEcosystemUnit.id,
      TestsNeuronUnit.id
    );

    await membership.addUsers(
      TestsNeuronUnit.id,
      [user1.address]
    );

    await membership.addPathwayNeuron(
      TestsEcosystemUnit.id,
      TestsPathwayUnit.id,
      TestsNeuronUnit.id
    );

    // Asset Creation
    assetId = 13n;
    baseAssetId = 0n;
    contributors = {
      creator: user1.address,
      marketing: user2.address,
      presale: user3.address,
      creatorRate: 5000n,
      marketingRate: 2000n,
      presaleRate: 3000n,
    };
    ipfsHash = "bafybeihkoviema7g3gxyt6la7vd5ho32ictqbilu3wnlo3rs7ewhnp7lly";
    metadata = {
      name: "testAsset",
      version: 1n,
      description: "test description",
      fingerprint: ethers.randomBytes(32),
      trained: false,
      watermarkFingerprint: ethers.randomBytes(32),
      performance: 73n,
    };

    const tx = await assetsContract.createAsset(
      assetId,
      baseAssetId,
      contributors,
      ipfsHash,
      metadata
    );
    await tx.wait();

    AccessTypes = Enum("NO_ACCESS", "USAGE", "VALIDATION");
  });

  describe("should be able to", function () {
    it("give access USAGE access to a pathway", async function () {
      const tx = await accessContract.updateEcosystemPathwayAccess(
        assetId,
        TestsEcosystemUnit.id,
        TestsPathwayUnit.id,
        AccessTypes.USAGE
      );
      await tx.wait();

      await verifyEvents(tx, accessContract, "EcosystemPathwayAccessUpdated", [
        {
          assetId: assetId,
          ecosystemId: TestsEcosystemUnit.id,
          pathwayId: TestsPathwayUnit.id,
          access: AccessTypes.USAGE
        },
      ]);

      const hasAccess = await accessContract.getEcosystemPathwayAccess(
        assetId,
        TestsEcosystemUnit.id,
        TestsPathwayUnit.id
      );
      expect(hasAccess).to.equal(AccessTypes.USAGE);
    });

    it("give access VALIDATION access to a pathway", async function () {
      const tx = await accessContract.updateEcosystemPathwayAccess(
        assetId,
        TestsEcosystemUnit.id,
        TestsPathwayUnit.id,
        AccessTypes.VALIDATION
      );
      await tx.wait();

      await verifyEvents(tx, accessContract, "EcosystemPathwayAccessUpdated", [
        {
          assetId: assetId,
          ecosystemId: TestsEcosystemUnit.id,
          pathwayId: TestsPathwayUnit.id,
          access: AccessTypes.VALIDATION
        },
      ]);

      const hasAccess = await accessContract.getEcosystemPathwayAccess(
        assetId,
        TestsEcosystemUnit.id,
        TestsPathwayUnit.id
      );
      expect(hasAccess).to.equal(AccessTypes.VALIDATION);
    });

    it("give access to multiple pathways at once", async function () {
      const tx = await accessContract.updateEcosystemPathwayAccessBatch(
        [assetId, assetId],
        [TestsEcosystemUnit.id, TestsEcosystemUnit.id],
        [TestsPathwayUnit.id, TestsPathwayUnitTwo.id],
        [AccessTypes.USAGE, AccessTypes.VALIDATION]
      );
      await tx.wait();

      await verifyEvents(tx, accessContract, "EcosystemPathwayAccessUpdated", [
        {
          assetId: assetId,
          ecosystemId: TestsEcosystemUnit.id,
          pathwayId: TestsPathwayUnit.id,
          access: AccessTypes.USAGE
        },
        {
          assetId: assetId,
          ecosystemId: TestsEcosystemUnit.id,
          pathwayId: TestsPathwayUnitTwo.id,
          access: AccessTypes.VALIDATION
        },
      ]);

      const hasAccess = await accessContract.getEcosystemPathwayAccess(
        assetId,
        TestsEcosystemUnit.id,
        TestsPathwayUnit.id
      );
      expect(hasAccess).to.equal(AccessTypes.USAGE);

      const hasAccessTwo = await accessContract.getEcosystemPathwayAccess(
        assetId,
        TestsEcosystemUnit.id,
        TestsPathwayUnitTwo.id
      );
      expect(hasAccessTwo).to.equal(AccessTypes.VALIDATION);
    });

    it("remove access to a pathway", async function () {
      const tx = await accessContract.updateEcosystemPathwayAccess(
        assetId,
        TestsEcosystemUnit.id,
        TestsPathwayUnit.id,
        AccessTypes.NO_ACCESS
      );
      await tx.wait();

      await verifyEvents(tx, accessContract, "EcosystemPathwayAccessUpdated", [
        {
          assetId: assetId,
          ecosystemId: TestsEcosystemUnit.id,
          pathwayId: TestsPathwayUnit.id,
          access: AccessTypes.NO_ACCESS
        },
      ]);

      const hasAccess = await accessContract.getEcosystemPathwayAccess(
        assetId,
        TestsEcosystemUnit.id,
        TestsPathwayUnit.id
      );
      expect(hasAccess).to.equal(AccessTypes.NO_ACCESS);
    });
  });

  describe("should not be able to", function () {
    it("give access from non-owner", async function () {
      const tx = accessContract.connect(user1).updateEcosystemPathwayAccess(
        assetId,
        TestsEcosystemUnit.id,
        TestsPathwayUnit.id,
        AccessTypes.USAGE
      );
      await expect(tx).to.be.revertedWithCustomError(
        accessContract,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("give access to a non-existent pathway", async function () {
      const tx = accessContract.updateEcosystemPathwayAccess(
        assetId,
        TestsEcosystemUnit.id,
        999n,
        AccessTypes.USAGE
      );
      await expect(tx).to.be.revertedWith("Access: Pathway does not exist in ecosystem");
    });

    it("give access to a non-existent ecosystem", async function () {
      const tx = accessContract.updateEcosystemPathwayAccess(
        assetId,
        999n,
        TestsPathwayUnit.id,
        AccessTypes.USAGE
      );
      await expect(tx).to.be.revertedWith("Access: Ecosystem does not exist");
    });

    it("give access to a non-existent asset", async function () {
      const tx = accessContract.updateEcosystemPathwayAccess(
        999n,
        TestsEcosystemUnit.id,
        TestsPathwayUnit.id,
        AccessTypes.USAGE
      );
      await expect(tx).to.be.revertedWith("Access: Asset does not exist");
    });

    it("give access to a non-existent asset, ecosystem, and pathway", async function () {
      const tx = accessContract.updateEcosystemPathwayAccess(
        999n,
        999n,
        999n,
        AccessTypes.USAGE
      );
      await expect(tx).to.be.revertedWith("Access: Asset does not exist");
    });
  });
});
