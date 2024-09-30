// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library Errors {
    error ZeroAddressNotAllowed();
    error ZeroValueNotAllowed();
    error NotAPatient();
    error NotADoctor();
    error AccountAlreadyExists();
    error InvalidMedicationID();
    error MedicationAlreadyCompleted();
    error MedicationDurationEnded();
    error IntervalNotMet();
    error TransferFailed();
    error ZeroRewardFound();
}

library Events {
    event DoctorAddedSuccessfully(
        uint256 indexed _id,
        string indexed _name,
        address indexed _address
    );
    event PatientAddedSuccessfully(
        uint256 indexed _id,
        string indexed _name,
        address indexed _address
    );
    event PatientMedicationAdded(
        uint256 indexed _id,
        string indexed _name,
        uint256 indexed _duration
    );
    event BeneficiaryAdded(address indexed _beneficiary);
    event RewardSent(address indexed _beneficiary, uint256 indexed _amount);
    event MedicationTaken(
        uint256 indexed _medicationId,
        address indexed _patient,
        uint256 indexed _time
    );
    event MedicationCompleted(
        uint256 indexed _medicationId,
        address indexed _patient,
        uint256 indexed _completionTime
    );
}
