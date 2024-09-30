// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const KimikoModule = buildModule("KimikoModule", (m) => {
  const kimiko = m.contract("Kimiko");

  return { kimiko };
});

export default KimikoModule;
