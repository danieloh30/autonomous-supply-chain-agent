import { ProposedAction } from '../services/api';
import './SupervisorPanel.css';

interface SupervisorPanelProps {
  actions: ProposedAction[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const SupervisorPanel = ({ actions, onApprove, onReject }: SupervisorPanelProps) => {
  const pendingActions = actions.filter(a => a.status === 'PENDING');

  if (pendingActions.length === 0) {
    return null;
  }

  return (
    <div className="supervisor-panel">
      <div className="panel-overlay" />
      <div className="panel-content">
        <div className="panel-header">
          <h2>🔔 Supervisor Approval Required</h2>
          <p>{pendingActions.length} action(s) pending your review</p>
        </div>

        <div className="actions-list">
          {pendingActions.map((action) => (
            <div key={action.id} className="action-card">
              <div className="action-info">
                <h3>Route Change Proposal</h3>
                <div className="action-details">
                  <div className="detail-row">
                    <span className="label">Route ID:</span>
                    <span className="value">{action.routeId}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Extra Cost:</span>
                    <span className="value cost">€{action.extraCost.toFixed(2)}</span>
                  </div>
                  <div className="detail-row reasoning">
                    <span className="label">Reasoning:</span>
                    <span className="value">{action.reasoning}</span>
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  className="btn btn-approve"
                  onClick={() => onApprove(action.id)}
                >
                  ✓ Approve
                </button>
                <button
                  className="btn btn-reject"
                  onClick={() => onReject(action.id)}
                >
                  ✗ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupervisorPanel;

// Made with Bob
