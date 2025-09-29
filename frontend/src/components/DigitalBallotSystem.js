import React, { useState, useEffect } from 'react';
import { Vote, Users, Shield, CheckCircle, Clock, BarChart3, User, Settings, Lock, Eye, FileText, Database, Wifi, WifiOff } from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000/api';

const DigitalBallotSystem = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [voterRegistered, setVoterRegistered] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [electionStatus, setElectionStatus] = useState('upcoming');
  const [votes, setVotes] = useState({
    'National Citizen Party': 0,
    'Bangladesh Nationalist Party': 0,
    'Bangladesh Jamate Islam': 0,
    'Jatiya Party': 0,
    'Independent Candidates': 0
  });
  const [backendConnected, setBackendConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Blockchain data
  const [blockchainData, setBlockchainData] = useState([
    { blockNumber: 1, hash: '0x1a2b3c...', votes: 0, timestamp: '2025-01-15 10:00:00' },
    { blockNumber: 2, hash: '0x2b3c4d...', votes: 0, timestamp: '2025-01-15 10:05:00' }
  ]);

  const [systemMetrics, setSystemMetrics] = useState({
    totalVoters: 1250000,
    registeredVoters: 1180000,
    votescast: 0,
    activeNodes: 15,
    blockHeight: 2
  });

  // Check backend connection
  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      const data = await response.json();
      setBackendConnected(data.status === 'healthy');
      
      if (data.blockchain_connected) {
        setSystemMetrics(prev => ({
          ...prev,
          blockHeight: data.latest_block || prev.blockHeight
        }));
      }
    } catch (error) {
      setBackendConnected(false);
      console.error('Backend connection failed:', error);
    }
  };

  // Register voter
  const handleVoterRegistration = async () => {
    if (!userAddress || !nidNumber) {
      setError('Please provide both wallet address and NID number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/register-voter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voter_address: userAddress,
          nid: nidNumber
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setVoterRegistered(true);
        setSuccess('Voter registration successful! Transaction ready to sign.');
        setSystemMetrics(prev => ({
          ...prev,
          registeredVoters: prev.registeredVoters + 1
        }));
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('Failed to connect to backend');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cast vote
  const handleVote = async (candidate) => {
    if (!hasVoted && voterRegistered && electionStatus === 'active') {
      setLoading(true);
      setError('');
      
      try {
        const response = await fetch(`${BACKEND_URL}/cast-vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            voter_address: userAddress,
            election_id: 1,
            candidate_name: candidate
          })
        });

        const data = await response.json();
        
        if (data.success) {
          setHasVoted(true);
          setVotes(prev => ({
            ...prev,
            [candidate]: prev[candidate] + 1
          }));
          
          // Add to blockchain simulation
          const newBlock = {
            blockNumber: blockchainData.length + 1,
            hash: `0x${Math.random().toString(16).substr(2, 8)}...`,
            votes: Object.values(votes).reduce((a, b) => a + b, 1),
            timestamp: new Date().toLocaleString()
          };
          
          setBlockchainData(prev => [...prev, newBlock]);
          setSystemMetrics(prev => ({
            ...prev,
            votescast: prev.votescast + 1,
            blockHeight: prev.blockHeight + 1
          }));
          
          setSuccess('Vote cast successfully and recorded on blockchain!');
        } else {
          setError(data.error || 'Vote casting failed');
        }
      } catch (error) {
        setError('Failed to cast vote');
        console.error('Voting error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Load election results
  const loadElectionResults = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/election-results/1`);
      const data = await response.json();
      
      if (data.success) {
        setVotes(data.results);
      }
    } catch (error) {
      console.error('Failed to load results:', error);
    }
  };

  // Check voter status
  const checkVoterStatus = async () => {
    if (!userAddress) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/voter-status/${userAddress}`);
      const data = await response.json();
      
      if (data.success) {
        setVoterRegistered(data.registered);
        setHasVoted(data.voted);
      }
    } catch (error) {
      console.error('Failed to check voter status:', error);
    }
  };

  // Get blockchain info
  const getBlockchainInfo = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/blockchain-info`);
      const data = await response.json();
      
      if (data.success) {
        setSystemMetrics(prev => ({
          ...prev,
          blockHeight: data.info.latest_block,
          activeNodes: data.info.connected ? 15 : 0
        }));
      }
    } catch (error) {
      console.error('Failed to get blockchain info:', error);
    }
  };

  useEffect(() => {
    checkBackendConnection();
    const interval = setInterval(checkBackendConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (backendConnected) {
      loadElectionResults();
      getBlockchainInfo();
    }
  }, [backendConnected]);

  useEffect(() => {
    if (userAddress && backendConnected) {
      checkVoterStatus();
    }
  }, [userAddress, backendConnected]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (electionStatus === 'upcoming') {
        setElectionStatus('active');
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [electionStatus]);

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #fef2f2 100%)',
      padding: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    maxWidth: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '24px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: '0 0 8px 0'
    },
    subtitle: {
      color: '#6b7280',
      margin: 0
    },
    statusBadge: {
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    activeStatus: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    upcomingStatus: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    navigation: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginBottom: '24px',
      overflow: 'hidden'
    },
    navContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      borderBottom: '1px solid #e5e7eb'
    },
    navButton: {
      display: 'flex',
      alignItems: 'center',
      padding: '16px 24px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500',
      gap: '8px',
      transition: 'all 0.2s',
      borderBottom: '2px solid transparent'
    },
    activeNavButton: {
      color: '#2563eb',
      borderBottomColor: '#2563eb'
    },
    inactiveNavButton: {
      color: '#6b7280'
    },
    grid: {
      display: 'grid',
      gap: '24px'
    },
    gridCols2: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
    },
    gridCols3: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
    },
    gridCols4: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
    },
    metricCard: {
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    blueCard: {
      backgroundColor: '#eff6ff'
    },
    greenCard: {
      backgroundColor: '#f0fdf4'
    },
    purpleCard: {
      backgroundColor: '#faf5ff'
    },
    orangeCard: {
      backgroundColor: '#fff7ed'
    },
    redCard: {
      backgroundColor: '#fef2f2'
    },
    metricHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px',
      gap: '8px'
    },
    metricValue: {
      fontSize: '32px',
      fontWeight: 'bold'
    },
    blueText: {
      color: '#2563eb'
    },
    greenText: {
      color: '#16a34a'
    },
    purpleText: {
      color: '#7c3aed'
    },
    orangeText: {
      color: '#ea580c'
    },
    redText: {
      color: '#dc2626'
    },
    alert: {
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid',
      marginBottom: '16px'
    },
    successAlert: {
      backgroundColor: '#f0fdf4',
      borderColor: '#bbf7d0',
      color: '#166534'
    },
    errorAlert: {
      backgroundColor: '#fef2f2',
      borderColor: '#fecaca',
      color: '#991b1b'
    },
    connectedAlert: {
      backgroundColor: '#f0fdf4',
      borderColor: '#bbf7d0'
    },
    disconnectedAlert: {
      backgroundColor: '#fef2f2',
      borderColor: '#fecaca'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '16px'
    },
    inputGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '4px'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    primaryButton: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    disabledButton: {
      opacity: '0.5',
      cursor: 'not-allowed'
    },
    voteButton: {
      padding: '16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      backgroundColor: 'white',
      cursor: 'pointer',
      width: '100%',
      transition: 'all 0.2s',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: 'white',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    tableHeader: {
      backgroundColor: '#f9fafb',
      padding: '12px 16px',
      textAlign: 'left',
      fontWeight: '600',
      borderBottom: '1px solid #e5e7eb'
    },
    tableCell: {
      padding: '12px 16px',
      borderBottom: '1px solid #e5e7eb'
    },
    progressBar: {
      width: '100%',
      backgroundColor: '#e5e7eb',
      borderRadius: '9999px',
      height: '8px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#2563eb',
      borderRadius: '9999px',
      transition: 'width 0.3s ease'
    },
    codeBlock: {
      backgroundColor: '#f3f4f6',
      padding: '12px',
      borderRadius: '6px',
      fontFamily: 'monospace',
      fontSize: '14px',
      lineHeight: '1.4'
    },
    architectureCard: {
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }
  };

  // const ArchitecturalDiagram = () => (
  //   <div style={{...styles.card, background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)'}}>
  //     <h3 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center'}}>System Architecture</h3>
  //     <div style={{...styles.grid, ...styles.gridCols4}}>
  //       <div style={styles.architectureCard}>
  //         <div style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
  //           <User style={{color: '#2563eb', marginRight: '8px'}} size={20} />
  //           <h4 style={{fontWeight: '600', margin: 0}}>User Layer</h4>
  //         </div>
  //         <ul style={{fontSize: '14px', lineHeight: '1.6', paddingLeft: '16px'}}>
  //           <li>Voter Registration</li>
  //           <li>Authentication</li>
  //           <li>Vote Casting</li>
  //           <li>Result Viewing</li>
  //         </ul>
  //       </div>

  //       <div style={styles.architectureCard}>
  //         <div style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
  //           <Eye style={{color: '#16a34a', marginRight: '8px'}} size={20} />
  //           <h4 style={{fontWeight: '600', margin: 0}}>Frontend Layer</h4>
  //         </div>
  //         <ul style={{fontSize: '14px', lineHeight: '1.6', paddingLeft: '16px'}}>
  //           <li>React Application</li>
  //           <li>User Interface</li>
  //           <li>API Integration</li>
  //           <li>Real-time Updates</li>
  //         </ul>
  //       </div>

  //       <div style={styles.architectureCard}>
  //         <div style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
  //           <Settings style={{color: '#7c3aed', marginRight: '8px'}} size={20} />
  //           <h4 style={{fontWeight: '600', margin: 0}}>Backend Layer</h4>
  //         </div>
  //         <ul style={{fontSize: '14px', lineHeight: '1.6', paddingLeft: '16px'}}>
  //           <li>Python Flask API</li>
  //           <li>Web3 Integration</li>
  //           <li>Smart Contract Interface</li>
  //           <li>Data Processing</li>
  //         </ul>
  //       </div>

  //       <div style={styles.architectureCard}>
  //         <div style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
  //           <Database style={{color: '#ea580c', marginRight: '8px'}} size={20} />
  //           <h4 style={{fontWeight: '600', margin: 0}}>Blockchain Layer</h4>
  //         </div>
  //         <ul style={{fontSize: '14px', lineHeight: '1.6', paddingLeft: '16px'}}>
  //           <li>Ethereum/Ganache</li>
  //           <li>Smart Contracts</li>
  //           <li>Immutable Storage</li>
  //           <li>Consensus Mechanism</li>
  //         </ul>
  //       </div>
  //     </div>
  //   </div>
  // );

  // const SmartContractDesign = () => (
  //   <div style={{backgroundColor: '#f9fafb', padding: '24px', borderRadius: '12px'}}>
  //     <h3 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '16px'}}>Smart Contract Architecture</h3>
  //     <div style={{...styles.grid, ...styles.gridCols2}}>
  //       <div style={styles.architectureCard}>
  //         <h4 style={{fontWeight: '600', marginBottom: '12px', color: '#2563eb'}}>VotingSystem.sol</h4>
  //         <div style={styles.codeBlock}>
  //           <div style={{color: '#16a34a'}}>// Main voting contract</div>
  //           <div>contract VotingSystem &#123;</div>
  //           <div style={{marginLeft: '16px'}}>struct Voter &#123;</div>
  //           <div style={{marginLeft: '32px'}}>bool registered;</div>
  //           <div style={{marginLeft: '32px'}}>bool voted;</div>
  //           <div style={{marginLeft: '32px'}}>bytes32 nidHash;</div>
  //           <div style={{marginLeft: '16px'}}>&#125;</div>
  //           <div style={{marginLeft: '16px'}}>mapping(address =&gt; Voter) voters;</div>
  //           <div style={{marginLeft: '16px'}}>mapping(string =&gt; uint256) voteCounts;</div>
  //           <div>&#125;</div>
  //         </div>
  //       </div>
        
  //       <div style={styles.architectureCard}>
  //         <h4 style={{fontWeight: '600', marginBottom: '12px', color: '#16a34a'}}>Key Functions</h4>
  //         <div style={{fontSize: '14px', lineHeight: '1.8'}}>
  //           <div style={{marginBottom: '8px'}}>
  //             <span style={{backgroundColor: '#dbeafe', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace'}}>registerVoter()</span> - Register eligible voters
  //           </div>
  //           <div style={{marginBottom: '8px'}}>
  //             <span style={{backgroundColor: '#dbeafe', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace'}}>castVote()</span> - Submit encrypted vote
  //           </div>
  //           <div style={{marginBottom: '8px'}}>
  //             <span style={{backgroundColor: '#dbeafe', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace'}}>getResults()</span> - Retrieve vote counts
  //           </div>
  //           <div style={{marginBottom: '8px'}}>
  //             <span style={{backgroundColor: '#dbeafe', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace'}}>verifyVoter()</span> - Validate voter eligibility
  //           </div>
  //           <div>
  //             <span style={{backgroundColor: '#dbeafe', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace'}}>createElection()</span> - Create new election
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  const VotingInterface = () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
      {/* Backend Connection Status */}
      <div style={{
        ...styles.alert,
        ...(backendConnected ? styles.connectedAlert : styles.disconnectedAlert)
      }}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          {backendConnected ? (
            <>
              <Wifi style={{color: '#16a34a', marginRight: '8px'}} size={20} />
              <span style={{fontWeight: '600', color: '#166534'}}>Connected to Backend</span>
            </>
          ) : (
            <>
              <WifiOff style={{color: '#dc2626', marginRight: '8px'}} size={20} />
              <span style={{fontWeight: '600', color: '#991b1b'}}>Backend Disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div style={styles.errorAlert}>
          <p style={{margin: 0}}>{error}</p>
        </div>
      )}
      
      {success && (
        <div style={styles.successAlert}>
          <p style={{margin: 0}}>{success}</p>
        </div>
      )}

      {/* User Address Input */}
      <div style={{...styles.card, margin: 0}}>
        <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '12px'}}>Wallet Configuration</h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Wallet Address</label>
            <input
              type="text"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              placeholder="0x..."
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>National ID Number</label>
            <input
              type="text"
              value={nidNumber}
              onChange={(e) => setNidNumber(e.target.value)}
              placeholder="Enter your NID number"
              style={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Voter Registration */}
      {!voterRegistered ? (
        <div style={{...styles.alert, backgroundColor: '#fefbf0', borderColor: '#fed7aa', color: '#92400e'}}>
          <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '12px'}}>Voter Registration</h3>
          <p style={{fontSize: '14px', marginBottom: '16px'}}>Register using your National ID to participate in the election</p>
          <button 
            onClick={handleVoterRegistration}
            disabled={loading || !backendConnected || !userAddress || !nidNumber}
            style={{
              ...styles.button,
              ...styles.primaryButton,
              ...(loading || !backendConnected || !userAddress || !nidNumber ? styles.disabledButton : {})
            }}
          >
            {loading ? 'Registering...' : 'Register with NID'}
          </button>
        </div>
      ) : (
        <div style={styles.successAlert}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <CheckCircle style={{color: '#16a34a', marginRight: '8px'}} size={20} />
            <span style={{fontWeight: '600'}}>Voter Registration Verified</span>
          </div>
        </div>
      )}

      {/* Voting Interface */}
      {voterRegistered && !hasVoted && backendConnected && (
        <div style={{...styles.card, margin: 0}}>
          <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '16px'}}>Cast Your Vote</h3>
          <div style={{...styles.grid, ...styles.gridCols2}}>
            {Object.keys(votes).map((candidate) => (
              <button
                key={candidate}
                onClick={() => handleVote(candidate)}
                disabled={loading || electionStatus !== 'active'}
                style={{
                  ...styles.voteButton,
                  ...(loading || electionStatus !== 'active' ? styles.disabledButton : {}),
                  ':hover': {
                    backgroundColor: '#eff6ff',
                    borderColor: '#3b82f6'
                  }
                }}
                onMouseEnter={(e) => {
                  if (!loading && electionStatus === 'active') {
                    e.target.style.backgroundColor = '#eff6ff';
                    e.target.style.borderColor = '#3b82f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && electionStatus === 'active') {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.borderColor = '#d1d5db';
                  }
                }}
              >
                <span style={{fontWeight: '500'}}>{candidate}</span>
                <Vote size={20} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Vote Confirmation */}
      {hasVoted && (
        <div style={styles.successAlert}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <CheckCircle style={{color: '#16a34a', marginRight: '8px'}} size={20} />
            <span style={{fontWeight: '600'}}>Vote Successfully Cast and Recorded on Blockchain</span>
          </div>
        </div>
      )}
    </div>
  );

  const BlockchainExplorer = () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      <h3 style={{fontSize: '24px', fontWeight: 'bold'}}>Blockchain Explorer</h3>
      <div style={{overflowX: 'auto'}}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Block #</th>
              <th style={styles.tableHeader}>Hash</th>
              <th style={styles.tableHeader}>Votes</th>
              <th style={styles.tableHeader}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {blockchainData.map((block) => (
              <tr key={block.blockNumber}>
                <td style={styles.tableCell}>{block.blockNumber}</td>
                <td style={{...styles.tableCell, fontFamily: 'monospace', fontSize: '14px'}}>{block.hash}</td>
                <td style={styles.tableCell}>{block.votes}</td>
                <td style={{...styles.tableCell, fontSize: '14px'}}>{block.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const Results = () => {
    const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
    
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'}}>
          <h3 style={{fontSize: '24px', fontWeight: 'bold'}}>Election Results</h3>
          <button
            onClick={loadElectionResults}
            disabled={!backendConnected}
            style={{
              ...styles.button,
              ...styles.primaryButton,
              ...(!backendConnected ? styles.disabledButton : {})
            }}
          >
            Refresh Results
          </button>
        </div>
        <div style={styles.card}>
          {Object.entries(votes).map(([candidate, count]) => {
            const percentage = totalVotes > 0 ? (count / totalVotes * 100).toFixed(1) : 0;
            return (
              <div key={candidate} style={{marginBottom: '16px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                  <span style={{fontWeight: '500'}}>{candidate}</span>
                  <span style={{fontSize: '14px', fontWeight: '600'}}>{count} votes ({percentage}%)</span>
                </div>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${percentage}%`
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const SystemMetrics = () => (
    <div style={{...styles.grid, ...styles.gridCols3}}>
      <div style={{...styles.metricCard, ...styles.blueCard}}>
        <div style={styles.metricHeader}>
          <Users style={{color: '#2563eb'}} size={20} />
          <span style={{fontWeight: '600'}}>Total Voters</span>
        </div>
        <div style={{...styles.metricValue, ...styles.blueText}}>
          {systemMetrics.totalVoters.toLocaleString()}
        </div>
      </div>
      
      <div style={{...styles.metricCard, ...styles.greenCard}}>
        <div style={styles.metricHeader}>
          <CheckCircle style={{color: '#16a34a'}} size={20} />
          <span style={{fontWeight: '600'}}>Registered</span>
        </div>
        <div style={{...styles.metricValue, ...styles.greenText}}>
          {systemMetrics.registeredVoters.toLocaleString()}
        </div>
      </div>
      
      <div style={{...styles.metricCard, ...styles.purpleCard}}>
        <div style={styles.metricHeader}>
          <Vote style={{color: '#7c3aed'}} size={20} />
          <span style={{fontWeight: '600'}}>Votes Cast</span>
        </div>
        <div style={{...styles.metricValue, ...styles.purpleText}}>
          {systemMetrics.votescast.toLocaleString()}
        </div>
      </div>
      
      <div style={{...styles.metricCard, ...styles.orangeCard}}>
        <div style={styles.metricHeader}>
          <Database style={{color: '#ea580c'}} size={20} />
          <span style={{fontWeight: '600'}}>Block Height</span>
        </div>
        <div style={{...styles.metricValue, ...styles.orangeText}}>
          {systemMetrics.blockHeight}
        </div>
      </div>
      
      <div style={{
        ...styles.metricCard,
        ...(backendConnected ? styles.greenCard : styles.redCard)
      }}>
        <div style={styles.metricHeader}>
          <Shield style={{color: backendConnected ? '#16a34a' : '#dc2626'}} size={20} />
          <span style={{fontWeight: '600'}}>Network Status</span>
        </div>
        <div style={{
          ...styles.metricValue,
          ...(backendConnected ? styles.greenText : styles.redText)
        }}>
          {backendConnected ? 'Online' : 'Offline'}
        </div>
      </div>
    </div>
  );

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Eye },
    // { id: 'architecture', label: 'Architecture', icon: Settings },
    // { id: 'contract', label: 'Smart Contract', icon: FileText },
    { id: 'vote', label: 'Vote', icon: Vote },
    { id: 'blockchain', label: 'Blockchain', icon: Database },
    { id: 'results', label: 'Results', icon: BarChart3 }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={styles.card}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>Digital Ballot System</h1>
              <p style={styles.subtitle}>Blockchain-Based Secure Voting for Bangladesh</p>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap'}}>
              <div style={{
                ...styles.statusBadge,
                ...(electionStatus === 'active' ? styles.activeStatus : styles.upcomingStatus)
              }}>
                {electionStatus === 'active' ? (
                  <>
                    <CheckCircle size={16} />
                    Election Active
                  </>
                ) : electionStatus === 'upcoming' ? (
                  <>
                    <Clock size={16} />
                    Election Starting Soon
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Election Ended
                  </>
                )}
              </div>
              <Shield style={{color: '#16a34a'}} size={24} />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={styles.navigation}>
          <div style={styles.navContainer}>
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  ...styles.navButton,
                  ...(activeTab === id ? styles.activeNavButton : styles.inactiveNavButton)
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== id) {
                    e.target.style.color = '#2563eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== id) {
                    e.target.style.color = '#6b7280';
                  }
                }}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={styles.card}>
          {activeTab === 'overview' && (
            <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
              <div>
                <h2 style={{fontSize: '28px', fontWeight: 'bold', marginBottom: '16px'}}>System Overview</h2>
                <p style={{color: '#4b5563', marginBottom: '16px', lineHeight: '1.6'}}>
                  The Digital Ballot System leverages blockchain technology to provide a secure, 
                  transparent, and tamper-proof voting system for Bangladesh. Built on Ethereum 
                  with smart contracts ensuring vote integrity and voter privacy.
                </p>
              </div>
              <SystemMetrics />
              <div style={{...styles.grid, ...styles.gridCols3}}>
                <div style={{...styles.metricCard, ...styles.blueCard}}>
                  <Lock style={{color: '#2563eb', marginBottom: '12px'}} size={32} />
                  <h3 style={{fontWeight: '600', marginBottom: '8px'}}>Security First</h3>
                  <p style={{fontSize: '14px', color: '#6b7280', lineHeight: '1.5'}}>
                    End-to-end encryption with blockchain immutability ensures vote security
                  </p>
                </div>
                <div style={{...styles.metricCard, ...styles.greenCard}}>
                  <Eye style={{color: '#16a34a', marginBottom: '12px'}} size={32} />
                  <h3 style={{fontWeight: '600', marginBottom: '8px'}}>Transparency</h3>
                  <p style={{fontSize: '14px', color: '#6b7280', lineHeight: '1.5'}}>
                    Real-time vote verification and public blockchain ledger
                  </p>
                </div>
                <div style={{...styles.metricCard, ...styles.purpleCard}}>
                  <Users style={{color: '#7c3aed', marginBottom: '12px'}} size={32} />
                  <h3 style={{fontWeight: '600', marginBottom: '8px'}}>Accessibility</h3>
                  <p style={{fontSize: '14px', color: '#6b7280', lineHeight: '1.5'}}>
                    Easy-to-use interface supporting multiple languages including Bengali
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* {activeTab === 'architecture' && <ArchitecturalDiagram />}
          {activeTab === 'contract' && <SmartContractDesign />} */}
          {activeTab === 'vote' && <VotingInterface />}
          {activeTab === 'blockchain' && <BlockchainExplorer />}
          {activeTab === 'results' && <Results />}
        </div>
      </div>
    </div>
  );
};

export default DigitalBallotSystem;