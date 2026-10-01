import { useState, useCallback } from "react";

/* ── Face definitions ── */
const FACES = [
  { id: "windowWall", label: "Стена с окном", visible: true },
  { id: "doorWall",   label: "Стена с дверью", visible: true },
  { id: "ceiling",    label: "Потолок", visible: true },
  { id: "backRight",  label: "Задняя правая стена", visible: false },
  { id: "backLeft",   label: "Задняя левая стена", visible: false },
  { id: "floor",      label: "Пол", visible: false },
];

const K_MAP = { 1: 40, 2: 45, 3: 50, 4: 55, 5: 60, 6: 65 };

const QUIPS = {
  4: "Четыре «холодных» перекрытия? Ну, допустим…",
  5: "Пять «холодных» перекрытий… не похоже на типовое жильё",
  6: "Я живу в левитирующем параллелепипеде >_<",
};

const PRESETS = {
  1: ["windowWall"],
  2: ["windowWall", "doorWall"],
  3: ["windowWall", "doorWall", "ceiling"],
  4: ["windowWall", "doorWall", "ceiling", "backRight"],
  5: ["windowWall", "doorWall", "ceiling", "backRight", "backLeft"],
  6: ["windowWall", "doorWall", "ceiling", "backRight", "backLeft", "floor"],
};

const VIDEO_URL = "https://youtu.be/-jX_0uS3DHs";

