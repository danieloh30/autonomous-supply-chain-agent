import {
  FormEvent,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import "./App.css";
import WorldMap from "./components/WorldMap";
import ShipmentTracker from "./components/ShipmentTracker";
const DemandForecasting = lazy(() => import("./components/DemandForecasting"));
import RiskManagement from "./components/RiskManagement";
import SupervisorPanel from "./components/SupervisorPanel";
import ThemeToggle from "./components/ThemeToggle";
import { api, DemoRun, formatCurrency, ProposedAction } from "./services/api";

const scenario =
  "Port Rotterdam strike. Reroute shipment 402 from Rotterdam to Berlin. Compare the carbon impact of all available routes and submit the lowest-carbon alternative.";

function App() {
  const [actions, setActions] = useState<ProposedAction[]>([]);
  const [connection, setConnection] = useState<
    "connecting" | "online" | "offline"
  >("connecting");
  const [lastSynced, setLastSynced] = useState<Date>();
  const [mode, setMode] = useState<"demo" | "ai">("demo");
  const [issue, setIssue] = useState(scenario);
  const [agentResponse, setAgentResponse] = useState("");
  const [demoRun, setDemoRun] = useState<DemoRun>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [decisionError, setDecisionError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<string>();
  const refreshController = useRef<AbortController>();
  const submitting = useRef(false);
  const deciding = useRef(false);

  const refreshActions = useCallback(async () => {
    refreshController.current?.abort();
    const controller = new AbortController();
    refreshController.current = controller;
    try {
      const nextActions = await api.getActions(controller.signal);
      if (!controller.signal.aborted) {
        setActions(nextActions);
        setConnection("online");
        setLastSynced(new Date());
      }
    } catch {
      if (!controller.signal.aborted) setConnection("offline");
    }
  }, []);

  useEffect(() => {
    void refreshActions();
    const interval = window.setInterval(() => void refreshActions(), 5000);
    return () => {
      window.clearInterval(interval);
      refreshController.current?.abort();
    };
  }, [refreshActions]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting.current || (mode === "ai" && !issue.trim())) return;
    submitting.current = true;
    setLoading(true);
    setError("");
    setAgentResponse("");
    setDemoRun(undefined);
    setNotice("");
    try {
      if (mode === "demo") {
        const result = await api.runDemo();
        setDemoRun(result);
      } else {
        setAgentResponse(await api.reportDisruption(issue.trim()));
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to run the scenario. Please try again.",
      );
    } finally {
      // A model may create a proposal before its final response fails.
      await refreshActions();
      setLoading(false);
      submitting.current = false;
    }
  };

  const handleDecision = async (id: string, decision: "approve" | "reject") => {
    if (deciding.current) return;
    deciding.current = true;
    setBusyId(id);
    setDecisionError("");
    setNotice("");
    try {
      const result = await api.decideAction(id, decision);
      refreshController.current?.abort();
      setActions((current) =>
        current.map((action) => (action.id === id ? result : action)),
      );
      setNotice(
        `${result.routeId} ${result.status.toLowerCase()}. Decision recorded in this demo session.`,
      );
    } catch (cause) {
      setDecisionError(
        cause instanceof Error
          ? cause.message
          : "Unable to save the decision. Please try again.",
      );
    } finally {
      await refreshActions();
      setBusyId(undefined);
      deciding.current = false;
    }
  };

  const pendingCount = actions.filter(
    (action) => action.status === "PENDING",
  ).length;
  const selectedAction =
    demoRun && actions.find((action) => action.id === demoRun.action.id);

  return (
    <div className="app">
      <a className="skip-link" href="#workspace">
        Skip to workspace
      </a>
      <header className="app-header">
        <div className="brand">
          <span className="brand-symbol" aria-hidden="true">
            ↗
          </span>
          <div>
            <p className="eyebrow">SUPPLY CHAIN OPERATIONS</p>
            <h1>Autonomous control tower</h1>
          </div>
        </div>
        <div className="header-status">
          <ThemeToggle />
          <span className="demo-badge">SIMULATION</span>
          <span className={`connection ${connection}`} role="status">
            <span aria-hidden="true">●</span>{" "}
            {connection === "online"
              ? "Backend connected"
              : connection === "offline"
                ? "Backend offline"
                : "Connecting…"}
          </span>
        </div>
      </header>

      <main id="workspace" className="workspace">
        <div className="page-heading">
          <div>
            <p className="eyebrow">DISRUPTION RESPONSE</p>
            <h2>Keep the supply chain moving.</h2>
            <p>
              Compare alternatives. Understand the tradeoffs. Keep people in
              control.
            </p>
          </div>
          <a href="#supervisor" className="queue-link">
            Review queue <span>{pendingCount}</span>
          </a>
        </div>
        {connection === "offline" && (
          <div className="error-banner" role="alert">
            Cannot reach the backend.{" "}
            {lastSynced
              ? `Showing data from ${lastSynced.toLocaleTimeString()}.`
              : "Approval data is unavailable."}{" "}
            <button type="button" onClick={() => void refreshActions()}>
              Retry connection
            </button>
          </div>
        )}

        <section className="metrics" aria-label="Demo overview">
          <div className="metric">
            <span>Active disruption</span>
            <strong>
              Rotterdam <small>Port strike</small>
            </strong>
          </div>
          <div className="metric">
            <span>Shipment at risk</span>
            <strong>
              402 <small>Bound for Berlin</small>
            </strong>
          </div>
          <div className="metric">
            <span>Approval policy</span>
            <strong>
              &gt; €200 <small>Additional cost</small>
            </strong>
          </div>
          <div className="metric">
            <span>Awaiting review</span>
            <strong>
              {!lastSynced ? "—" : pendingCount}
              <small>
                {connection === "offline"
                  ? "Last known count"
                  : "Supervisor decisions"}
              </small>
            </strong>
          </div>
        </section>

        <div className="operations-grid">
          <section className="demo-card" aria-labelledby="scenario-heading">
            <div className="section-heading">
              <div>
                <p className="eyebrow">01 / ANALYZE & PROPOSE</p>
                <h2 id="scenario-heading">Resolve a disruption</h2>
              </div>
              <span className="sample-label">Shipment 402</span>
            </div>
            <div
              className="mode-switch"
              role="group"
              aria-label="Analysis mode"
            >
              <button
                type="button"
                aria-pressed={mode === "demo"}
                disabled={loading}
                onClick={() => setMode("demo")}
              >
                Guided demo
              </button>
              <button
                type="button"
                aria-pressed={mode === "ai"}
                disabled={loading}
                onClick={() => setMode("ai")}
              >
                AI agent
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {mode === "demo" ? (
                <div className="scenario-brief">
                  <span className="incident-label">PORT DISRUPTION</span>
                  <h3>Rotterdam → Berlin</h3>
                  <p>
                    A port strike blocks shipment 402. Compare rail, truck, and
                    barge, then propose the lowest-carbon route.
                  </p>
                  <p className="scenario-meta">
                    Original cost: €100 · Human approval above €200 extra
                  </p>
                </div>
              ) : (
                <div className="demo-input">
                  <label htmlFor="disruption">Disruption details</label>
                  <textarea
                    id="disruption"
                    value={issue}
                    maxLength={4000}
                    rows={5}
                    disabled={loading}
                    onChange={(event) => setIssue(event.target.value)}
                    aria-describedby="disruption-help"
                  />
                  <p id="disruption-help" className="helper-text">
                    Uses the configured AI model with the same shipment 402 demo
                    catalog. Details are sent only when you submit.
                  </p>
                </div>
              )}
              <div className="submit-row">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={loading || (mode === "ai" && !issue.trim())}
                >
                  {loading
                    ? "Analyzing routes…"
                    : mode === "demo"
                      ? "Run demo →"
                      : "Analyze with AI →"}
                </button>
                <p className="helper-text">
                  {mode === "demo"
                    ? "Repeatable scenario · No API key needed"
                    : "Requires OPENAI_API_KEY on the backend"}
                </p>
              </div>
            </form>
            <ol className="workflow" aria-label="Workflow steps">
              <li>
                <span>1</span> Find routes
              </li>
              <li>
                <span>2</span> Compare CO₂
              </li>
              <li>
                <span>3</span> Request approval
              </li>
            </ol>
            {loading && (
              <p className="loading" role="status">
                {mode === "ai"
                  ? "The agent is evaluating alternatives. This can take a few minutes."
                  : "Comparing available routes and recording a proposal…"}
              </p>
            )}
            {error && (
              <p className="error-banner" role="alert">
                {error}
              </p>
            )}
            {demoRun && (
              <div className="route-results">
                <h3>Alternatives evaluated</h3>
                <div className="table-scroll">
                  <table>
                    <caption>
                      Shipment {demoRun.shipmentId} · original cost{" "}
                      {formatCurrency(demoRun.originalCost)}
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Route</th>
                        <th scope="col">Cost</th>
                        <th scope="col">Extra</th>
                        <th scope="col">CO₂ (t)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demoRun.alternatives.map((route) => (
                        <tr
                          key={route.routeId}
                          className={
                            route.routeId === demoRun.action.routeId
                              ? "selected-route"
                              : ""
                          }
                        >
                          <th scope="row">
                            {route.mode}
                            <small>
                              {route.routeId}
                              {route.routeId === demoRun.action.routeId &&
                                " · Lowest CO₂"}
                            </small>
                          </th>
                          <td>{formatCurrency(route.baseCost)}</td>
                          <td>
                            +
                            {formatCurrency(
                              route.baseCost - demoRun.originalCost,
                            )}
                          </td>
                          <td>{route.co2Tons.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="result-summary" role="status">
                  {demoRun.action.routeId} proposed ·{" "}
                  {selectedAction?.status === "APPROVED"
                    ? "Approved by supervisor"
                    : selectedAction?.status === "REJECTED"
                      ? "Rejected by supervisor"
                      : "Awaiting supervisor approval"}
                </p>
              </div>
            )}
            {agentResponse && (
              <div className="agent-response" role="status">
                <h3>Agent response</h3>
                <p>{agentResponse}</p>
              </div>
            )}
          </section>

          <SupervisorPanel
            actions={actions}
            busyId={busyId}
            connection={connection}
            onDecision={handleDecision}
            error={decisionError}
            notice={notice}
          />
        </div>

        <div className="context-heading">
          <div>
            <p className="eyebrow">NETWORK CONTEXT</p>
            <h2>The wider picture</h2>
          </div>
          <span className="sample-label">
            Illustrative data · not live telemetry
          </span>
        </div>
        <div className="context-grid">
          <section className="map-container">
            <div className="section-heading">
              <h3>Global supply network</h3>
              <span className="sample-label">Schematic</span>
            </div>
            <WorldMap />
            <div className="map-legend">
              <span>● Regular route</span>
              <span>● Disrupted route</span>
              <span>● Alternative</span>
            </div>
          </section>
          <ShipmentTracker />
        </div>
        <div className="insights-grid">
          <Suspense fallback={<p className="loading">Loading demand chart…</p>}>
            <DemandForecasting />
          </Suspense>
          <RiskManagement />
        </div>
        <footer className="app-footer">
          Demonstration only. Shipping changes are simulated. Proposals and
          decisions are stored in memory and reset when the backend restarts.
        </footer>
      </main>
    </div>
  );
}

export default App;
