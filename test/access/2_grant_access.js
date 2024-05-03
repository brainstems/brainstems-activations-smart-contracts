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
  TestsCompanyUnit,
  TestsBrainstemUnit,
  TestsBrainstemUnitTwo,
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

    TestsCompanyUnit = {
      id: 1n,
      name: "Coca Cola",
    }

    TestsBrainstemUnit = {
      id: 1n,
      name: "Brainstems",
    }

    TestsBrainstemUnitTwo = {
      id: 2n,
      name: "BrainstemsTwo",
    }

    const EcosystemTx = await membership.createEcosystem(
      TestsEcosystemUnit
    );
    await EcosystemTx.wait();

    const MemberTx = await membership.createCompany(
      TestsCompanyUnit
    );
    await MemberTx.wait();

    const BrainstemTx = await membership.createBrainstem(
      TestsBrainstemUnit,
      TestsEcosystemUnit.id
    );
    await BrainstemTx.wait();

    const BrainstemTxTwo = await membership.createBrainstem(
      TestsBrainstemUnitTwo,
      TestsEcosystemUnit.id
    );
    await BrainstemTxTwo.wait();

    await membership.addEcosystemCompany(
      TestsEcosystemUnit.id,
      TestsCompanyUnit.id
    );

    await membership.addUsers(
      TestsCompanyUnit.id,
      [user1.address]
    );

    await membership.addBrainstemCompany(
      TestsEcosystemUnit.id,
      TestsBrainstemUnit.id,
      TestsCompanyUnit.id
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
    it("give access USAGE access to a brainstem", async function () {
      const tx = await accessContract.updateEcosystemBrainstemAccess(
        assetId,
        TestsEcosystemUnit.id,
        TestsBrainstemUnit.id,
        AccessTypes.USAGE
      );
      await tx.wait();

      await verifyEvents(tx, accessContract, "EcosystemBrainstemAccessUpdated", [
        {
          assetId: assetId,
          ecosystemId: TestsEcosystemUnit.id,
          brainstemId: TestsBrainstemUnit.id,
          access: AccessTypes.USAGE
        },
      ]);

      const hasAccess = await accessContract.getEcosystemBrainstemAccess(
        assetId,
        TestsEcosystemUnit.id,
        TestsBrainstemUnit.id
      );
      expect(hasAccess).to.equal(AccessTypes.USAGE);
    });

    it("give access VALIDATION access to a brainstem", async function () {
      const tx = await accessContract.updateEcosystemBrainstemAccess(
        assetId,
        TestsEcosystemUnit.id,
        TestsBrainstemUnit.id,
        AccessTypes.VALIDATION
      );
      await tx.wait();

      await verifyEvents(tx, accessContract, "EcosystemBrainstemAccessUpdated", [
        {
          assetId: assetId,
          ecosystemId: TestsEcosystemUnit.id,
          brainstemId: TestsBrainstemUnit.id,
          access: AccessTypes.VALIDATION
        },
      ]);

      const hasAccess = await accessContract.getEcosystemBrainstemAccess(
        assetId,
        TestsEcosystemUnit.id,
        TestsBrainstemUnit.id
      );
      expect(hasAccess).to.equal(AccessTypes.VALIDATION);
    });

    it("give access to multiple brainstems at once", async function () {
      const tx = await accessContract.updateEcosystemBrainstemAccessBatch(
        [assetId, assetId],
        [TestsEcosystemUnit.id, TestsEcosystemUnit.id],
        [TestsBrainstemUnit.id, TestsBrainstemUnitTwo.id],
        [AccessTypes.USAGE, AccessTypes.VALIDATION]
      );
      await tx.wait();

      await verifyEvents(tx, accessContract, "EcosystemBrainstemAccessUpdated", [
        {
          assetId: assetId,
          ecosystemId: TestsEcosystemUnit.id,
          brainstemId: TestsBrainstemUnit.id,
          access: AccessTypes.USAGE
        },
        {
          assetId: assetId,
          ecosystemId: TestsEcosystemUnit.id,
          brainstemId: TestsBrainstemUnitTwo.id,
          access: AccessTypes.VALIDATION
        },
      ]);

      const hasAccess = await accessContract.getEcosystemBrainstemAccess(
        assetId,
        TestsEcosystemUnit.id,
        TestsBrainstemUnit.id
      );
      expect(hasAccess).to.equal(AccessTypes.USAGE);

      const hasAccessTwo = await accessContract.getEcosystemBrainstemAccess(
        assetId,
        TestsEcosystemUnit.id,
        TestsBrainstemUnitTwo.id
      );
      expect(hasAccessTwo).to.equal(AccessTypes.VALIDATION);
    });

    it("remove access to a brainstem", async function () {
      const tx = await accessContract.updateEcosystemBrainstemAccess(
        assetId,
        TestsEcosystemUnit.id,
        TestsBrainstemUnit.id,
        AccessTypes.NO_ACCESS
      );
      await tx.wait();

      await verifyEvents(tx, accessContract, "EcosystemBrainstemAccessUpdated", [
        {
          assetId: assetId,
          ecosystemId: TestsEcosystemUnit.id,
          brainstemId: TestsBrainstemUnit.id,
          access: AccessTypes.NO_ACCESS
        },
      ]);

      const hasAccess = await accessContract.getEcosystemBrainstemAccess(
        assetId,
        TestsEcosystemUnit.id,
        TestsBrainstemUnit.id
      );
      expect(hasAccess).to.equal(AccessTypes.NO_ACCESS);
    });
  });

  describe("should not be able to", function () {
    it("give access from non-owner", async function () {
      const tx = accessContract.connect(user1).updateEcosystemBrainstemAccess(
        assetId,
        TestsEcosystemUnit.id,
        TestsBrainstemUnit.id,
        AccessTypes.USAGE
      );
      await expect(tx).to.be.revertedWithCustomError(
        accessContract,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("give access to a non-existent brainstem", async function () {
      const tx = accessContract.updateEcosystemBrainstemAccess(
        assetId,
        TestsEcosystemUnit.id,
        999n,
        AccessTypes.USAGE
      );
      await expect(tx).to.be.revertedWith("Access: Brainstem does not exist in ecosystem");
    });

    it("give access to a non-existent ecosystem", async function () {
      const tx = accessContract.updateEcosystemBrainstemAccess(
        assetId,
        999n,
        TestsBrainstemUnit.id,
        AccessTypes.USAGE
      );
      await expect(tx).to.be.revertedWith("Access: Ecosystem does not exist");
    });

    it("give access to a non-existent asset", async function () {
      const tx = accessContract.updateEcosystemBrainstemAccess(
        999n,
        TestsEcosystemUnit.id,
        TestsBrainstemUnit.id,
        AccessTypes.USAGE
      );
      await expect(tx).to.be.revertedWith("Access: Asset does not exist");
    });

    it("give access to a non-existent asset, ecosystem, and brainstem", async function () {
      const tx = accessContract.updateEcosystemBrainstemAccess(
        999n,
        999n,
        999n,
        AccessTypes.USAGE
      );
      await expect(tx).to.be.revertedWith("Access: Asset does not exist");
    });
  });
});
