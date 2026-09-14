import { formatCurrency, ProposedAction } from "../services/api";
import "./SupervisorPanel.css";

interface SupervisorPanelProps {
  actions: ProposedAction[];
  busyId?: string;
  connection: "connecting" | "online" | "offline";
  onDecision: (id: string, decision: "approve" | "reject") => Promise<void>;
  error: string;
  notice: string;
}

const labels = {
  APPROVED: "Approved",
  REJECTED: "Rejected",
  AUTO_APPROVED: "Auto-approved",
  PENDING: "Pending",
};

const SupervisorPanel = ({
  actions,
  busyId,
  connection,
  onDecision,
  error,
  notice,
}: SupervisorPanelProps) => {
  const pending = actions.filter((action) => action.status === "PENDING");
  const history = actions.filter((action) => action.status !== "PENDING");

  return (
    <section
      id="supervisor"
      className="supervisor-panel"
      aria-labelledby="supervisor-heading"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">02 / HUMAN OVERSIGHT</p>
          <h2 id="supervisor-heading">Supervisor queue</h2>
        </div>
        <span className="count-badge">{pending.length}</span>
      </div>
      <p className="panel-description">
        Review the reasoning and additional cost before recording your decision.
      </p>
      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}
      <div role="status" className={notice ? "decision-notice" : ""}>
        {notice}
      </div>
      {pending.length === 0 ? (
        <div className="empty-state">
          <span aria-hidden="true">◎</span>
          <h3>
            {connection === "connecting"
              ? "Loading proposals…"
              : connection === "offline"
                ? "Queue unavailable"
                : "No decisions waiting"}
          </h3>
          <p>
            {connection === "online"
              ? "Run a scenario to see the proposed route and review its cost."
              : "Connect to the backend to retrieve the current approval queue."}
          </p>
        </div>
      ) : (
        <div className="actions-list">
          {pending.map((action) => (
            <article
              key={action.id}
              className="action-card"
              aria-busy={busyId === action.id}
            >
              <div className="action-title">
                <h3>{action.routeId}</h3>
                <span className="status-badge pending">Awaiting approval</span>
              </div>
              <dl className="action-details">
                <div>
                  <dt>Additional cost</dt>
                  <dd className="cost">+{formatCurrency(action.extraCost)}</dd>
                </div>
                <div>
                  <dt>Approval threshold</dt>
                  <dd>&gt; €200</dd>
                </div>
              </dl>
              <p className="action-reasoning">{action.reasoning}</p>
              <p className="proposal-id">
                Proposal {action.id.slice(0, 8)} ·{" "}
                <time dateTime={action.createdAt}>
                  {new Date(action.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </p>
              <div className="action-buttons">
                <button
                  className="primary-button"
                  disabled={!!busyId || connection !== "online"}
                  onClick={() => void onDecision(action.id, "approve")}
                  aria-label={`Approve ${action.routeId} proposal ${action.id.slice(0, 8)}`}
                >
                  {busyId === action.id ? "Saving…" : "Approve route"}
                </button>
                <button
                  className="reject-button"
                  disabled={!!busyId || connection !== "online"}
                  onClick={() => void onDecision(action.id, "reject")}
                  aria-label={`Reject ${action.routeId} proposal ${action.id.slice(0, 8)}`}
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="decision-history">
        <h3>
          Decision history <span>{history.length}</span>
        </h3>
        {history.length === 0 ? (
          <p className="helper-text">
            Approved and rejected proposals will appear here.
          </p>
        ) : (
          <ul>
            {history.map((action) => (
              <li key={action.id}>
                <div>
                  <strong>{action.routeId}</strong>
                  <small>
                    +{formatCurrency(action.extraCost)} ·{" "}
                    {action.id.slice(0, 8)}
                  </small>
                </div>
                <span className={`status-badge ${action.status.toLowerCase()}`}>
                  {labels[action.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="policy-note">
        The server calculates costs from the demo catalog. Your decision is
        final for each proposal.
      </p>
    </section>
  );
};

export default SupervisorPanel;
