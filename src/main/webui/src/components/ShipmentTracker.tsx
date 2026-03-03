import { useEffect, useState } from 'react';
import { api, Shipment } from '../services/api';
import './ShipmentTracker.css';

const ShipmentTracker = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);

  useEffect(() => {
    // Load mock shipments
    setShipments(api.getMockShipments());
  }, []);

  return (
    <div className="shipment-tracker">
      <div className="tracker-header">
        <h3>🚢 Route Optimization & Order Fulfillment</h3>
        <p className="tracker-subtitle">
          Agent optimastes to finiliser if an order shipments.
        </p>
      </div>

      <div className="live-shipments">
        <h4>Live Shipments</h4>
        <div className="shipment-list">
          {shipments.map((shipment) => (
            <div key={shipment.id} className={`shipment-item ${shipment.alert ? 'has-alert' : ''}`}>
              <div className="shipment-icon">🚢</div>
              <div className="shipment-info">
                <div className="shipment-name">{shipment.name}</div>
                <div className="shipment-details">
                  <span className="badge">{shipment.status}</span>
                  {shipment.mode && <span className="badge mode">{shipment.mode}</span>}
                </div>
                {shipment.alert && (
                  <div className="shipment-alert">
                    <span className="alert-icon">⚠️</span>
                    {shipment.alert}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShipmentTracker;

// Made with Bob
