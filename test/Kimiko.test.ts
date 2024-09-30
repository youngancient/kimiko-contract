import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

// describe("Kimiko", function () {
//   // We define a fixture to reuse the same setup in every test.
//   // We use loadFixture to run this setup once, snapshot that state,
//   // and reset Hardhat Network to that snapshot in every test.
//   async function deployKimiko() {

//     // Contracts are deployed using the first signer/account by default
//     const [owner, otherAccount] = await hre.ethers.getSigners();

//     const Kimiko = await hre.ethers.getContractFactory("Kimiko");
//     const kimiko = await Kimiko.deploy();

//     return { kimiko, owner, otherAccount };
//   }

//   describe("Deployment", function () {
//     it("Should deploy successfully", async function () {
//       const { kimiko } = await loadFixture(deployKimiko);

//     });

//   });

// });
