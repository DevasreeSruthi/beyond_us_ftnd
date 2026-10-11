import { useNavigate } from "react-router-dom";
import Colony from "../Components/Colony";
import "../App.css";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">Beyond <span>US</span></div>
        <div className="nav-links">
          <a href="#about">ABOUT</a>
          <a href="#about">SYSTEM</a>
          <a href="#about">CONTROL</a>
        </div>
        <button className="nav-button" onClick={() => navigate("/login")}>ENTER SYSTEM</button>
      </nav>

      <main className="hero">
        <div>
          <p className="eyebrow">AUTONOMY // HUMAN CONTROL</p>
          <h1>HOW FAR SHOULD<br />WE LET MACHINES<br /><span>DECIDE?</span></h1>
          <p className="description">
            A simulation of autonomous decision-making, where a system decides on its own
            until a human chooses to take control.
          </p>
          <div className="hero-buttons">
            <button className="primary-button" onClick={() => navigate("/login")}>
              ENTER THE SYSTEM <span>→</span>
            </button>
            <button
              className="secondary-button"
              onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
            >
              EXPLORE THE IDEA
            </button>
          </div>
        </div>

        <div className="colony-wrap">
          <Colony autonomy={60} />
          <div className="status-card">
            <div className="status-dot"></div>
            <div><small>SYSTEM STATUS</small><strong>AUTONOMOUS</strong></div>
          </div>
        </div>
      </main>

      <section className="bottom-section">
        <div><span>01</span><p>OBSERVE</p></div>
        <div><span>02</span><p>DECIDE</p></div>
        <div><span>03</span><p>OVERRIDE</p></div>
        <div className="last-switch-tag"><span>THE LAST SWITCH</span><p>WHO CONTROLS THE DECISION?</p></div>
      </section>

      <section id="about" className="about-section">
        <p className="eyebrow">THE IDEA BEHIND BEYOND US</p>
        <h2>Observe. Decide. Override.</h2>
        <p>
          BEYOND US is a rule-based simulation of autonomous decision-making. You describe an
          event. The system decides on its own and calculates how autonomous it was and how
          threatening the situation is. At any moment you can press THE LAST SWITCH and take
          control back.
        </p>
      </section>
    </div>
  );
}