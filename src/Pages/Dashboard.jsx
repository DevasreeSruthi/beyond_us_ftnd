import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import Colony from "../Components/Colony";
import "../App.css";

const EVENTS = [
  ["NORMAL_OPERATION", "Normal Operation"],
  ["MINOR_ANOMALY", "Minor Anomaly"],
  ["MAJOR_ANOMALY", "Major Anomaly"],
  ["CRITICAL_EVENT", "Critical Event"],
];

function Trend({ values }) {
  const W = 600, H = 150;
  if (values.length === 0) return <p className="muted">Run simulations to see the autonomy trend.</p>;
  const pts = values.map((v, i) => [
    values.length === 1 ? W / 2 : (i * W) / (values.length - 1),
    H - (v / 100) * H,
  ]);
  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} className="chart">
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line x1="0" x2={W} y1={H - (g / 100) * H} y2={H - (g / 100) * H} stroke="#1e293b" />
          <text x="2" y={H - (g / 100) * H - 3} fill="#64748b" fontSize="10">{g}</text>
        </g>
      ))}
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="#22d3ee" strokeWidth="2" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#67e8f9" />
      ))}
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = localStorage.getItem("beyondus_user");

  const [eventType, setEventType] = useState("MAJOR_ANOMALY");
  const [severity, setSeverity] = useState(59);
  const [humanIntervention, setHumanIntervention] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await api.get(`/dashboard/${encodeURIComponent(user)}`));
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function act(path, body) {
    setBusy(true);
    try {
      await api.post(path, body);
      await load();
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  }

  const sev = Math.min(100, Math.max(0, Number(severity) || 0));
  const run = () => act("/simulation/run", { username: user, eventType, severity: sev, humanIntervention });
  const takeControl = () => act("/simulation/override", { username: user });
  const release = () => act("/simulation/release", { username: user });
  const reset = () => { if (window.confirm("Delete all your simulation history?")) act("/simulation/reset", { username: user }); };
  const logout = () => { localStorage.removeItem("beyondus_user"); navigate("/"); };

  if (!data) {
    return (
      <div className="dashboard-page">
        <p className="muted" style={{ padding: 40 }}>{error || "Connecting to system..."}</p>
      </div>
    );
  }

  const { state, decisions, overrides, analytics, autonomyTrend } = data;
  const last = decisions[0];
  const human = state.systemStatus === "HUMAN CONTROLLED";
  const threat = last ? last.threat : 0;

  const rows = last
    ? [
        ["Independent decision", 30, last.independentDecision],
        ["Response independence", 25, last.responseIndependence],
        ["No human intervention", 20, last.noHumanIntervention],
        ["Decision complexity", 15, last.decisionComplexity],
        ["Successful autonomous action", 10, last.successfulAction],
      ]
    : [];

  const timeline = [
    ...decisions.map((d) => ({
      ts: d.ts, time: d.time, kind: "d",
      text: `${d.eventType.replaceAll("_", " ")} (severity ${d.severity}) → ${d.decision} · autonomy ${d.autonomy}%`,
    })),
    ...overrides.map((o) => ({ ts: o.ts, time: o.time, kind: "o", text: o.action })),
  ].sort((a, b) => b.ts - a.ts).slice(0, 20);

  return (
    <div className="dashboard-page">
      <header className="dashboard-navbar">
        <div className="logo">Beyond <span>US</span></div>
        <div className="dash-status">
          OPERATOR: <b>{user}</b>
          <span className={`badge ${human ? "human" : "auto"}`}>{state.systemStatus}</span>
        </div>
        <button className="nav-button" onClick={logout}>EXIT</button>
      </header>

      <main className="dashboard-content">
        <p className="eyebrow">HUMAN CONTROL INTERFACE</p>
        <h1 className="dash-title">AUTONOMOUS <span>SIMULATION</span></h1>
        {error && <p className="error">{error}</p>}

        {/* METRICS */}
        <section className="metrics-grid">
          <div className="metric-card">
            <small>AUTONOMY</small>
            <strong>{state.autonomy}%</strong>
            <div className="bar"><div style={{ width: state.autonomy + "%", background: "#22d3ee" }} /></div>
          </div>
          <div className="metric-card">
            <small>THREAT</small>
            <strong>{threat}%</strong>
            <div className="bar">
              <div style={{ width: threat + "%", background: threat < 40 ? "#50e8a5" : threat < 70 ? "#ffc857" : "#ff5c6c" }} />
            </div>
          </div>
          <div className="metric-card"><small>DECISIONS</small><strong>{state.totalDecisions}</strong></div>
          <div className="metric-card"><small>OVERRIDES</small><strong>{state.overrides}</strong></div>
        </section>

        {/* INPUT + DECISION + COLONY */}
        <section className="grid-3">
          <div className="panel">
            <h2>SIMULATION INPUT</h2>

            <label>EVENT TYPE</label>
            <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
              {EVENTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>

            <label>SEVERITY: {sev}</label>
            <input type="range" min="0" max="100" value={sev} onChange={(e) => setSeverity(e.target.value)} />
            <input className="num" type="number" min="0" max="100" value={severity}
                   onChange={(e) => setSeverity(e.target.value)} />

            <label>HUMAN INTERVENTION</label>
            <select value={humanIntervention ? "YES" : "NO"} onChange={(e) => setHumanIntervention(e.target.value === "YES")}>
              <option value="NO">No (system decides alone)</option>
              <option value="YES">Yes (human decides this event)</option>
            </select>

            <button className="primary-button full" onClick={run} disabled={busy}>
              {busy ? "PROCESSING..." : "RUN SIMULATION"} <span>→</span>
            </button>
          </div>

          <div className="panel">
            <h2>CURRENT DECISION</h2>
            <div className="decision-box">{last ? last.decision : "WAITING FOR SIMULATION"}</div>
            {last && (
              <p className="muted small">
                {last.eventType.replaceAll("_", " ")} · severity {last.severity} · human: {last.humanIntervention ? "YES" : "NO"} · {last.time}
              </p>
            )}

            <h3>WHY THIS AUTONOMY?</h3>
            {last ? (
              <table className="factor-table">
                <thead><tr><th>Factor</th><th>Weight</th><th>Value</th><th>Adds</th></tr></thead>
                <tbody>
                  {rows.map(([name, w, v]) => (
                    <tr key={name}><td>{name}</td><td>{w}%</td><td>{v}</td><td>{((w * v) / 100).toFixed(1)}</td></tr>
                  ))}
                  <tr><td>Streak bonus</td><td>-</td><td>-</td><td>+{last.streakBonus}</td></tr>
                  <tr className="total"><td colSpan="3">AUTONOMY</td><td>{last.autonomy}%</td></tr>
                </tbody>
              </table>
            ) : (
              <p className="muted small">Run a simulation to see the calculation.</p>
            )}
          </div>

          <div className="panel center">
            <h2>COLONY</h2>
            <Colony autonomy={state.autonomy} human={human} />
            <p className="muted small">
              {human ? "Human control active. The colony is frozen." : "Faster ants = higher autonomy."}
            </p>
          </div>
        </section>

        {/* THE LAST SWITCH */}
        {human ? (
          <button className="last-switch-button released" onClick={release} disabled={busy}>
            RELEASE CONTROL <span>RETURN THE SYSTEM TO AUTONOMOUS MODE</span>
          </button>
        ) : (
          <button className="last-switch-button" onClick={takeControl} disabled={busy}>
            THE LAST SWITCH <span>TAKE CONTROL</span>
          </button>
        )}

        {/* EVENT LOG */}
        <section className="panel mt">
          <h2>EVENT LOG</h2>
          {timeline.length === 0 ? (
            <p className="muted">No events recorded.</p>
          ) : (
            timeline.map((t, i) => (
              <div key={i} className={`log-row ${t.kind === "o" ? "override" : ""}`}>
                <span>{t.time}</span><span>{t.text}</span>
              </div>
            ))
          )}
        </section>

        {/* DECISION HISTORY */}
        <section className="panel mt scroll">
          <h2>DECISION HISTORY (saved in MySQL)</h2>
          <table className="history">
            <thead>
              <tr><th>TIME</th><th>EVENT</th><th>SEV</th><th>HUMAN</th><th>DECISION</th><th>AUTONOMY</th><th>THREAT</th></tr>
            </thead>
            <tbody>
              {decisions.map((d) => (
                <tr key={d.id}>
                  <td>{d.time}</td><td>{d.eventType.replaceAll("_", " ")}</td><td>{d.severity}</td>
                  <td>{d.humanIntervention ? "YES" : "NO"}</td><td>{d.decision}</td>
                  <td>{d.autonomy}%</td><td>{d.threat}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ANALYTICS */}
        <section className="panel mt">
          <h2>SIMULATION ANALYTICS</h2>
          <div className="analytics">
            <div><small>AVERAGE AUTONOMY</small><strong>{analytics.averageAutonomy}%</strong></div>
            <div><small>PEAK AUTONOMY</small><strong>{analytics.peakAutonomy}%</strong></div>
            <div><small>PEAK THREAT</small><strong>{analytics.peakThreat}%</strong></div>
            <div><small>AUTONOMOUS DECISIONS</small><strong>{analytics.autonomousDecisions}</strong></div>
            <div><small>HUMAN OVERRIDES</small><strong>{analytics.overrides}</strong></div>
          </div>
          <h3>AUTONOMY OVER TIME</h3>
          <Trend values={autonomyTrend} />
        </section>

        <button className="reset-button" onClick={reset}>RESET MY SIMULATION DATA</button>
      </main>
    </div>
  );
}