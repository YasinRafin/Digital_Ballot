import os
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DEBUG = True
    
    # Blockchain Configuration
    BLOCKCHAIN_URL = os.environ.get('BLOCKCHAIN_URL') or 'http://127.0.0.1:7545'  # Ganache default
    CONTRACT_ADDRESS = os.environ.get('CONTRACT_ADDRESS') or None
    PRIVATE_KEY = os.environ.get('PRIVATE_KEY') or None
    
    # Contract ABI (simplified for demo)
    CONTRACT_ABI = [
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": False,
            "inputs": [
                {"indexed": False, "internalType": "uint256", "name": "electionId", "type": "uint256"},
                {"indexed": False, "internalType": "string", "name": "name", "type": "string"}
            ],
            "name": "ElectionCreated",
            "type": "event"
        },
        {
            "anonymous": False,
            "inputs": [
                {"indexed": True, "internalType": "address", "name": "voter", "type": "address"},
                {"indexed": False, "internalType": "uint256", "name": "electionId", "type": "uint256"},
                {"indexed": False, "internalType": "string", "name": "candidate", "type": "string"}
            ],
            "name": "VoteCast",
            "type": "event"
        },
        {
            "anonymous": False,
            "inputs": [
                {"indexed": True, "internalType": "address", "name": "voter", "type": "address"},
                {"indexed": False, "internalType": "uint256", "name": "electionId", "type": "uint256"}
            ],
            "name": "VoterRegistered",
            "type": "event"
        },
        {
            "inputs": [{"internalType": "uint256", "name": "_electionId", "type": "uint256"}, {"internalType": "string", "name": "_candidate", "type": "string"}],
            "name": "castVote",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "string", "name": "_name", "type": "string"}, {"internalType": "string[]", "name": "_candidates", "type": "string[]"}, {"internalType": "uint256", "name": "_duration", "type": "uint256"}],
            "name": "createElection",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "uint256", "name": "_electionId", "type": "uint256"}],
            "name": "getElectionResults",
            "outputs": [{"internalType": "string[]", "name": "candidates", "type": "string[]"}, {"internalType": "uint256[]", "name": "voteCounts", "type": "uint256[]"}, {"internalType": "uint256", "name": "totalVotes", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "_voter", "type": "address"}],
            "name": "getVoterStatus",
            "outputs": [{"internalType": "bool", "name": "registered", "type": "bool"}, {"internalType": "bool", "name": "voted", "type": "bool"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "string", "name": "_nid", "type": "string"}, {"internalType": "uint256", "name": "_electionId", "type": "uint256"}],
            "name": "registerVoter",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]