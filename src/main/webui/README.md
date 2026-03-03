# Autonomous Supply Chain Agent - Frontend

This is the frontend application for the Autonomous Supply Chain Agent demo, built with React, TypeScript, and Vite.

## Features

- **Real-time Supply Chain Visualization**: Interactive world map showing supply chain routes, warehouses, and shipments
- **Demand Forecasting Dashboard**: Charts showing predicted vs actual demand with inventory health monitoring
- **Shipment Tracking**: Live shipment status with alerts for delays and issues
- **Risk Management**: Visual risk monitoring with agent-driven mitigation actions
- **Supervisor Approval Panel**: Human-in-the-loop interface for approving agent-proposed actions

## Technology Stack

- **React 18**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Recharts**: Data visualization library
- **Quarkus Quinoa**: Integration with Quarkus backend

## Development

### Prerequisites

- Node.js 20.x or higher
- npm

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The dev server will start at `http://localhost:3000` with proxy to the Quarkus backend at `http://localhost:8080`.

### Build for Production

```bash
npm run build
```

The build output will be placed in `dist/` directory, which Quinoa will serve from the Quarkus application.

## Integration with Quarkus

This frontend is integrated with the Quarkus backend using the Quinoa extension. When you run the Quarkus application in dev mode:

```bash
./mvnw quarkus:dev
```

Quinoa will automatically:
1. Install npm dependencies
2. Start the Vite dev server
3. Proxy frontend requests to the backend
4. Enable hot-reload for both frontend and backend

## API Endpoints

The frontend communicates with these backend endpoints:

- `POST /disruption` - Report supply chain disruptions
- `GET /supervisor/pending` - Get pending supervisor actions
- `POST /supervisor/approve/{id}` - Approve an action
- `POST /supervisor/reject/{id}` - Reject an action

## Project Structure

```
src/main/webui/
├── src/
│   ├── components/          # React components
│   │   ├── WorldMap.tsx     # Interactive supply chain map
│   │   ├── ShipmentTracker.tsx
│   │   ├── DemandForecasting.tsx
│   │   ├── RiskManagement.tsx
│   │   └── SupervisorPanel.tsx
│   ├── services/
│   │   └── api.ts           # API service layer
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## Styling

The application uses a dark theme with a blue/green color scheme inspired by the demo image. All components are styled with CSS modules for maintainability.

## License

This project is part of the Autonomous Supply Chain Agent demo.