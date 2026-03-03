import { useEffect, useState } from 'react';
import { api, RiskEvent } from '../services/api';
import './RiskManagement.css';

const RiskManagement = () => {
  const [riskEvents, setRiskEvents] = useState<RiskEvent[]>([]);

  useEffect(() => {
    setRiskEvents(api.getMockRiskEvents());
  }, []);

  return (
    <div className="risk-management">
      <div className="risk-header">
        <h3>🛡️ Risk Management</h3>
        <p className="risk-subtitle">
          Agent Acti: Activating Backup Supplier in Region B to mitigate disruption.
        </p>
      </div>

      <div className="risk-content">
        <h4>Risk Monitor</h4>
        <div className="risk-map">
          <svg viewBox="0 0 300 200" className="risk-map-svg">
            {/* Simplified map outline */}
            <path
              d="M 50 50 L 100 40 L 150 60 L 180 100 L 160 150 L 100 160 L 60 120 Z"
              className="risk-region"
              fill="#1a1a2e"
              stroke="#444"
              strokeWidth="2"
            />
            
            {/* Risk hotspot */}
            <circle cx="120" cy="100" r="40" className="risk-hotspot high" opacity="0.3" />
            <circle cx="120" cy="100" r="25" className="risk-hotspot high" opacity="0.5" />
            <circle cx="120" cy="100" r="10" className="risk-hotspot high" opacity="0.8" />
            
            {/* Risk marker */}
            <circle cx="120" cy="100" r="8" fill="#ff6b6b" stroke="#fff" strokeWidth="2" />
            <text x="120" y="85" textAnchor="middle" fill="#fff" fontSize="24">⚠</text>
          </svg>
        </div>

        <div className="risk-events">
          {riskEvents.map((event, index) => (
            <div key={index} className={`risk-event severity-${event.severity}`}>
              <div className="event-header">
                <span className="event-region">{event.region}</span>
                <span className={`severity-badge ${event.severity}`}>
                  {event.severity.toUpperCase()}
                </span>
              </div>
              <div className="event-description">
                <strong>Agent Action:</strong> {event.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskManagement;

// Made with Bob
