# Autonomous Supply Chain Agent

A Quarkus and React demo of disruption response with human oversight. Compare shipping routes, inspect the carbon and cost tradeoffs, and approve or reject the proposed reroute from one control tower.

The guided scenario works without an AI credential. Optional AI mode uses LangChain4j tools against the same fictional shipment and route catalog.

## Quick start

Prerequisites: **JDK 25**, **Node.js 22.12+** (or 20.19+), and npm. The Node requirement follows the [Vite 7 migration guide](https://v7.vite.dev/guide/migration).

```bash
./start-dev.sh
```

On Windows, run `start-dev.bat`. Open **http://localhost:3000** for the SPA. The backend runs at **http://localhost:8080**; its development console is at `/q/dev-ui`.

For manual startup, run these in separate terminals:

```bash
# Repository root
./mvnw quarkus:dev
```

```bash
cd src/main/webui
npm ci
npm run dev
```

Vite proxies `/demo`, `/disruption`, and `/supervisor` to port 8080. The project uses separate Quarkus and Vite dev servers; it does not use Quinoa.

### Use your existing OpenAI API key

The backend reads `OPENAI_API_KEY` from its environment. If the key is already set in your shell, check its presence without printing its value, export it for child processes, and start the demo from **that same shell**:

```bash
if [ -n "${OPENAI_API_KEY:-}" ]; then
  echo "OPENAI_API_KEY is set"
  export OPENAI_API_KEY
  ./start-dev.sh
else
  echo "Set OPENAI_API_KEY in this shell before starting AI mode."
fi
```

Open http://localhost:3000, select **AI agent**, and click **Analyze with AI**. The browser sends the disruption to Quarkus; only the backend uses the credential. You do not need to paste the key into the SPA or commit it to a file. OpenAI's [developer quickstart](https://developers.openai.com/api/docs/quickstart#create-and-export-an-api-key) explains exporting an API key as an environment variable.

If the backend was already running before the key was exported, stop it and restart from the shell containing the key. Environment changes in another terminal do not update an existing process. `OPENAI_MODEL` optionally overrides the `gpt-4o-mini` default. Without a key, the guided demo still works and `/disruption` returns HTTP 503 with configuration guidance.

Each **Analyze with AI** submission makes live requests to the configured model. **Guided demo** makes no model calls.

---


## Human-in-the-Loop Demo Workflow

1. Open the SPA and select **Guided demo**.
2. Click **Run demo**. The server compares all three routes for shipment **402**, Rotterdam → Berlin, with an original cost of **€100**.
3. Review the route comparison and the proposal in the **Supervisor queue**.
4. Approve or reject it. The proposal leaves the pending queue and appears in **Decision history**. Run another scenario to demonstrate the other decision.

| Route | Transport | Cost | Extra cost | CO₂ | Arrival |
| --- | --- | ---: | ---: | ---: | --- |
| Rail-01 | Rail | €450 | €350 | 0.3 t | In 2 days |
| Truck-99 | Truck | €380 | €280 | 1.5 t | In 1 day |
| Barge-42 | Barge | €420 | €320 | **0.2 t** | In 3 days |

The guided scenario selects **Barge-42** because it has the lowest carbon impact, accepting its later arrival. The **€320 additional cost exceeds the €200 approval threshold**, so it remains pending. The server calculates that cost from the trusted catalog; the model cannot pass in an arbitrary price to bypass approval.

In **AI agent** mode, edit the disruption details and click **Analyze with AI**. Typing never sends a request. The agent finds routes, checks the carbon impact of every alternative, and submits a proposal. Its wording and tool-call behavior can vary with the model. Human decisions are recorded separately; the agent does not automatically resume after approval.

### Command-line demonstration

```bash
# Compare routes and create the repeatable proposal (no LLM call)
curl -fsS -X POST http://localhost:8080/demo/disruption | jq

# List only proposals still awaiting review
curl -fsS http://localhost:8080/supervisor/pending | jq

# Replace PROPOSAL_ID with the action.id returned above
curl -fsS -X POST http://localhost:8080/supervisor/approve/PROPOSAL_ID | jq
# Or reject it:
curl -fsS -X POST http://localhost:8080/supervisor/reject/PROPOSAL_ID | jq

# View pending proposals and final decisions
curl -fsS http://localhost:8080/supervisor/actions | jq
```

For AI analysis:

```bash
curl -fsS -X POST http://localhost:8080/disruption \
  -H 'Content-Type: text/plain' \
  -d 'Port Rotterdam strike. Reroute shipment 402 to Berlin. Compare all routes and propose the lowest-carbon alternative.'
```

### Verified live AI run

On **2026-09-14**, the application was started with an existing `OPENAI_API_KEY` exported from the shell, and the AI endpoint was exercised against the live model service. The response compared all three routes and selected **Barge-42**, reporting **0.2 t CO₂**, **€320 additional cost**, and a proposal awaiting human approval.

A separate `GET /supervisor/pending` request confirmed that the proposal had actually been recorded in the backend. Relevant fields from that response:

```json
{
  "routeId": "Barge-42",
  "reasoning": "Selected for its lowest carbon impact of 0.2 tons CO2.",
  "extraCost": 320.0,
  "status": "PENDING"
}
```

The key was neither printed nor written into the repository. This validates live AI proposal creation; it does not imply that a real shipment moved. Proposal IDs and model wording vary between runs. To finish the presentation, review the proposal in the **Supervisor queue** and select **Approve route** or **Reject**, then show **Decision history**.

## Application behavior

- Approval is required when additional cost is **strictly greater than €200**. Lower-cost proposals use `AUTO_APPROVED`; all three seeded alternatives require review.
- Pending proposals can become `APPROVED` or `REJECTED`. Repeating the same decision returns the existing result. A conflicting final decision returns **409**; an unknown proposal returns **404**.
- `GET /supervisor/pending` returns pending proposals only. `GET /supervisor/actions` includes history, newest proposals first. Both return immutable snapshots.
- The SPA refreshes the queue every five seconds, cancels obsolete reads, disables duplicate submissions/decisions, and displays connection or operation failures.
- The **Dark / Light** selector in the header switches the entire dashboard theme, including charts and the map, and remembers the choice in the browser. Dark is the default.
- Map, demand, shipment, and risk panels are explicitly labeled illustrative. The approval queue reflects backend state.

**Demo boundaries:** shipping operations are simulated; no real route is changed. Proposals and decisions are held in memory and reset on backend restart. This is an unauthenticated local demonstration, not a production approval system or a certification of regulatory compliance. An external shipping integration would need its own authoritative prices and shipment context; the guardrail here intentionally uses the local demo catalog.

## Build and test

```bash
# Frontend tests and production assets
cd src/main/webui
npm ci
npm test
npm run build
cd ../../..

# Backend tests and packaged application
./mvnw verify
java -jar target/quarkus-app/quarkus-run.jar
```

After building both, open **http://localhost:8080** for the packaged SPA and API. Vite writes generated assets to `src/main/resources/META-INF/resources/`, which Quarkus packages as static resources. Build the frontend **before** packaging the backend. Dependencies and generated assets are ignored by Git. CI builds and tests both applications in this order.

Backend tests cover catalog pricing, the threshold boundary, validation, concurrent decisions, and the HTTP demo lifecycle. SPA tests cover explicit submission, duplicate-click prevention, route comparison, approval/history, error recovery, and polling cleanup.

## Endpoints

| Method | Path | Result |
| --- | --- | --- |
| POST | `/demo/disruption` | Route comparison and pending proposal as JSON |
| POST | `/disruption` | AI response as text; expects 1–4000 characters of `text/plain` |
| GET | `/supervisor/pending` | Pending proposals as JSON |
| GET | `/supervisor/actions` | All proposals and decisions as JSON |
| POST | `/supervisor/approve/{id}` | Approved proposal as JSON |
| POST | `/supervisor/reject/{id}` | Rejected proposal as JSON |
| GET | `/v1/logistics/routes` | Fictional route catalog |
| GET | `/v1/logistics/impact?routeId=…` | Carbon estimate for a known route; 404 otherwise |
| POST | `/test/create-pending-action` | Legacy shortcut: Rail-01 proposal, €350 extra, text response |

The shipping REST client defaults to the app's HTTP port. `SHIPPING_API_URL` can override its base URL. Tests use port 8082 and a dummy model credential; they make no AI calls.

See the [frontend guide](src/main/webui/README.md), [Quarkus REST guide](https://quarkus.io/guides/rest), and [REST client guide](https://quarkus.io/guides/rest-client).
