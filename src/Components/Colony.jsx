export default function Colony({ autonomy = 60, human = false }) {
  const speed = Math.max(5, 26 - autonomy * 0.21);
  const style = { "--speed": `${speed}s` };
  return (
    <div className={`colony ${human ? "paused" : ""}`}>
      <div className="ring r1" style={style}>
        <span className="ant">🐜</span><span className="ant a2">🐜</span>
      </div>
      <div className="ring r2" style={style}>
        <span className="ant">🐜</span><span className="ant a2">🐜</span>
      </div>
      <div className="ring r3" style={style}>
        <span className="ant">🐜</span><span className="ant a2">🐜</span>
      </div>
      <div className="core">
        <div className="core-inner">{human ? "YOU" : "AI"}</div>
      </div>
    </div>
  );
}