/* ── Isometric room SVG ── */
function IsometricRoom({ coldFaces, onToggleFace }) {
  const cx = 200, cy = 155;
  const dx = Math.cos(Math.PI / 6);
  const dy = Math.sin(Math.PI / 6);
  const W = 120, D = 80, H = 100;

  const iso = (x, y, z) => [cx + (x - y) * dx, cy + (x + y) * dy - z];

  const p = {
    fbl: iso(0, 0, 0), fbr: iso(W, 0, 0),
    bbr: iso(W, D, 0), bbl: iso(0, D, 0),
    ftl: iso(0, 0, H), ftr: iso(W, 0, H),
    btr: iso(W, D, H), btl: iso(0, D, H),
  };

  const pts = arr => arr.map(a => a[0].toFixed(1) + "," + a[1].toFixed(1)).join(" ");

  const coldFill = "rgba(192,57,43,0.30)";
  const coldStroke = "#c0392b";
  const warmFill = "rgba(240,235,228,0.04)";
  const warmStroke = "#4a4540";

  const faceStyle = (id) => ({
    fill: coldFaces.has(id) ? coldFill : warmFill,
    stroke: coldFaces.has(id) ? coldStroke : warmStroke,
    strokeWidth: coldFaces.has(id) ? 2 : 1.5,
    cursor: "pointer",
  });

  // Left wall (x=0 plane) — DOOR wall
  const leftWall = [p.fbl, p.bbl, p.btl, p.ftl];
  // Right wall (y=0 plane) — WINDOW wall
  const rightWall = [p.fbl, p.fbr, p.ftr, p.ftl];
  // Top
  const topFace = [p.ftl, p.ftr, p.btr, p.btl];

  // Window on right wall (y=0)
  const windowPoly = [
    iso(W * 0.25, 0, H * 0.35), iso(W * 0.75, 0, H * 0.35),
    iso(W * 0.75, 0, H * 0.78), iso(W * 0.25, 0, H * 0.78),
  ];
  const winCrossV1 = iso(W * 0.5, 0, H * 0.35);
  const winCrossV2 = iso(W * 0.5, 0, H * 0.78);
  const winCrossH1 = iso(W * 0.25, 0, H * 0.565);
  const winCrossH2 = iso(W * 0.75, 0, H * 0.565);

  // Door on left wall (x=0)
  const doorPoly = [
    iso(0, D * 0.55, 0), iso(0, D * 0.85, 0),
    iso(0, D * 0.85, H * 0.78), iso(0, D * 0.55, H * 0.78),
  ];
  // Door handle
  const doorHandle = iso(0, D * 0.60, H * 0.38);

  const isCold = (id) => coldFaces.has(id);
  const accentFor = (id) => isCold(id) ? "#e07060" : "#5a5348";

  return (
    <svg viewBox="30 -10 340 230" style={{ width: "100%", maxWidth: 380, display: "block", margin: "0 auto" }}>
      {/* Back edges (dashed) */}
      <line x1={p.bbr[0]} y1={p.bbr[1]} x2={p.bbl[0]} y2={p.bbl[1]}
        stroke="#2a2520" strokeWidth="1" strokeDasharray="4 3" />
      <line x1={p.bbr[0]} y1={p.bbr[1]} x2={p.fbr[0]} y2={p.fbr[1]}
        stroke="#2a2520" strokeWidth="1" strokeDasharray="4 3" />
      <line x1={p.bbl[0]} y1={p.bbl[1]} x2={p.fbl[0]} y2={p.fbl[1]}
        stroke="#2a2520" strokeWidth="1" strokeDasharray="4 3" />

      {/* Left wall — door */}
      <polygon points={pts(leftWall)} {...faceStyle("doorWall")}
        onClick={() => onToggleFace("doorWall")} />
      <polygon points={pts(doorPoly)} fill="rgba(26,23,20,0.7)"
        stroke={accentFor("doorWall")} strokeWidth="1.5" style={{ pointerEvents: "none" }} />
      <circle cx={doorHandle[0]} cy={doorHandle[1]} r="2.5"
        fill={accentFor("doorWall")} style={{ pointerEvents: "none" }} />

      {/* Right wall — window */}
      <polygon points={pts(rightWall)} {...faceStyle("windowWall")}
        onClick={() => onToggleFace("windowWall")} />
      <polygon points={pts(windowPoly)} fill="rgba(100,170,220,0.10)"
        stroke={accentFor("windowWall")} strokeWidth="1.5" style={{ pointerEvents: "none" }} />
      <line x1={winCrossV1[0]} y1={winCrossV1[1]} x2={winCrossV2[0]} y2={winCrossV2[1]}
        stroke={accentFor("windowWall")} strokeWidth="1" style={{ pointerEvents: "none" }} />
      <line x1={winCrossH1[0]} y1={winCrossH1[1]} x2={winCrossH2[0]} y2={winCrossH2[1]}
        stroke={accentFor("windowWall")} strokeWidth="1" style={{ pointerEvents: "none" }} />

      {/* Top — ceiling */}
      <polygon points={pts(topFace)} {...faceStyle("ceiling")}
        onClick={() => onToggleFace("ceiling")} />

      {/* Snowflake icons on cold faces */}
      {isCold("doorWall") && (() => {
        const c = [(p.fbl[0] + p.bbl[0] + p.btl[0] + p.ftl[0]) / 4,
                    (p.fbl[1] + p.bbl[1] + p.btl[1] + p.ftl[1]) / 4];
        return <text x={c[0]} y={c[1] + 4} fontSize="16" textAnchor="middle" style={{ pointerEvents: "none" }}>❄️</text>;
      })()}
      {isCold("windowWall") && (() => {
        const c = [(p.fbl[0] + p.fbr[0] + p.ftr[0] + p.ftl[0]) / 4,
                    (p.fbl[1] + p.fbr[1] + p.ftr[1] + p.ftl[1]) / 4 - 15];
        return <text x={c[0]} y={c[1] + 4} fontSize="16" textAnchor="middle" style={{ pointerEvents: "none" }}>❄️</text>;
      })()}
      {isCold("ceiling") && (() => {
        const c = [(p.ftl[0] + p.ftr[0] + p.btr[0] + p.btl[0]) / 4,
                    (p.ftl[1] + p.ftr[1] + p.btr[1] + p.btl[1]) / 4];
        return <text x={c[0]} y={c[1] + 5} fontSize="16" textAnchor="middle" style={{ pointerEvents: "none" }}>❄️</text>;
      })()}
    </svg>
  );
}

