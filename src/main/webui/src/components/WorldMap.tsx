import './WorldMap.css';

const WorldMap = () => {
  return (
    <div className="world-map">
      <svg viewBox="0 0 1400 700" className="map-svg">
        {/* Simplified world map outline */}
        <g className="continents">
          {/* North America */}
          <path
            d="M 150 150 L 200 120 L 280 130 L 320 180 L 300 250 L 250 280 L 180 260 Z"
            className="continent"
          />
          {/* Europe */}
          <path
            d="M 600 150 L 680 140 L 720 180 L 700 220 L 640 210 Z"
            className="continent"
          />
          {/* Asia */}
          <path
            d="M 750 120 L 900 110 L 1050 140 L 1100 200 L 1050 280 L 950 300 L 850 260 L 780 220 Z"
            className="continent"
          />
          {/* Africa */}
          <path
            d="M 600 280 L 680 270 L 720 350 L 700 450 L 640 480 L 580 420 Z"
            className="continent"
          />
          {/* South America */}
          <path
            d="M 320 350 L 380 340 L 400 420 L 380 520 L 340 540 L 310 480 Z"
            className="continent"
          />
          {/* Australia */}
          <path
            d="M 1050 450 L 1150 440 L 1180 500 L 1140 540 L 1060 530 Z"
            className="continent"
          />
        </g>

        {/* Supply chain routes */}
        <g className="routes">
          {/* Route 1: North America to Europe */}
          <path
            d="M 280 200 Q 450 150 620 180"
            className="route route-active"
            strokeDasharray="5,5"
          />
          
          {/* Route 2: Europe to Asia */}
          <path
            d="M 700 180 Q 850 160 950 200"
            className="route route-active"
            strokeDasharray="5,5"
          />
          
          {/* Route 3: Asia to Australia (with issue) */}
          <path
            d="M 1000 300 Q 1050 380 1100 480"
            className="route route-warning"
            strokeDasharray="5,5"
          />
          
          {/* Alternative route (green) */}
          <path
            d="M 950 280 Q 1020 350 1080 460"
            className="route route-alternative"
            strokeDasharray="5,5"
          />
        </g>

        {/* Location markers */}
        <g className="markers">
          {/* Factories */}
          <circle cx="280" cy="200" r="8" className="marker factory" />
          <circle cx="420" cy="340" r="8" className="marker factory" />
          <circle cx="550" cy="340" r="8" className="marker factory" />
          
          {/* Warehouses */}
          <circle cx="620" cy="180" r="8" className="marker warehouse" />
          <circle cx="800" cy="180" r="8" className="marker warehouse" />
          <circle cx="950" cy="200" r="8" className="marker warehouse" />
          
          {/* Ports */}
          <circle cx="490" cy="240" r="8" className="marker port" />
          <circle cx="700" cy="280" r="8" className="marker port" />
          <circle cx="1100" cy="380" r="8" className="marker port" />
          
          {/* Issue location */}
          <circle cx="920" cy="360" r="12" className="marker issue" />
          <text x="920" y="340" className="marker-label alert">⚠</text>
        </g>

        {/* Agent actions */}
        <g className="agent-actions">
          {/* Rebalancing stock action */}
          <rect x="520" y="380" width="180" height="60" className="action-box" rx="5" />
          <text x="530" y="400" className="action-text">Agent Action:</text>
          <text x="530" y="420" className="action-text">Rebalancing Stock to</text>
          <text x="530" y="435" className="action-text">meet surge demand</text>
          
          {/* Rerouting action */}
          <rect x="880" y="460" width="200" height="60" className="action-box success" rx="5" />
          <text x="890" y="480" className="action-text">Agent Action:</text>
          <text x="890" y="500" className="action-text">Rerouting via Air Freight</text>
          <text x="890" y="515" className="action-text">for on-time delivery.</text>
        </g>
      </svg>
    </div>
  );
};

export default WorldMap;

// Made with Bob
