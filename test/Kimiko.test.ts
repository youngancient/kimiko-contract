import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("Kimiko", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployToken() {
    // Contracts are deployed using the first signer/account by default

    const erc20Token = await hre.ethers.getContractFactory("KimiToken");
    const kimiToken = await erc20Token.deploy();

    return { kimiToken };
  }

  async function deployKimiko() {
    // Contracts are deployed using the first signer/account by default
    const [owner, doctor, patient1, patient2] = await hre.ethers.getSigners();
    const { kimiToken } = await loadFixture(deployToken);

    const Kimiko = await hre.ethers.getContractFactory("Kimiko");
    const kimiko = await Kimiko.deploy(kimiToken);

    const amount = await kimiToken.balanceOf(owner);

    await kimiToken.transfer(kimiko, amount);

    return { kimiko, owner, doctor, patient1, patient2, kimiToken, amount };
  }

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const { kimiko, kimiToken, amount } = await loadFixture(deployKimiko);
      expect(await kimiToken.balanceOf(kimiko)).to.equal(amount);
      expect(await kimiko.getTokenAddress()).to.equal(kimiToken);
    });
  });
  describe("Simple function tests", function () {
    it("Should add doctor successfully", async function () {
      const { kimiko, kimiToken, doctor } = await loadFixture(deployKimiko);
      const name = "Dr strange";
      const specialty = "medicine";

      await expect(kimiko.connect(doctor).addDoctor(name, specialty))
        .to.emit(kimiko, "DoctorAddedSuccessfully")
        .withArgs(1, name, doctor);

      expect(await kimiko.noOfDoctors()).to.equal(1);
    });
    it("Should allow doctor add patients successfully", async function () {
      const { kimiko, kimiToken, doctor, patient1, patient2 } =
        await loadFixture(deployKimiko);
      const name = "Dr strange";
      const specialty = "medicine";

      await expect(kimiko.connect(doctor).addDoctor(name, specialty))
        .to.emit(kimiko, "DoctorAddedSuccessfully")
        .withArgs(1, name, doctor);

      const patientName = "Debbi";
      const patientAddress = patient1.address;

      await expect(
        kimiko.connect(doctor).addPatient(patientName, patientAddress)
      )
        .to.emit(kimiko, "PatientAddedSuccessfully")
        .withArgs(1, patientName, patientAddress);

      expect(await kimiko.noOfPatients()).to.equal(1);

      const patientName2 = "Debbi";
      const patientAddress2 = patient2.address;

      await expect(
        kimiko.connect(doctor).addPatient(patientName2, patientAddress2)
      )
        .to.emit(kimiko, "PatientAddedSuccessfully")
        .withArgs(2, patientName2, patientAddress2);

      expect(await kimiko.noOfPatients()).to.equal(2);
    });

    it("Should allow doctor add medications to patients successfully", async function () {
      const { kimiko, kimiToken, doctor, patient1, patient2 } =
        await loadFixture(deployKimiko);
      const name = "Dr strange";
      const specialty = "medicine";

      await expect(kimiko.connect(doctor).addDoctor(name, specialty))
        .to.emit(kimiko, "DoctorAddedSuccessfully")
        .withArgs(1, name, doctor);

      const patientName = "Debbi";

      await expect(kimiko.connect(doctor).addPatient(patientName, patient1))
        .to.emit(kimiko, "PatientAddedSuccessfully")
        .withArgs(1, patientName, patient1);

      expect(await kimiko.noOfPatients()).to.equal(1);

      const patientName2 = "Debbi";

      await expect(kimiko.connect(doctor).addPatient(patientName2, patient2))
        .to.emit(kimiko, "PatientAddedSuccessfully")
        .withArgs(2, patientName2, patient2);

      expect(await kimiko.noOfPatients()).to.equal(2);

      // add medications

      const medName = "Paracetamol";
      const dosage = 50;
      const interval = 6;
      const duration = 1;

      // add to patient1
      await expect(
        kimiko
          .connect(doctor)
          .addPatientMedication(patient1, medName, dosage, interval, duration)
      )
        .to.emit(kimiko, "PatientMedicationAdded")
        .withArgs(1, medName, duration);

      expect(
        (await kimiko.connect(doctor)["getPatientDetails(address)"](patient1))
          .noOfMedications
      ).to.equal(1);

      // add to patient2
      await expect(
        kimiko
          .connect(doctor)
          .addPatientMedication(patient2, medName, dosage, interval, duration)
      )
        .to.emit(kimiko, "PatientMedicationAdded")
        .withArgs(1, medName, duration);

      expect(
        (await kimiko.connect(doctor)["getPatientDetails(address)"](patient2))
          .noOfMedications
      ).to.equal(1);
    });
    it("Should allow patients take medication successfully", async function () {
      const { kimiko, kimiToken, doctor, patient1, patient2 } =
        await loadFixture(deployKimiko);
      const name = "Dr strange";
      const specialty = "medicine";

      await expect(kimiko.connect(doctor).addDoctor(name, specialty))
        .to.emit(kimiko, "DoctorAddedSuccessfully")
        .withArgs(1, name, doctor);

      const patientName = "Debbi";

      await expect(kimiko.connect(doctor).addPatient(patientName, patient1))
        .to.emit(kimiko, "PatientAddedSuccessfully")
        .withArgs(1, patientName, patient1);

      expect(await kimiko.noOfPatients()).to.equal(1);

      const patientName2 = "Debbi";

      await expect(kimiko.connect(doctor).addPatient(patientName2, patient2))
        .to.emit(kimiko, "PatientAddedSuccessfully")
        .withArgs(2, patientName2, patient2);

      expect(await kimiko.noOfPatients()).to.equal(2);

      // add medications

      const medName = "Paracetamol";
      const dosage = 50;
      const interval = 6;
      const duration = 1;

      // add to patient1
      await expect(
        kimiko
          .connect(doctor)
          .addPatientMedication(patient1, medName, dosage, interval, duration)
      )
        .to.emit(kimiko, "PatientMedicationAdded")
        .withArgs(1, medName, duration);

      expect(
        (await kimiko.connect(doctor)["getPatientDetails(address)"](patient1))
          .noOfMedications
      ).to.equal(1);

      // add to patient2
      await expect(
        kimiko
          .connect(doctor)
          .addPatientMedication(patient2, medName, dosage, interval, duration)
      )
        .to.emit(kimiko, "PatientMedicationAdded")
        .withArgs(1, medName, duration);

      expect(
        (await kimiko.connect(doctor)["getPatientDetails(address)"](patient2))
          .noOfMedications
      ).to.equal(1);

      // patient1 takes
      let block = await ethers.provider.getBlock("latest");
      let timestamp = block!.timestamp;

      await expect(kimiko.connect(patient1).takeMedication(1))
        .to.emit(kimiko, "MedicationTaken")
        .withArgs(1, patient1, timestamp + 1);

      const medications1 = await kimiko.connect(patient1).getMyMedications();
      expect(medications1[0].dosesTaken).to.equal(1);

      block = await ethers.provider.getBlock("latest");
      timestamp = block!.timestamp;

      // patient2 takes
      await expect(kimiko.connect(patient2).takeMedication(1))
        .to.emit(kimiko, "MedicationTaken")
        .withArgs(1, patient2, timestamp + 1);
    });
    it("Should allow patients take medication in intervals", async function () {
      const { kimiko, kimiToken, doctor, patient1, patient2 } =
        await loadFixture(deployKimiko);
      const name = "Dr strange";
      const specialty = "medicine";

      await expect(kimiko.connect(doctor).addDoctor(name, specialty))
        .to.emit(kimiko, "DoctorAddedSuccessfully")
        .withArgs(1, name, doctor);

      const patientName = "Debbi";

      await expect(kimiko.connect(doctor).addPatient(patientName, patient1))
        .to.emit(kimiko, "PatientAddedSuccessfully")
        .withArgs(1, patientName, patient1);

      expect(await kimiko.noOfPatients()).to.equal(1);

      const patientName2 = "Debbi";

      await expect(kimiko.connect(doctor).addPatient(patientName2, patient2))
        .to.emit(kimiko, "PatientAddedSuccessfully")
        .withArgs(2, patientName2, patient2);

      expect(await kimiko.noOfPatients()).to.equal(2);

      // add medications

      const medName = "Paracetamol";
      const dosage = 50;
      const interval = 6;
      const duration = 1;

      // add to patient1
      await expect(
        kimiko
          .connect(doctor)
          .addPatientMedication(patient1, medName, dosage, interval, duration)
      )
        .to.emit(kimiko, "PatientMedicationAdded")
        .withArgs(1, medName, duration);

      expect(
        (await kimiko.connect(doctor)["getPatientDetails(address)"](patient1))
          .noOfMedications
      ).to.equal(1);


      // patient1 takes
      let block = await ethers.provider.getBlock("latest");
      let timestamp = block!.timestamp;

      await expect(kimiko.connect(patient1).takeMedication(1))
        .to.emit(kimiko, "MedicationTaken")
        .withArgs(1, patient1, timestamp + 1);

      let medications1 = await kimiko.connect(patient1).getMyMedications();
      expect(medications1[0].dosesTaken).to.equal(1);

      // take drug
      block = await ethers.provider.getBlock("latest");
      timestamp = block!.timestamp;

      time.increaseTo(timestamp + interval * 60 * 60);

      await kimiko.connect(patient1).takeMedication(1);

      block = await ethers.provider.getBlock("latest");
      timestamp = block!.timestamp;

      medications1 = await kimiko.connect(patient1).getMyMedications();
      expect(medications1[0].dosesTaken).to.equal(2);

      // take drug

      time.increaseTo(timestamp + interval * 60 * 60);

      await kimiko.connect(patient1).takeMedication(1);
      
      medications1 = await kimiko.connect(patient1).getMyMedications();
      expect(medications1[0].dosesTaken).to.equal(3);

      // take drug
      block = await ethers.provider.getBlock("latest");
      timestamp = block!.timestamp;

      time.increaseTo(timestamp + interval * 60 * 60);

      await kimiko.connect(patient1).takeMedication(1);
      
      medications1 = await kimiko.connect(patient1).getMyMedications();
      expect(medications1[0].dosesTaken).to.equal(4);

     
    });
  });
});