/* ── Main ── */
export default function TeploCalculator() {
  const [area, setArea] = useState(15);
  const [height, setHeight] = useState(2.75);
  const [coldFaces, setColdFaces] = useState(new Set(["windowWall"]));

  const toggleFace = useCallback((id) => {
    setColdFaces(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      if (next.size === 0) next.add("windowWall");
      return next;
    });
  }, []);

  const setPreset = (n) => setColdFaces(new Set(PRESETS[n]));

  const wallCount = Math.min(Math.max(coldFaces.size, 1), 6);
  const k = K_MAP[wallCount];
  const volume = area * height;
  const power = area * height * k;
  const quip = QUIPS[wallCount] || null;

  return (
    <div style={{
      minHeight: "100vh", background: "#1a1714",
      fontFamily: "'Literata', 'Georgia', serif", color: "#f0ebe4",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "24px 16px 48px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400;7..72,600;7..72,700&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=range] { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 3px; background: #3a3530; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 28px; height: 28px; border-radius: 50%; background: #c0392b; cursor: pointer; border: 3px solid #f0ebe4; box-shadow: 0 2px 8px rgba(0,0,0,0.4); transition: transform 0.15s; }
        input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.15); }
        input[type=range]::-moz-range-thumb { width: 28px; height: 28px; border-radius: 50%; background: #c0392b; cursor: pointer; border: 3px solid #f0ebe4; box-shadow: 0 2px 8px rgba(0,0,0,0.4); }
        .cnt-btn { padding: 8px 4px; border: 2px solid #3a3530; background: transparent; color: #a09888; border-radius: 8px; cursor: pointer; font-family: 'Literata', Georgia, serif; font-size: 14px; transition: all 0.2s; text-align: center; line-height: 1.2; }
        .cnt-btn:hover { border-color: #6a5f52; color: #f0ebe4; }
        .cnt-btn.active { border-color: #c0392b; background: rgba(192,57,43,0.12); color: #f0ebe4; }
        .result-glow { animation: pulse 2.5s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { text-shadow: 0 0 20px rgba(192,57,43,0.3); } 50% { text-shadow: 0 0 40px rgba(192,57,43,0.5); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .formula-box { font-family: 'JetBrains Mono', monospace; background: #242018; border: 1px solid #3a3530; border-radius: 12px; padding: 14px 18px; font-size: 14px; color: #a09888; letter-spacing: 0.5px; text-align: center; }
        .fv { color: #f0ebe4; font-weight: 600; }
        .fo { color: #c0392b; margin: 0 3px; }
        .hcb { display: flex; align-items: center; gap: 8px; padding: 5px 0; cursor: pointer; font-size: 13px; color: #a09888; user-select: none; }
        .hcb:hover { color: #f0ebe4; }
        .hcb input[type=checkbox] { accent-color: #c0392b; width: 16px; height: 16px; cursor: pointer; }
        svg polygon { transition: fill 0.25s, stroke 0.25s; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28, maxWidth: 520 }}>
        <div style={{ fontSize: 13, letterSpacing: "3px", textTransform: "uppercase", color: "#c0392b", marginBottom: 8, fontWeight: 600 }}>Добродушный Сантехник</div>
        <h1 style={{ fontSize: "clamp(22px, 5vw, 30px)", fontWeight: 700, lineHeight: 1.25, marginBottom: 10 }}>Теплокалькулятор</h1>
        <p style={{ fontSize: 15, color: "#a09888", lineHeight: 1.5 }}>Расчёт требуемой мощности радиатора для вашего помещения</p>
      </div>

      <div style={{ width: "100%", maxWidth: 520, background: "#211e19", border: "1px solid #3a3530", borderRadius: 16, padding: "28px 24px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Sliders */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <label style={{ fontSize: 14, color: "#a09888" }}>Площадь помещения</label>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 600 }}>{area} м²</span>
          </div>
          <input type="range" min={3} max={80} step={0.5} value={area} onChange={e => setArea(parseFloat(e.target.value))} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#5a5348", marginTop: 4 }}><span>3 м²</span><span>80 м²</span></div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <label style={{ fontSize: 14, color: "#a09888" }}>Высота потолков</label>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 600 }}>{height.toFixed(2)} м</span>
          </div>
          <input type="range" min={2} max={5} step={0.05} value={height} onChange={e => setHeight(parseFloat(e.target.value))} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#5a5348", marginTop: 4 }}><span>2 м</span><span>5 м</span></div>
        </div>

        <div style={{ height: 1, background: "#3a3530" }} />

        {/* Walls section */}
        <div>
          <label style={{ fontSize: 14, color: "#a09888", display: "block", marginBottom: 6 }}>«Холодные» стены и перекрытия</label>
          <p style={{ fontSize: 12, color: "#5a5348", marginBottom: 14, lineHeight: 1.5 }}>Кликайте по граням — красные = холодные (граничат с улицей).</p>

          <IsometricRoom coldFaces={coldFaces} onToggleFace={toggleFace} />

          {/* Hidden faces */}
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#1a1714", borderRadius: 8, border: "1px solid #2a2520" }}>
            <div style={{ fontSize: 11, color: "#5a5348", marginBottom: 6 }}>Невидимые грани:</div>
            {FACES.filter(f => !f.visible).map(f => (
              <label key={f.id} className="hcb">
                <input type="checkbox" checked={coldFaces.has(f.id)} onChange={() => toggleFace(f.id)} />
                {f.label}
                {coldFaces.has(f.id) && <span style={{ color: "#c0392b", fontSize: 11 }}>❄️</span>}
              </label>
            ))}
          </div>

          {/* Count buttons */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, color: "#5a5348", marginBottom: 6 }}>Или задайте количество:</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <button key={n} className={`cnt-btn ${wallCount === n ? "active" : ""}`} onClick={() => setPreset(n)}>
                  {n}
                  <div style={{ fontSize: 10, marginTop: 1, color: wallCount === n ? "#c0392b" : "#5a5348", fontFamily: "'JetBrains Mono', monospace" }}>K={K_MAP[n]}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quip */}
        {quip && <div key={wallCount} style={{ fontSize: 13, color: "#c0392b", fontStyle: "italic", padding: "8px 14px", background: "rgba(192,57,43,0.06)", borderRadius: 8, textAlign: "center", lineHeight: 1.5, animation: "fadeIn 0.3s ease" }}>{quip}</div>}

        <div style={{ height: 1, background: "#3a3530" }} />

        {/* Formula */}
        <div className="formula-box">
          Q = <span className="fv">{area}</span><span className="fo">×</span><span className="fv">{height.toFixed(2)}</span><span className="fo">×</span><span className="fv">{k}</span><span className="fo">=</span><span style={{ color: "#c0392b", fontWeight: 600 }}>{Math.round(power)}</span> Вт
        </div>

        {/* Result */}
        <div style={{ textAlign: "center", padding: "24px 16px", background: "linear-gradient(135deg, rgba(192,57,43,0.08), rgba(192,57,43,0.03))", borderRadius: 12, border: "1px solid rgba(192,57,43,0.2)" }}>
          <div style={{ fontSize: 13, color: "#a09888", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Требуемая мощность</div>
          <div className="result-glow" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "clamp(36px, 8vw, 52px)", fontWeight: 700, lineHeight: 1 }}>
            {Math.round(power).toLocaleString("ru-RU")}
            <span style={{ fontSize: "0.45em", color: "#a09888", marginLeft: 6 }}>Вт</span>
          </div>
          <div style={{ fontSize: 13, color: "#6a5f52", marginTop: 10, fontFamily: "'JetBrains Mono', monospace" }}>Объём: {volume.toFixed(1)} м³</div>
        </div>

        {/* Note */}
        <div style={{ fontSize: 13, color: "#6a5f52", lineHeight: 1.55, padding: "12px 14px", background: "#1a1714", borderRadius: 8, border: "1px solid #2a2520" }}>
          ⚠️ Для корректного расчёта температура подачи теплоносителя должна быть не ниже 70 °C.
        </div>
      </div>

      {/* Video link */}
      <a href={VIDEO_URL} target="_blank" rel="noopener noreferrer"
        style={{ marginTop: 24, display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, color: "#c0392b", textDecoration: "none", padding: "10px 18px", borderRadius: 8, border: "1px solid rgba(192,57,43,0.25)", transition: "all 0.2s" }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(192,57,43,0.08)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" />
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
        </svg>
        Видео о выборе радиатора — @VideoSantehnik
      </a>
      <div style={{ marginTop: 16, fontSize: 12, color: "#3a3530" }}>© Добродушный Сантехник · dobrosant.ru</div>
    </div>
  );
}
