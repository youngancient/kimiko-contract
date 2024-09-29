import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks :{
    scrollSepolia : {
      url: process.env.SCROLL_SEPOLIA_RPC_URL!,
      accounts: [
        process.env.ACCOUNT_PRIVATE_KEY!,
        // process.env.ACCOUNT_PRIVATE_KEY1!,
        // process.env.ACCOUNT_PRIVATE_KEY2!,
      ],
      gasPrice: 1000000000,
    },
  },
  etherscan: {
    apiKey: {
      scrollSepolia: process.env.SCROLL_SEPOLIA_ETHERSCAN_API_KEY!,
    },
    customChains: [
      {
        network: 'scrollSepolia',
        chainId: 534351,
        urls: {
          apiURL: 'https://api-sepolia.scrollscan.com/api',
          browserURL: 'https://sepolia.scrollscan.com/',
        },
      },
    ],
  },
};

export default config;
