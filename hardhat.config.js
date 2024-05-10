require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require("hardhat-contract-sizer");

require("dotenv").config();

const TESTNET_PRIVATE_KEY = process.env.TESTNET_PRIVATE_KEY;
const MAINNET_PRIVATE_KEY = process.env.MAINNET_PRIVATE_KEY;

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    snowtrace: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      accounts: [MAINNET_PRIVATE_KEY]
    },
    avax: {
      url: "https://cool-powerful-dawn.avalanche-mainnet.quiknode.pro/881c61708f1847bb01ca1fddb1c26a21e423704d/ext/bc/C/rpc",
      gasPrice: 225000000000,
      chainId: 43114,
      accounts: [MAINNET_PRIVATE_KEY],
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      gasPrice: 225000000000,
      chainId: 43113,
      accounts: [TESTNET_PRIVATE_KEY],
    },
    mainnet: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      gasPrice: 225000000000,
      chainId: 43114,
      accounts: [MAINNET_PRIVATE_KEY],
    },
    arbitrumGoerli: {
      url: "https://goerli-rollup.arbitrum.io/rpc",
      chainId: 421613,
      accounts: [TESTNET_PRIVATE_KEY]
    },
    goerli: {
      url: "https://goerli.infura.io/v3/4ed535ceb6054775bf2f8a6cf137bbf2",
      chainId: 5,
      accounts: [TESTNET_PRIVATE_KEY]
    },
    sepolia: {
      url: "https://special-twilight-bird.ethereum-sepolia.quiknode.pro/ef0ddda19c072a2eee1ab3bb318e74cb6b36985e",
      chainId: 11155111,
      accounts: [TESTNET_PRIVATE_KEY],
      etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY
      }
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.21",
        settings: {
          evmVersion: "paris",
          optimizer: {
            enabled: true,
            runs: 1,
          },
          "viaIR": true,
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
      snowtrace: 'placeholder',
      avalancheFujiTestnet: 'asd'
    },
    customChains: [
      {
        network: "snowtrace",
        chainId: 43114,
        urls: {
          apiURL: "https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan",
          browserURL: "https://snowtrace.io"
        }
      }
    ]
  }
};
