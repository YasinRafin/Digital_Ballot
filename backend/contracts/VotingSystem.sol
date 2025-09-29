// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    struct Voter {
        bool registered;
        bool voted;
        bytes32 nidHash;
        uint256 electionId;
    }
    
    struct Election {
        string name;
        bool active;
        uint256 startTime;
        uint256 endTime;
        string[] candidates;
        mapping(string => uint256) voteCounts;
        uint256 totalVotes;
    }
    
    mapping(address => Voter) public voters;
    mapping(uint256 => Election) public elections;
    mapping(bytes32 => bool) private usedNIDs;
    
    uint256 public electionCount;
    address public admin;
    
    event VoterRegistered(address indexed voter, uint256 electionId);
    event VoteCast(address indexed voter, uint256 electionId, string candidate);
    event ElectionCreated(uint256 electionId, string name);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyRegistered() {
        require(voters[msg.sender].registered, "Voter not registered");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    function createElection(
        string memory _name,
        string[] memory _candidates,
        uint256 _duration
    ) public onlyAdmin returns (uint256) {
        electionCount++;
        Election storage newElection = elections[electionCount];
        newElection.name = _name;
        newElection.active = true;
        newElection.startTime = block.timestamp;
        newElection.endTime = block.timestamp + _duration;
        newElection.candidates = _candidates;
        newElection.totalVotes = 0;
        
        emit ElectionCreated(electionCount, _name);
        return electionCount;
    }
    
    function registerVoter(string memory _nid, uint256 _electionId) public {
        require(!voters[msg.sender].registered, "Voter already registered");
        require(_electionId <= electionCount && _electionId > 0, "Invalid election ID");
        
        bytes32 nidHash = keccak256(abi.encodePacked(_nid));
        require(!usedNIDs[nidHash], "NID already used");
        
        voters[msg.sender] = Voter({
            registered: true,
            voted: false,
            nidHash: nidHash,
            electionId: _electionId
        });
        
        usedNIDs[nidHash] = true;
        
        emit VoterRegistered(msg.sender, _electionId);
    }
    
    function castVote(uint256 _electionId, string memory _candidate) public onlyRegistered {
        require(!voters[msg.sender].voted, "Already voted");
        require(_electionId == voters[msg.sender].electionId, "Wrong election");
        require(elections[_electionId].active, "Election not active");
        require(block.timestamp <= elections[_electionId].endTime, "Election ended");
        
        // Verify candidate exists
        bool validCandidate = false;
        for (uint i = 0; i < elections[_electionId].candidates.length; i++) {
            if (keccak256(abi.encodePacked(elections[_electionId].candidates[i])) == 
                keccak256(abi.encodePacked(_candidate))) {
                validCandidate = true;
                break;
            }
        }
        require(validCandidate, "Invalid candidate");
        
        voters[msg.sender].voted = true;
        elections[_electionId].voteCounts[_candidate]++;
        elections[_electionId].totalVotes++;
        
        emit VoteCast(msg.sender, _electionId, _candidate);
    }
    
    function getElectionResults(uint256 _electionId) public view returns (
        string[] memory candidates,
        uint256[] memory voteCounts,
        uint256 totalVotes
    ) {
        require(_electionId <= electionCount && _electionId > 0, "Invalid election ID");
        
        Election storage election = elections[_electionId];
        candidates = election.candidates;
        voteCounts = new uint256[](candidates.length);
        
        for (uint i = 0; i < candidates.length; i++) {
            voteCounts[i] = election.voteCounts[candidates[i]];
        }
        
        totalVotes = election.totalVotes;
    }
    
    function getVoterStatus(address _voter) public view returns (bool registered, bool voted) {
        return (voters[_voter].registered, voters[_voter].voted);
    }
    
    function endElection(uint256 _electionId) public onlyAdmin {
        require(_electionId <= electionCount && _electionId > 0, "Invalid election ID");
        elections[_electionId].active = false;
    }
}