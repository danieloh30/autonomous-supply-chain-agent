# Supply chain control tower SPA

React, TypeScript, Vite, and Recharts provide the interface for the Quarkus demo. The guided scenario compares routes without an LLM, and optional AI mode submits disruption details to the configured model. Human decisions stay visible in an inline queue and history.

Use the **Dark / Light** selector in the header to change the background and dashboard colors. Dark is the default, and the browser remembers your selection across visits. Theme switching also works for the current session when browser storage is blocked.

## Development

Use Node.js 22.12+ (or 20.19+) and npm. Start the backend from the repository root with `./mvnw quarkus:dev`, then:

```bash
cd src/main/webui
npm ci
npm run dev
```

Open http://localhost:3000. Vite forwards `/demo`, `/disruption`, and `/supervisor` to http://localhost:8080. Port 3000 is strict: startup fails rather than silently selecting a different URL.

## Validation and packaging

```bash
npm test
npm run build
```

Vitest and Testing Library exercise the form, request lifecycle, connection failures, and approval decisions. The build runs TypeScript checks and emits production files into `../resources/META-INF/resources/`. Run `./mvnw verify` at the repository root **after** the UI build to package those assets with Quarkus. The packaged app serves both the SPA and API on port 8080. There is no Quinoa dependency.

The chart is loaded in a separate JavaScript chunk. Styles include narrow-screen layouts, visible keyboard focus, accessible form labels and status messages, and reduced-motion support.

## Data sources

- The supervisor queue and history use backend state, refreshed every five seconds.
- The guided demo response supplies the route comparison and selected proposal.
- Map, demand, risk, and shipment context are illustrative sample data, labeled accordingly.
- All shipping operations are simulated. Proposal state resets when the backend restarts.

See the [repository README](../../../README.md) for the complete demo and endpoint reference.
