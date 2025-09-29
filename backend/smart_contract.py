import hashlib
import json
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class SmartContractInterface:
    def __init__(self, blockchain_handler):
        self.blockchain = blockchain_handler
        self.elections = {}
        self.voters = {}
        self.votes = {}
        
        # Initialize demo election
        self.create_demo_election()
    
    def create_demo_election(self):
        """Create a demo election for testing"""
        self.elections[1] = {
            "id": 1,
            "name": "Bangladesh General Election 2025",
            "candidates": [
                "National Citizen Party",
                "Bangladesh Nationalist Party",
                "Bangladesh Jamate Islam",
                "Jatiya Party",
                "Independent Candidates"
            ],
            "active": True,
            "start_time": datetime.now(),
            "votes": {
                "National Citizen Party": 0,
                "Bangladesh Nationalist Party": 0,
                "Bangladesh Jamate Islam":0,
                "Jatiya Party": 0,
                "Independent Candidates": 0
            }
        }
    
    def hash_nid(self, nid):
        """Hash NID for privacy"""
        return hashlib.sha256(nid.encode()).hexdigest()
    
    def register_voter(self, voter_address, nid, election_id=1):
        """Register a voter"""
        try:
            # Check if voter already registered
            if voter_address in self.voters:
                return {"success": False, "error": "Voter already registered"}
            
            # Check if NID already used
            nid_hash = self.hash_nid(nid)
            for voter_data in self.voters.values():
                if voter_data.get("nid_hash") == nid_hash:
                    return {"success": False, "error": "NID already used"}
            
            # Register voter
            self.voters[voter_address] = {
                "nid_hash": nid_hash,
                "election_id": election_id,
                "registered": True,
                "voted": False,
                "registration_time": datetime.now()
            }
            
            logger.info(f"Voter {voter_address} registered successfully")
            return {"success": True, "message": "Voter registered successfully"}
            
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def cast_vote(self, voter_address, election_id, candidate):
        """Cast a vote"""
        try:
            # Check if voter is registered
            if voter_address not in self.voters:
                return {"success": False, "error": "Voter not registered"}
            
            voter = self.voters[voter_address]
            
            # Check if already voted
            if voter["voted"]:
                return {"success": False, "error": "Already voted"}
            
            # Check election exists and is active
            if election_id not in self.elections:
                return {"success": False, "error": "Election not found"}
            
            election = self.elections[election_id]
            if not election["active"]:
                return {"success": False, "error": "Election not active"}
            
            # Check candidate exists
            if candidate not in election["candidates"]:
                return {"success": False, "error": "Invalid candidate"}
            
            # Cast vote
            election["votes"][candidate] += 1
            voter["voted"] = True
            voter["vote_time"] = datetime.now()
            
            # Store vote record (for audit)
            vote_id = f"{voter_address}_{election_id}_{datetime.now().timestamp()}"
            self.votes[vote_id] = {
                "voter_address": voter_address,
                "election_id": election_id,
                "candidate": candidate,
                "timestamp": datetime.now()
            }
            
            logger.info(f"Vote cast by {voter_address} for {candidate}")
            return {"success": True, "message": "Vote cast successfully"}
            
        except Exception as e:
            logger.error(f"Voting error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_election_results(self, election_id=1):
        """Get election results"""
        try:
            if election_id not in self.elections:
                return {"success": False, "error": "Election not found"}
            
            election = self.elections[election_id]
            return {
                "success": True,
                "results": election["votes"],
                "total_votes": sum(election["votes"].values())
            }
            
        except Exception as e:
            logger.error(f"Error getting results: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_voter_status(self, voter_address):
        """Get voter status"""
        try:
            if voter_address not in self.voters:
                return {
                    "success": True,
                    "registered": False,
                    "voted": False
                }
            
            voter = self.voters[voter_address]
            return {
                "success": True,
                "registered": voter["registered"],
                "voted": voter["voted"]
            }
            
        except Exception as e:
            logger.error(f"Error getting voter status: {str(e)}")
            return {"success": False, "error": str(e)}