# Complete Installation and Setup Instructions
## Prerequisites
1. Node.js (v16 or higher)
  - Download from: https://nodejs.org/
  - Verify installation: node --version and npm --version


2. Python (v3.8 or higher)
  - Download from: https://python.org/
  - Verify installation: python --version or python3 --version


3. Git (optional but recommended)
  - Download from: https://git-scm.com/


4. Ganache (for local blockchain)
  - Download Ganache GUI from: https://trufflesuite.com/ganache/
  - Or install Ganache CLI: npm install -g ganache-cli

## Setup Instructions
1. Clone the repository
   ```
    git clone https://github.com/YasinRafin/Digital_Ballot.git
    cd DigitalBallot
    code .
   ```
2. Setup Backend
   
   Environment Configuration(.env)
   ```
    # Blockchain Configuration
    BLOCKCHAIN_URL=http://127.0.0.1:7545
    CONTRACT_ADDRESS=
    PRIVATE_KEY=
    
    # Flask Configuration
    SECRET_KEY=your-secret-key-here
    DEBUG=True
   ```
   ```
     # Navigate to backend directory
      cd backend

      # Create virtual environment
      python -m venv venv
      
      # Activate virtual environment
      # On Windows:
      venv\Scripts\activate
      # On macOS/Linux:
      source venv/bin/activate
      
      # Create requirements.txt file (copy content from above)
      # Then install dependencies
      pip install -r requirements.txt
      
      # Create all Python files (app.py, blockchain.py, smart_contract.py, config.py)
      # Copy the code from the sections above into respective files
      
      # Create .env file in backend directory
      touch .env
      # Add the environment variables as shown above
   ```
  3. Setup Frontend
      ```
      # Navigate to frontend directory (from project root)
      cd frontend
      
      # Create React app
      npm install
      ```
  4. Setup Ganache(Local Blockchain)

     1. Using Ganache GUI:

         - Open Ganache application
         - Click "New Workspace"
         - Choose "Ethereum"
         - Set RPC Server to HTTP://127.0.0.1:7545
         - Set Network ID to 5777
         - Click "Save Workspace"
      
    
     2. Using Ganache CLI:
          ```
          ganache-cli --host 0.0.0.0 --port 7545 --networkId 5777
          ```
  5. Running the Application
       1. Start Ganache(If not already running)
       2. Start Backend Server:
            ```
             cd backend
             # Activate virtual environment if not active
             source venv/bin/activate  # On macOS/Linux
             # or
             venv\Scripts\activate     # On Windows
             
             # Run the Flask server
             python app.py
            ```
      3. Start Frontend Development Server:
           ```
            cd frontend
            npm start
          ```
  6. Testing the Application

     1. Open your browser and go to http://localhost:3000
     2. Check Backend Connection:     
         - You should see "Connected to Backend" status in green
         - If red, check that backend server is running on port 5000
      
     3. Test Voter Registration:
          - Enter a wallet address (copy from Ganache accounts)
          - Enter a sample NID number (e.g., "1234567890123")
          - Click "Register with NID"
      
      
     4. Test Voting:
      
          - After registration, the voting interface will appear
          - Click on any candidate to cast your vote
          - Vote will be recorded and results updated



