import { useState, useEffect } from 'react';
import './App.css';
import WorldMap from './components/WorldMap';
import ShipmentTracker from './components/ShipmentTracker';
import DemandForecasting from './components/DemandForecasting';
import RiskManagement from './components/RiskManagement';
import SupervisorPanel from './components/SupervisorPanel';
import { api, ProposedAction } from './services/api';

function App() {
  const [pendingActions, setPendingActions] = useState<ProposedAction[]>([]);
  const [agentResponse, setAgentResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPendingActions();
    // Poll for pending actions every 5 seconds
    const interval = setInterval(loadPendingActions, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadPendingActions = async () => {
    try {
      const actions = await api.getPendingActions();
      setPendingActions(actions);
    } catch (error) {
      console.error('Failed to load pending actions:', error);
    }
  };

  const handleDisruptionReport = async (issue: string) => {
    setLoading(true);
    try {
      const response = await api.reportDisruption(issue);
      setAgentResponse(response);
      // Reload pending actions after reporting disruption
      setTimeout(loadPendingActions, 1000);
    } catch (error) {
      console.error('Failed to report disruption:', error);
      setAgentResponse('Error: Failed to report disruption');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.approveAction(id);
      await loadPendingActions();
    } catch (error) {
      console.error('Failed to approve action:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.rejectAction(id);
      await loadPendingActions();
    } catch (error) {
      console.error('Failed to reject action:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Autonomous Supply Chain Agent</h1>
      </header>

      <div className="demo-section">
        <div className="demo-card">
          <h2>DEMO: Real-time Decisioning & Optimization</h2>
          <p>
            Autonomous supply chain agent is summed to ezonwe ad-odinal lore sonnaatra, exonsion,
            provictam-annestors, and metec eusamates chain operations.
          </p>
          <div className="demo-input">
            <textarea
              placeholder="Report a supply chain disruption (e.g., 'Port congestion in Shanghai causing 3-day delay')"
              rows={3}
              onChange={(e) => {
                if (e.target.value && !loading) {
                  handleDisruptionReport(e.target.value);
                }
              }}
            />
            {loading && <div className="loading">Agent is analyzing...</div>}
            {agentResponse && (
              <div className="agent-response">
                <strong>Agent Response:</strong>
                <p>{agentResponse}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="left-panel">
          <DemandForecasting />
        </div>

        <div className="center-panel">
          <div className="map-container">
            <h2>Digital Supply Chain Control Tower</h2>
            <WorldMap />
          </div>
        </div>

        <div className="right-panel">
          <ShipmentTracker />
          <RiskManagement />
        </div>
      </div>

      {pendingActions.length > 0 && (
        <SupervisorPanel
          actions={pendingActions}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}

export default App;

// Made with Bob
