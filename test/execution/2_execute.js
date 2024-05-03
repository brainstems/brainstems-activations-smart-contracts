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
  TestsCompanyUnitTwo,
  TestsCompanyUnitThree,
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

    TestsCompanyUnitTwo = {
      id: 2n,
      name: "Pepsi",
    }

    TestsCompanyUnitThree = {
      id: 3n,
      name: "Sprite",
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

    const MemberTxTwo = await membership.createCompany(
      TestsCompanyUnitTwo
    );
    await MemberTxTwo.wait();

    const MemberTxThree = await membership.createCompany(
      TestsCompanyUnitThree
    );
    await MemberTxThree.wait();

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

    await membership.addEcosystemCompany(
      TestsEcosystemUnit.id,
      TestsCompanyUnitTwo.id
    );

    await membership.addEcosystemCompany(
      TestsEcosystemUnit.id,
      TestsCompanyUnitThree.id
    );

    await membership.addUsers(
      TestsCompanyUnit.id,
      [user1.address]
    );

    await membership.addUsers(
      TestsCompanyUnitTwo.id,
      [user1.address]
    );

    await membership.addUsers(
      TestsCompanyUnitThree.id,
      [user1.address]
    );

    await membership.addBrainstemCompany(
      TestsEcosystemUnit.id,
      TestsBrainstemUnit.id,
      TestsCompanyUnit.id
    );

    await membership.addBrainstemCompany(
      TestsEcosystemUnit.id,
      TestsBrainstemUnitTwo.id,
      TestsCompanyUnitThree.id
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

    Execution = await ethers.getContractFactory("Execution");
    execution = await upgrades.deployProxy(Execution, [
      owner.address,
      accessContract.target,
      membership.target
    ]);

    AccessTypes = Enum("NO_ACCESS", "USAGE", "VALIDATION");

    const accessTx = await accessContract.updateEcosystemBrainstemAccess(
      assetId,
      TestsEcosystemUnit.id,
      TestsBrainstemUnit.id,
      AccessTypes.USAGE
    );
    await accessTx.wait();
  });

  // TODO: useBrainstemAsset.
  // TODO: useBrainstemAsset with invalid user.
  // TODO: useBrainstemAsset with company not in brainstem.
  // TODO: useBrainstemAsset with brainstem with no valid access.

  describe("should be able to", function () {
    it("execute a brainstem asset", async function () {
      const tx = await execution.connect(user1).useBrainstemAsset(
        assetId,
        TestsEcosystemUnit.id,
        TestsBrainstemUnit.id,
        TestsCompanyUnit.id,
        "0x"
      );
      await tx.wait();
    });
  });

  describe("should not be able to", function () {
    it("execute a brainstem asset with invalid user", async function () {
      await expect(
        execution.useBrainstemAsset(
          assetId,
          TestsEcosystemUnit.id,
          TestsBrainstemUnit.id,
          TestsCompanyUnit.id,
          "0x"
        )
      ).to.be.revertedWith("Execution: User is not part of the company.");
    });

    it("execute a brainstem asset with company not in brainstem", async function () {
      await expect(
        execution.connect(user1).useBrainstemAsset(
          assetId,
          TestsEcosystemUnit.id,
          TestsBrainstemUnitTwo.id,
          TestsCompanyUnit.id,
          "0x"
        )
      ).to.be.revertedWith("Execution: Company is not part of brainstem.");
    });
  });

  it("execute a brainstem asset with brainstem with no valid access", async function () {
    await expect(
      execution.connect(user1).useBrainstemAsset(
        assetId,
        TestsEcosystemUnit.id,
        TestsBrainstemUnitTwo.id,
        TestsCompanyUnitThree.id,
        "0x"
      )
    ).to.be.revertedWith("Execution: Brainstem does not have access to the asset.");
  });
});