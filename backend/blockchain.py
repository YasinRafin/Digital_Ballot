from web3 import Web3
from web3.middleware.geth_poa import geth_poa_middleware

import json
import logging
from config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BlockchainHandler:
    def __init__(self):
        self.w3 = None
        self.contract = None
        self.account = None
        self.connect()
    
    def connect(self):
        """Connect to blockchain network"""
        try:
            self.w3 = Web3(Web3.HTTPProvider(Config.BLOCKCHAIN_URL))
            
            # Add middleware for POA networks (like Ganache)
            self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
            
            if self.w3.is_connected():
                logger.info("Connected to blockchain network")
                
                # Set up account
                if Config.PRIVATE_KEY:
                    self.account = self.w3.eth.account.from_key(Config.PRIVATE_KEY)
                else:
                    # Use first account from Ganache for demo
                    accounts = self.w3.eth.accounts
                    if accounts:
                        self.account = accounts[0]
                
                # Set up contract
                if Config.CONTRACT_ADDRESS:
                    self.contract = self.w3.eth.contract(
                        address=Config.CONTRACT_ADDRESS,
                        abi=Config.CONTRACT_ABI
                    )
                
                return True
            else:
                logger.error("Failed to connect to blockchain")
                return False
                
        except Exception as e:
            logger.error(f"Blockchain connection error: {str(e)}")
            return False
    
    def is_connected(self):
        """Check if connected to blockchain"""
        return self.w3 and self.w3.is_connected()
    
    def get_latest_block(self):
        """Get latest block number"""
        if not self.is_connected():
            return 0
        try:
            return self.w3.eth.block_number
        except Exception as e:
            logger.error(f"Error getting latest block: {str(e)}")
            return 0
    
    def register_voter(self, voter_address, nid, election_id=1):
        """Register a voter"""
        if not self.contract:
            return {"success": False, "error": "Contract not initialized"}
        
        try:
            # Build transaction
            transaction = self.contract.functions.registerVoter(nid, election_id).build_transaction({
                'from': voter_address,
                'gas': 200000,
                'gasPrice': self.w3.to_wei('20', 'gwei'),
                'nonce': self.w3.eth.get_transaction_count(voter_address)
            })
            
            return {
                "success": True,
                "transaction": transaction,
                "message": "Registration transaction prepared"
            }
            
        except Exception as e:
            logger.error(f"Voter registration error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def cast_vote(self, voter_address, election_id, candidate):
        """Cast a vote"""
        if not self.contract:
            return {"success": False, "error": "Contract not initialized"}
        
        try:
            # Build transaction
            transaction = self.contract.functions.castVote(election_id, candidate).build_transaction({
                'from': voter_address,
                'gas': 200000,
                'gasPrice': self.w3.to_wei('20', 'gwei'),
                'nonce': self.w3.eth.get_transaction_count(voter_address)
            })
            
            return {
                "success": True,
                "transaction": transaction,
                "message": "Vote transaction prepared"
            }
            
        except Exception as e:
            logger.error(f"Vote casting error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_election_results(self, election_id=1):
        """Get election results"""
        if not self.contract:
            return {"success": False, "error": "Contract not initialized"}
        
        try:
            # For demo purposes, return mock data if contract call fails
            candidates = ['National Citizen Party', 'Bangladesh Nationalist Party','Bangladesh Jamate Islam' 'Jatiya Party', 'Independent Candidates']
            mock_results = {}
            for candidate in candidates:
                mock_results[candidate] = 0
            
            return {
                "success": True,
                "results": mock_results
            }
            
        except Exception as e:
            logger.error(f"Error getting results: {str(e)}")
            # Return mock data
            candidates = ['National Citizen Party', 'Bangladesh Nationalist Party','Bangladesh Jamate Islam' 'Jatiya Party', 'Independent Candidates']
            mock_results = {}
            for candidate in candidates:
                mock_results[candidate] = 0
            
            return {
                "success": True,
                "results": mock_results
            }
    
    def get_voter_status(self, voter_address):
        """Get voter registration and voting status"""
        if not self.contract:
            return {"success": False, "error": "Contract not initialized"}
        
        try:
            # For demo, return false by default
            return {
                "success": True,
                "registered": False,
                "voted": False
            }
            
        except Exception as e:
            logger.error(f"Error getting voter status: {str(e)}")
            return {
                "success": True,
                "registered": False,
                "voted": False
            }