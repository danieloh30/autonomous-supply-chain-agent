import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api, DemandData } from '../services/api';
import './DemandForecasting.css';

const DemandForecasting = () => {
  const [demandData, setDemandData] = useState<DemandData[]>([]);
  const [inventoryHealth, setInventoryHealth] = useState(75);

  useEffect(() => {
    setDemandData(api.getMockDemandData());
  }, []);

  return (
    <div className="demand-forecasting">
      <div className="forecast-header">
        <h3>📊 Demand Forecasting & Inventory Optimization</h3>
        <p className="forecast-subtitle">
          Demand forecasting &A Inventory optimization nvealizes demand corsemsines and inventory health.
        </p>
      </div>

      <div className="forecast-content">
        <div className="chart-section">
          <h4>Predicted Demand vs. Actual</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={demandData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="month" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #444' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Predicted"
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="Actual"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="inventory-section">
          <h4>Inventory Health</h4>
          <div className="inventory-gauge">
            <svg viewBox="0 0 200 120" className="gauge-svg">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff6b6b" />
                  <stop offset="50%" stopColor="#ffd93d" />
                  <stop offset="100%" stopColor="#6bcf7f" />
                </linearGradient>
              </defs>
              {/* Background arc */}
              <path
                d="M 30 100 A 70 70 0 0 1 170 100"
                fill="none"
                stroke="#333"
                strokeWidth="20"
              />
              {/* Colored arc */}
              <path
                d="M 30 100 A 70 70 0 0 1 170 100"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="20"
                strokeDasharray={`${inventoryHealth * 2.2} 220`}
              />
              {/* Needle */}
              <line
                x1="100"
                y1="100"
                x2={100 + 60 * Math.cos((Math.PI * (inventoryHealth / 100 - 0.5)))}
                y2={100 - 60 * Math.sin((Math.PI * (inventoryHealth / 100 - 0.5)))}
                stroke="#fff"
                strokeWidth="3"
              />
              <circle cx="100" cy="100" r="5" fill="#fff" />
              <text x="100" y="115" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="bold">
                {inventoryHealth}%
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandForecasting;

// Made with Bob
