import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const KimikoTokenModule = buildModule("KimikoTokenModule", (m) => {

    const kimiToken = m.contract("KimiToken");

    return { kimiToken };
});

export default KimikoTokenModule;
