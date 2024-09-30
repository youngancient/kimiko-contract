// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "./Utils.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

interface IERC20 {
    function transfer(address to, uint value) external returns (bool);
}

contract Kimiko {
    enum Role {
        Novice,
        Active,
        Consistent,
        TopGun,
        Champ
    }

    struct Doctor {
        uint256 id;
        string name;
        string specialty;
    }

    uint256 public noOfDoctors;
    uint256 public noOfPatients;

    struct Patient {
        uint256 id;
        string name;
        address doctor;
        uint256 adherenceScore; // Track how well they adhere to the schedule
        uint256 noOfMedications;
        Medication[] medications;
        Role role;
        address beneficiary;
        uint256 claimedRewards;
    }

    struct Medication {
        uint256 id;
        string name;
        uint256 dosage;
        uint256 interval;
        uint256 duration;
        bool isCompleted; // set to true when patients completes the medication all
        bool isEnded; // set to true when block.timestamp reaches duration
        uint256 startTime;
        uint256 lastTimeTaken; // used to track if the patient meets the interval
        uint256 totalDoses;
        uint256 dosesTaken;
    }

    mapping(address => Doctor) addressToDoctor;

    mapping(address => address[]) doctorToPatientAddress;

    // mapping (address => mapping(uint256 => Medication[])) doctorToPatientIdToMedications;

    mapping(address => Patient) addressToPatient;

    mapping(address => uint256) patientToReward; // every medication completed earns 10 KMK

    address tokenAddress;

    constructor(address _tokenAddress) {
        tokenAddress = _tokenAddress;
    }

    //@dev: private function
    function _sanityCheck(address _user) private pure {
        if (_user == address(0)) {
            revert Errors.ZeroAddressNotAllowed();
        }
    }

    function _zeroValueCheck(uint256 _amount) private pure {
        if (_amount == 0) {
            revert Errors.ZeroValueNotAllowed();
        }
    }

    function _isDoctor(address _user) private view returns (bool) {
        _sanityCheck(_user);
        return addressToDoctor[_user].id != 0;
    }

    function _onlyDoctor(address _user) private view {
        if (!_isDoctor(_user)) {
            revert Errors.NotADoctor();
        }
    }

    function _isPatient(address _user) private view returns (bool) {
        _sanityCheck(_user);
        return addressToPatient[_user].id != 0;
    }

    function _onlyPatient(address _user) private view {
        if (!_isPatient(_user)) {
            revert Errors.NotAPatient();
        }
    }

    function getTokenAddress() external view returns (address) {
        return tokenAddress;
    }

    // @dev: doctor external functions
    function addDoctor(string memory _name, string memory _specialty) external {
        _sanityCheck(msg.sender);
        uint256 _id = noOfDoctors + 1;
        if (_isDoctor(msg.sender)) {
            revert Errors.AccountAlreadyExists();
        }
        addressToDoctor[msg.sender] = Doctor(_id, _name, _specialty);
        noOfDoctors++;

        emit Events.DoctorAddedSuccessfully(_id, _name, msg.sender);
    }

    //@dev: for doctors

    function addPatient(string memory _name, address _address) external {
        _sanityCheck(_address);
        _onlyDoctor(msg.sender);
        uint256 _id = noOfPatients + 1;

        if (_isPatient(msg.sender)) {
            revert Errors.NotAPatient();
        }

        Patient storage patient = addressToPatient[_address];
        patient.id = _id;
        patient.name = _name;
        patient.doctor = msg.sender;
        patient.role = Role.Novice;
        patient.beneficiary = _address;

        addressToPatient[_address] = patient;
        doctorToPatientAddress[msg.sender].push(_address);
        noOfPatients++;
        emit Events.PatientAddedSuccessfully(_id, _name, _address);
    }

    function addPatientMedication(
        address _address,
        string memory _name,
        uint256 _dosage,
        uint256 _interval, // hourly; must be a factor of 24
        uint256 _duration // in days
    ) external {
        _onlyDoctor(msg.sender);
        if (!_isPatient(_address)) {
            revert Errors.NotAPatient();
        }
        uint256 _id = addressToPatient[_address].noOfMedications + 1;
        uint256 _totalDoses = (_duration * 24) / _interval;

        Medication memory medication = Medication(
            _id,
            _name,
            _dosage,
            _interval,
            _duration,
            false,
            false,
            block.timestamp,
            0,
            _totalDoses,
            0
        );
        addressToPatient[_address].medications.push(medication);
        addressToPatient[_address].noOfMedications++;

        emit Events.PatientMedicationAdded(_id, _name, _duration);
    }

    function getAllPatients() external view returns (address[] memory) {
        _onlyDoctor(msg.sender);
        return doctorToPatientAddress[msg.sender];
    }

    function getPatientDetails(
        address _address
    ) external view returns (Patient memory) {
        _sanityCheck(msg.sender);
        _sanityCheck(_address);
        _onlyDoctor(msg.sender);

        if (!_isPatient(_address)) {
            revert Errors.NotAPatient();
        }

        return addressToPatient[_address];
    }

    function getPatientMedications(
        address _address
    ) external view returns (Medication[] memory) {
        _sanityCheck(msg.sender);
        _onlyDoctor(msg.sender);

        if (!_isPatient(_address)) {
            revert Errors.NotAPatient();
        }
        return addressToPatient[msg.sender].medications;
    }

    function getDoctorDetails() external view returns (Doctor memory) {
        _sanityCheck(msg.sender);
        _onlyDoctor(msg.sender);

        return addressToDoctor[msg.sender];
    }

    // @dev: only patient functions

    function getMyMedications() external view returns (Medication[] memory) {
        _sanityCheck(msg.sender);
        // should
        _onlyPatient(msg.sender);

        return addressToPatient[msg.sender].medications;
    }

    function getPatientDetails() external view returns (Patient memory) {
        _sanityCheck(msg.sender);
        _onlyPatient(msg.sender);
        return addressToPatient[msg.sender];
    }

    function setBeneficiary(address _address) external {
        _sanityCheck(msg.sender);
        _sanityCheck(_address);

        _onlyPatient(msg.sender);
        addressToPatient[msg.sender].beneficiary = _address;

        emit Events.BeneficiaryAdded(_address);
    }

    function takeMedication(uint256 _medicationId) external {
        _sanityCheck(msg.sender);
        _onlyPatient(msg.sender);
        Patient storage patient = addressToPatient[msg.sender];

        if (_medicationId == 0 || _medicationId > patient.noOfMedications) {
            revert Errors.InvalidMedicationID();
        }
        // Get the medication from the patient's medications array
        Medication storage medication = patient.medications[_medicationId - 1];

        if (medication.isCompleted) {
            revert Errors.MedicationAlreadyCompleted();
        }
        if (medication.isEnded) {
            revert Errors.MedicationDurationEnded();
        }
        uint256 currentTime = block.timestamp;

        // Check if the interval has passed since the last time the medication was taken
        if (
            currentTime <
            medication.lastTimeTaken + (medication.interval * 1 hours)
        ) {
            revert Errors.MedicationIntervalNotMet(); // Custom error for interval not being met
        }

        if (
            currentTime >=
            (medication.startTime + (medication.duration * 1 days))
        ) {
            medication.isEnded = true; // Mark as ended
            revert Errors.MedicationDurationEnded();
        }

        medication.lastTimeTaken = currentTime;
        medication.dosesTaken++;

        patient.adherenceScore += 2; // Increase adherence score per dose
        uint256 score = patient.adherenceScore;

        if (score >= 200) {
            patient.role = Role.Champ;
        } else if (score >= 128) {
            patient.role = Role.TopGun;
        } else if (score >= 64) {
            patient.role = Role.Consistent;
        } else if (score >= 32) {
            patient.role = Role.Active;
        }

        // Check if all doses have been taken
        if (medication.dosesTaken >= medication.totalDoses) {
            medication.isCompleted = true; // Mark the medication as completed
            patientToReward[msg.sender] += 10; // Award 10 KMK for completing medication

            emit Events.MedicationCompleted(
                _medicationId,
                msg.sender,
                currentTime
            );
        }

        emit Events.MedicationTaken(_medicationId, msg.sender, currentTime);
    }

    // when a patient earns as much adherence points, they would be upgraded to new roles
    // only the Champ can mint NFT

    function claimReward() external {
        _sanityCheck(msg.sender);
        _onlyPatient(msg.sender);

        uint256 _rewardBal = patientToReward[msg.sender];

        if (_rewardBal <= 0) {
            revert Errors.ZeroRewardFound();
        }

        Patient memory patient = addressToPatient[msg.sender];

        addressToPatient[msg.sender].claimedRewards = _rewardBal;

        patientToReward[msg.sender] = 0;

        if (!IERC20(tokenAddress).transfer(patient.beneficiary, _rewardBal)) {
            revert Errors.TransferFailed();
        }

        emit Events.RewardSent(patient.beneficiary, _rewardBal);
    }

    function getPatientReward() external view returns (uint256, uint256) {
        _sanityCheck(msg.sender);
        _onlyPatient(msg.sender);

        uint256 currentRewardBal = patientToReward[msg.sender];
        uint256 claimedReward = addressToPatient[msg.sender].claimedRewards;

        return (currentRewardBal, claimedReward);
    }
}
