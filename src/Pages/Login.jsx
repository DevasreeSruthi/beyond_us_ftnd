import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "../App.css";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await api.post(`/auth/${registering ? "register" : "login"}`, { username, password });
      localStorage.setItem("beyondus_user", data.username);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <main className="login-page">
      <section className="login-box">
        <div className="login-logo">BEYOND <span>US</span></div>
        <p className="eyebrow">HUMAN CONTROL INTERFACE</p>
        <h1>ENTER THE<br /><span>SYSTEM</span></h1>
        <p className="muted">
          {registering ? "Create your operator account." : "Access the autonomous decision-making simulation."}
        </p>

        <form className="login-form" onSubmit={submit}>
          <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="password" placeholder="Password (min 4 characters)" value={password}
                 onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="error">{error}</p>}
          <button className="primary-button" type="submit" disabled={busy}>
            {registering ? "CREATE ACCOUNT" : "ACCESS SYSTEM"} <span>→</span>
          </button>
        </form>

        <button className="link-button" onClick={() => { setRegistering(!registering); setError(""); }}>
          {registering ? "Already have an account? Log in" : "New operator? Register"}
        </button>
        <button className="link-button dim" onClick={() => navigate("/")}>← BACK TO BEYOND US</button>
      </section>
    </main>
  );
}