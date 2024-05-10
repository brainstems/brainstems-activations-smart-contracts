const hre = require("hardhat");

const {
  admin, usdcToken, assetsConfigAddress, membershipConfigAddress,
  accessConfigAddress, executionConfigAddress
} = require("./config");
const { verifyEvents, Enum } = require("./utils");


let owner, user1, user2, user3, assets, access, assetId, baseAssetId, contributors, ipfsHash, metadata;

async function main() {
  console.log(`stdout: Creation process started`);
  const ROLE = ethers.id("DEFAULT_ADMIN_ROLE");

  [owner, user1, user2, user3] = await ethers.getSigners();

  // Instantiate existing deployed contracts
  assets = await ethers.getContractAt("Assets", assetsConfigAddress);
  membership = await ethers.getContractAt("Membership", membershipConfigAddress);
  access = await ethers.getContractAt("Access", accessConfigAddress);
  execution = await ethers.getContractAt("Execution", executionConfigAddress);

  //grant roles
  await assets.grantRole(ROLE, owner.address);
  await membership.grantRole(ROLE, owner.address);
  await access.grantRole(ROLE, owner.address);
  await execution.grantRole(ROLE, owner.address);

  console.log(`stdout: Contracts instantiated`);

  // Define data objects for your operations
  const brainstemUnit = {
    id: 1n,
    name: "Brainstems Community",
  };
  const neuronUnit = {
    id: 1n,
    name: "Brainstem Foundation",
  };
  const pathwayUnit = {
    id: 1n,
    name: "Airdrop",
  };

  // Create Brainstem, Pathway, Neuron, etc.
  const brainstemTx = await membership.createBrainstem(brainstemUnit);
  await brainstemTx.wait();
  console.log(`stdout: Brainstem added`);

  const pathwayTx = await membership.createPathway(pathwayUnit, brainstemUnit.id);
  await pathwayTx.wait();
  console.log(`stdout: Pathway added`);

  const memberTx = await membership.createNeuron(neuronUnit);
  await memberTx.wait();
  console.log(`stdout: Neuron added`);

  await membership.addUsers(brainstemUnit.id, [owner.address]);
  console.log(`stdout: User added to brainstem`);

  await membership.addBrainstemNeuron(brainstemUnit.id, neuronUnit.id);
  console.log(`stdout: Neuron added to brainstem`);

  await membership.addPathwayNeuron(brainstemUnit.id, pathwayUnit.id, neuronUnit.id);
  console.log(`stdout: Neuron added to Brainstem-Pathway`);

  // Create assets
  assetId = 1n;
  baseAssetId = 0n;
  contributors = {
    creator: owner.address,
    marketing: owner.address,
    presale: owner.address,
    creatorRate: 5000n,
    marketingRate: 2500n,
    presaleRate: 2500n,
  };
  ipfsHash = "bafybeihkoviema7g3gxyt6la7vd5ho32ictqbilu3wnlo3rs7ewhnp7lly";
  metadata = {
    name: "Crypto Predictor Model",
    version: 1n,
    description: "Crypto Predictor Model using Dolphin Mistral 7bv0.2 + Context training",
    fingerprint: ethers.randomBytes(32),
    trained: true,
    watermarkFingerprint: ethers.randomBytes(32),
    performance: 50n,
  };

  const tx = await assets.createAsset(assetId, baseAssetId, contributors, ipfsHash, metadata);
  await tx.wait();
  console.log(`stdout: Asset created`);
 

  AccessTypes = Enum("NO_ACCESS", "USAGE", "VALIDATION");

  const hasAdminRole = await access.hasRole(ROLE, owner.address);
  console.log("Has DEFAULT_ADMIN_ROLE:", hasAdminRole);

  // Updating access and using assets
  accessToBrainstemPathwayUpdateTx = await access.updateBrainstemPathwayAccess(
    assetId, brainstemUnit.id, pathwayUnit.id, AccessTypes.USAGE
  );
  console.log(`stdout: Asset execution permission granted`);

  usePathwayAssettx = await execution.usePathwayAsset(
    assetId, brainstemUnit.id, pathwayUnit.id, neuronUnit.id, "0x"
  );
  console.log(`stdout: Asset execution registered`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});