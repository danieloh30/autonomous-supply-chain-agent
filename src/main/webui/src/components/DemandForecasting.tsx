import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { api, DemandData } from "../services/api";
import "./DemandForecasting.css";

const DemandForecasting = () => {
  const [demandData, setDemandData] = useState<DemandData[]>([]);
  const inventoryHealth = 75;

  useEffect(() => {
    setDemandData(api.getMockDemandData());
  }, []);

  return (
    <div className="demand-forecasting">
      <div className="forecast-header">
        <h3>Demand & inventory</h3>
        <p className="forecast-subtitle">
          Sample demand trends and inventory coverage for the demo network.
        </p>
      </div>

      <div className="forecast-content">
        <div className="chart-section">
          <h4>Predicted vs. actual demand (units)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={demandData} accessibilityLayer>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-color)"
              />
              <XAxis dataKey="month" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="var(--chart-predicted)"
                strokeWidth={2}
                name="Predicted"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="var(--accent-green)"
                strokeWidth={2}
                name="Actual"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="inventory-section">
          <h4>Inventory Health</h4>
          <div className="inventory-gauge">
            <svg
              viewBox="0 0 200 120"
              className="gauge-svg"
              role="img"
              aria-label="Sample inventory health: 75 percent"
            >
              <defs>
                <linearGradient
                  id="gaugeGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="var(--accent-red)" />
                  <stop offset="50%" stopColor="var(--accent-yellow)" />
                  <stop offset="100%" stopColor="var(--accent-green)" />
                </linearGradient>
              </defs>
              {/* Background arc */}
              <path
                d="M 30 100 A 70 70 0 0 1 170 100"
                fill="none"
                stroke="var(--border-color)"
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
                x2={100 - 60 * Math.cos((Math.PI * inventoryHealth) / 100)}
                y2={100 - 60 * Math.sin((Math.PI * inventoryHealth) / 100)}
                stroke="var(--text-primary)"
                strokeWidth="3"
              />
              <circle cx="100" cy="100" r="5" fill="var(--text-primary)" />
              <text
                x="100"
                y="115"
                textAnchor="middle"
                fill="var(--text-primary)"
                fontSize="20"
                fontWeight="bold"
              >
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
