# Brainstems DAO

- [Getting Started](#getting-started)
  - [Requirements](#requirements)
  - [Quickstart](#quickstart)
- [Usage](#usage)
- [Deployment to a testnet or mainnet](#deployment-to-a-testnet-or-mainnet)


# Getting Started

## Requirements

- [Nodejs (v19.6.1)](https://nodejs.org/dist/v19.6.1/node-v19.6.1-x64.msi)
  - You'll know you've installed nodejs right if you can run:
    - `node --version` and get an ouput like `v19.6.1`
## Quickstart

```
git https://github.com/brainstems/brainstems-token-smart-contracts.git
npm install
```

Add a `.env` file in the root of the project, and as stated in the `.env.example` add:
```sh
TESTNET_PRIVATE_KEY=000000000000000000000000000000000000000000000000000000000000003c
MAINNET_PRIVATE_KEY=000000000000000000000000000000000000000000000000000000000000003c
```


# Compile & Test

### Clean:
To clear the cache and delete the artifacts.
```sh
npm run clean
```


### Compile:

Compile the smart contracts with Hardhat:

```sh
npm run build
```

### Test

Run the tests:

```sh
npm run test
```

# Deployment to a testnet or mainnet

For localhost, you can start your own hardhat node by running:
```sh
npx hardhat node
```

<br>

For contracts deployment you can run the script:
```sh
npm run deploy-contracts -- [args]
```

<br>

With the following possible Arguments:

- `--network [network]` --> This can be 'localhost', 'fuji', etc.
- `-all` --> Deploy all contracts.
- `-membership` --> Deploys the Membership Contract.
- `-access` --> Deploys the Access Contract.
- `-assets` --> Deploys the Assets Contract.
- `-execution` --> Deploys the Execution Contract.
- `-validation` --> Deploys the Validation Contract.

<br>

Example command to run all contracts in localhost:
```sh
npm run deploy-contracts -- --network localhost -membership -access -assets -execution -validation
```


## BSTMS Whitelisting Example Flow:

1- Deploy all contracts in the following order:
  - Assets
  - Membership
  - Access
  - Execution

2- Admin to Create the interactions asset in the Assets contract. (`Assets.createAsset(assetId, baseAsset, contributors, ipfsHash, metadata)`)

3- Admin to Setup the Membership contract:
  - Create the Ecosystem. (`Membership.createEcosystem(ecosystem)`)
  - Create the Company. (`Membership.createCompany(company)`)
  - Create the Brainstem. (`Membership.createBrainstem(brainstem, ecosystemId)`)
  - Add the Company to the Ecosystem. (`Membership.addEcosystemCompany(ecosystemId, companyId)`)
  - Add the Company to the Brainstem. (`Membership.addBrainstemCompany(ecosystemId, brainstemId, companyId)`)
  - Add the allowed users to the Company. (`Membership.addUsers(companyId, users[])`)

4- Admin to Setup the Access contract:
  - Give access to the interactions assets for the created brainstem. (`Access.updateEcosystemBrainstemAccess(assetId, ecosystemId, brainstemId, access)`) (for users to be able to execute the interactions use USAGE access type, index 1).

5- Once contracts are deployed and setup, the flow is the following:
  - When new users want to be given access to execute the asset, admin should Add the allowed users to the Company. (`Membership.addUsers(companyId, users[])`)
```
  We want to validate that executions are valid and a prerequisit has been met, this is where the `bytes` param comes in. When a user tries to execute an asset it should call the function `Execution.useBrainstemAsset` with the following params:
    - assetId
    - ecosystemId
    - brainstemId
    - bytes (this should be the hash of the prerequisit that needs to be met)

  In this way, when the user interacts with JedAI and is able to receive an airdrop, we can request a signature from the backend, with a unique message (executionId + userAddress + interactionType) where:
    - executionId is the predicted id of the execution that will be created.
    - userAddress is the address of the user that will execute the interaction.
    - interactionType is the type of interaction that the user will execute. (at this stage, 3 different type of awarded interactions will exist).

  This message can change while the backend knows how to handle the verification.

  When an execution is triggered, an event will be emitted, and the backend will be able to listen to this event and verify the signature. If the signature is valid, then we can store the user as a valid user for the airdrop.
```