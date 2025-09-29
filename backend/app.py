from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime

from config import Config
from blockchain import BlockchainHandler
from smart_contract import SmartContractInterface

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Initialize blockchain components
blockchain_handler = BlockchainHandler()
smart_contract = SmartContractInterface(blockchain_handler)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "blockchain_connected": blockchain_handler.is_connected(),
        "latest_block": blockchain_handler.get_latest_block()
    })

@app.route('/api/register-voter', methods=['POST'])
def register_voter():
    """Register a new voter"""
    try:
        data = request.get_json()
        voter_address = data.get('voter_address')
        nid = data.get('nid')
        election_id = data.get('election_id', 1)
        
        if not voter_address or not nid:
            return jsonify({
                "success": False,
                "error": "Voter address and NID are required"
            }), 400
        
        # Register voter in smart contract
        result = smart_contract.register_voter(voter_address, nid, election_id)
        
        if result["success"]:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Registration endpoint error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/api/cast-vote', methods=['POST'])
def cast_vote():
    """Cast a vote"""
    try:
        data = request.get_json()
        voter_address = data.get('voter_address')
        election_id = data.get('election_id', 1)
        candidate_name = data.get('candidate_name')
        
        if not voter_address or not candidate_name:
            return jsonify({
                "success": False,
                "error": "Voter address and candidate name are required"
            }), 400
        
        # Cast vote in smart contract
        result = smart_contract.cast_vote(voter_address, election_id, candidate_name)
        
        if result["success"]:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Voting endpoint error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/api/election-results/<int:election_id>', methods=['GET'])
def get_election_results(election_id):
    """Get election results"""
    try:
        result = smart_contract.get_election_results(election_id)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Results endpoint error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/api/voter-status/<voter_address>', methods=['GET'])
def get_voter_status(voter_address):
    """Get voter registration and voting status"""
    try:
        result = smart_contract.get_voter_status(voter_address)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Voter status endpoint error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/api/blockchain-info', methods=['GET'])
def get_blockchain_info():
    """Get blockchain information"""
    try:
        return jsonify({
            "success": True,
            "info": {
                "connected": blockchain_handler.is_connected(),
                "latest_block": blockchain_handler.get_latest_block(),
                "network_url": Config.BLOCKCHAIN_URL
            }
        })
        
    except Exception as e:
        logger.error(f"Blockchain info endpoint error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500

if __name__ == '__main__':
    logger.info("Starting Digital Ballot System Backend...")
    logger.info(f"Blockchain URL: {Config.BLOCKCHAIN_URL}")
    logger.info(f"Blockchain Connected: {blockchain_handler.is_connected()}")
    
    app.run(host='0.0.0.0', port=5000, debug=Config.DEBUG)