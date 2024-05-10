const hre = require("hardhat");
const { admin, usdcToken, assetsConfigAddress, membershipConfigAddress, accessConfigAddress, executionConfigAddress } = require("./config");
let localtest;

async function main() {
  let assetsAddress, membershipAddress, accessAddress, executionAddress;

  if (process.env.DEPLOY_LOCAL == "true") localtest = true;
  if (process.env.DEPLOY_ASSETS !== "true") assetsAddress = assetsConfigAddress;
  if (process.env.DEPLOY_MEMBERSHIP !== "true") membershipAddress = membershipConfigAddress;
  if (process.env.DEPLOY_ACCESS !== "true") accessAddress = accessConfigAddress;
  if (process.env.DEPLOY_EXECUTION !== "true") executionAddress = executionConfigAddress;

  if (process.env.DEPLOY_ALL === "true" || process.env.DEPLOY_ASSETS === "true") {
    assetsAddress = await deployAssetsContract();
  }

  if (process.env.DEPLOY_ALL === "true" || process.env.DEPLOY_MEMBERSHIP === "true") {
    membershipAddress = await deployMembershipContract(assetsAddress);
  }

  if (process.env.DEPLOY_ALL === "true" || process.env.DEPLOY_ACCESS === "true") {
    accessAddress = await deployAccessContract(assetsAddress, membershipAddress);
  }

  if (process.env.DEPLOY_ALL === "true" || process.env.DEPLOY_EXECUTION === "true") {
    executionAddress = await deployExecutionContract(accessAddress, membershipAddress);
  }

  /*
    if (process.env.DEPLOY_ALL==="true" || process.env.DEPLOY_VALIDATION === "true") {
      await deployValidationContract();
    }
  */
}

async function deployValidationContract() {
  console.log("deploying Validation Contract....");

  const Validation = await hre.ethers.getContractFactory(
    "Validation"
  );
  const validation = await upgrades.deployProxy(Validation, [
    // Constructor args.
  ]);
  await validation.waitForDeployment();

  const address = await validation.getAddress();
  console.log("deployed to :", address);
  return address;
}

async function deployMembershipContract(assetsAddress) {
  console.log("deploying Membership Contract....");

  const Membership = await hre.ethers.getContractFactory(
    "Membership"
  );
  const membership = await upgrades.deployProxy(Membership, [
    admin,
    assetsAddress
  ]);
  await membership.waitForDeployment();

  const address = await membership.getAddress();
  console.log("deployed to :", address);
  if (!localtest) {
    try {
      await hre.run(`verify:verify`, {
        address: address,
        constructorArguments: [],
      });
    }
    catch { }
  }
  return address;
}

async function deployExecutionContract(accessAddress, membershipAddress) {
  console.log("deploying Execution Contract....");

  const Execution = await hre.ethers.getContractFactory(
    "Execution"
  );
  const execution = await upgrades.deployProxy(Execution, [
    admin,
    accessAddress,
    membershipAddress
  ]);
  await execution.waitForDeployment();

  const address = await execution.getAddress();
  console.log("deployed to:", address);
  if (!localtest) {
    try {
      await hre.run(`verify:verify`, {
        address: address,
        constructorArguments: [],
      });
    }
    catch { }
  }

  return address;
}

async function deployAssetsContract() {
  console.log("deploying Assets Contract....");

  const Assets = await hre.ethers.getContractFactory(
    "Assets"
  );
  const assets = await upgrades.deployProxy(Assets, [
    admin,
    usdcToken
  ]);
  await assets.waitForDeployment();

  const address = await assets.getAddress();
  console.log("deployed to:", address);

  if (!localtest) {
    try {
      await hre.run(`verify:verify`, {
        address: address,
        constructorArguments: [],
      });
    }
    catch { }
  }
  return address;
}

async function deployAccessContract(assetsAddress, membershipAddress) {
  console.log("deploying Access Contract....");

  const Access = await hre.ethers.getContractFactory(
    "Access"
  );
  const access = await upgrades.deployProxy(Access, [
    admin,
    assetsAddress,
    membershipAddress
  ]);
  await access.waitForDeployment();

  const address = await access.getAddress();
  console.log("deployed to:", address);

  if (!localtest) {
    try {
      await hre.run(`verify:verify`, {
        address: address,
        constructorArguments: [],
      });
    }
    catch { }
  }
  return address;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});