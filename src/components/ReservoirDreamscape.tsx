import React, { useMemo, useState, useCallback } from "react";

/**
 * ReservoirDreamscape
 * One-file, plug-and-play reservoir viz with Arps DCA (exp/harmonic/hyperbolic),
 * EUR, remaining reserves, economic limit, and a tiny well schematic.
 *
 * Props are optional; sensible defaults provided for a fast demo.
 */
export type ReservoirDreamscapeProps = {
  /** Initial rate qi (e.g., STB/D or Mscf/D) */
  qi?: number;
  /** Initial nominal decline Di (1/yr). Example: 0.75 = 75%/yr */
  Di?: number;
  /** Arps exponent b (0=exp, 1=harmonic, (0,1)=hyperbolic) */
  b?: number;
  /** Economic limit rate (same units as qi). EUR integrates down to this rate. */
  qEcon?: number;
  /** Unit label shown in the UI */
  unit?: "STB/D" | "Mscf/D";
  /** Time step in months for plotting */
  dtMonths?: number;
  /** Max years to render (cap for the tail) */
  maxYears?: number;
  /** Nice default theme toggle */
  dark?: boolean;
};

type Point = { tYears: number; q: number; Np: number };

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function q_of_t(tYears: number, qi: number, Di: number, b: number): number {
  if (b === 0) return qi * Math.exp(-Di * tYears); // exponential
  if (b === 1) return qi / (1 + Di * tYears); // harmonic
  // hyperbolic
  const denom = Math.pow(1 + b * Di * tYears, 1 / b);
  return qi / denom;
}

function t_of_q(q: number, qi: number, Di: number, b: number): number {
  q = Math.max(Math.min(q, qi), 1e-12);
  if (b === 0) return (1 / Di) * Math.log(qi / q); // exponential
  if (b === 1) return (qi / q - 1) / Di; // harmonic
  // hyperbolic
  return (Math.pow(qi / q, b) - 1) / (b * Di);
}

/** Cumulative from qi down to rate q (years implicit inside the formulation). */
function Np_at_q(q: number, qi: number, Di: number, b: number): number {
  q = Math.max(Math.min(q, qi), 1e-12);
  if (b === 0) return (qi - q) / Di;
  if (b === 1) return Math.log(qi / q) / Di;
  // hyperbolic (0<b<1 typical)
  return (Math.pow(qi, 1 - b) - Math.pow(q, 1 - b)) / (Di * (1 - b));
}

/** Format helpers */
function formatNumber(x: number, unit?: string) {
  const abs = Math.abs(x);
  const sign = x < 0 ? "-" : "";
  let val = x;
  let suf = "";
  if (abs >= 1_000_000_000) {
    val = x / 1_000_000_000;
    suf = "B";
  } else if (abs >= 1_000_000) {
    val = x / 1_000_000;
    suf = "M";
  } else if (abs >= 1_000) {
    val = x / 1_000;
    suf = "k";
  }
  const s = `${sign}${Math.abs(val).toFixed(abs >= 1000 ? 2 : 2)}${suf}`;
  return unit ? `${s} ${unit}` : s;
}

function formatVolume(x: number, fluid: "oil" | "gas" = "oil") {
  // Interpret Np as "per day * years" integrated → barrels or Mcf (unitless scale).
  // Display as MBO / Bcf-style shorthand.
  const abs = Math.abs(x);
  if (fluid === "oil") {
    if (abs >= 1_000_000) return `${(x / 1_000_000).toFixed(2)} MMbbl`;
    if (abs >= 1_000) return `${(x / 1_000).toFixed(2)} Mbbl`;
    return `${x.toFixed(0)} bbl`;
  } else {
    if (abs >= 1_000_000_000) return `${(x / 1_000_000_000).toFixed(2)} Tcf`;
    if (abs >= 1_000_000) return `${(x / 1_000_000).toFixed(2)} Bcf`;
    if (abs >= 1_000) return `${(x / 1_000).toFixed(2)} MMcf`;
    return `${x.toFixed(0)} Mcf`;
  }
}

const ReservoirDreamscape: React.FC<ReservoirDreamscapeProps> = ({
  qi = 1200, // STB/D
  Di = 0.75, // 75%/yr
  b = 0.7, // hyperbolic tail
  qEcon = 40,
  unit = "STB/D",
  dtMonths = 1,
  maxYears = 40,
  dark = true,
}) => {
  const [bLive, setB] = useState(b);
  const [DiLive, setDi] = useState(Di);
  const [qiLive, setQi] = useState(qi);
  const [qEconLive, setQEcon] = useState(qEcon);
  const [maxMode, setMaxMode] = useState(false); // "Maximum reserves" fun toggle

  // "Maximum reserves" gently nudges parameters to long tails
  const bEff = maxMode ? clamp(lerp(bLive, 0.99, 0.6), 0, 0.999) : bLive;
  const DiEff = maxMode ? clamp(lerp(DiLive, 0.35, 0.6), 0.05, 2.0) : DiLive;
  const qiEff = qiLive;
  const qEconEff = Math.max(
    1,
    maxMode ? Math.max(5, qEconLive * 0.6) : qEconLive
  );

  const fluid: "oil" | "gas" = unit === "Mscf/D" ? "gas" : "oil";

  const { points, tEcon, EUR, cumAt5y, qAt5y } = useMemo(() => {
    // Build curve until q reaches q_econ or maxYears
    const tStopByEcon = t_of_q(qEconEff, qiEff, DiEff, bEff);
    const tStop = Math.min(tStopByEcon, maxYears);
    const n = Math.max(2, Math.floor((tStop * 12) / dtMonths) + 1);

    const pts: Point[] = [];
    for (let i = 0; i < n; i++) {
      const tYears = (i * dtMonths) / 12;
      const q = q_of_t(tYears, qiEff, DiEff, bEff);
      const Np = Np_at_q(q, qiEff, DiEff, bEff);
      pts.push({ tYears, q, Np });
    }

    const EUR = Np_at_q(qEconEff, qiEff, DiEff, bEff);
    const t5 = Math.min(5, pts.length ? pts[pts.length - 1].tYears : 5);
    const q5 = q_of_t(t5, qiEff, DiEff, bEff);
    const Np5 = Np_at_q(q5, qiEff, DiEff, bEff);

    return {
      points: pts,
      tEcon: tStopByEcon,
      EUR,
      cumAt5y: Np5,
      qAt5y: q5,
    };
  }, [qiEff, DiEff, bEff, qEconEff, dtMonths, maxYears]);

  // Axes ranges
  const maxQ = Math.max(qiEff, ...points.map((p) => p.q));
  const maxNp = Math.max(...points.map((p) => p.Np), 1);
  const padQ = maxQ * 0.1;
  const padNp = maxNp * 0.1;

  // SVG helpers
  const W = 980,
    H = 420;
  const plot = { left: 70, right: 70, top: 30, bottom: 60 };
  const innerW = W - plot.left - plot.right;
  const innerH = H - plot.top - plot.bottom;

  const x = useCallback(
    (tYears: number) =>
      plot.left +
      (tYears / Math.max(points.at(-1)?.tYears ?? 1, 1e-6)) * innerW,
    [points, innerW, plot.left]
  );

  const yRate = useCallback(
    (q: number) => plot.top + innerH - ((q - 0) / (maxQ + padQ)) * innerH,
    [maxQ, padQ, innerH, plot.top]
  );

  const yCum = useCallback(
    (Np: number) => plot.top + innerH - ((Np - 0) / (maxNp + padNp)) * innerH,
    [maxNp, padNp, innerH, plot.top]
  );

  const ratePath = useMemo(() => {
    if (!points.length) return "";
    return points
      .map(
        (p, i) =>
          `${i ? "L" : "M"} ${x(p.tYears).toFixed(2)} ${yRate(p.q).toFixed(2)}`
      )
      .join(" ");
  }, [points, x, yRate]);

  const cumPath = useMemo(() => {
    if (!points.length) return "";
    return points
      .map(
        (p, i) =>
          `${i ? "L" : "M"} ${x(p.tYears).toFixed(2)} ${yCum(p.Np).toFixed(2)}`
      )
      .join(" ");
  }, [points, x, yCum]);

  const remainingAreaPath = useMemo(() => {
    // Fill between Np(t) and EUR for a "remaining reserves" vibe
    if (!points.length) return "";
    const topPath = points
      .map(
        (p, i) =>
          `${i ? "L" : "M"} ${x(p.tYears).toFixed(2)} ${yCum(p.Np).toFixed(2)}`
      )
      .join(" ");
    const last = points.at(-1)!;
    const baseTo = `L ${x(last.tYears).toFixed(2)} ${yCum(EUR).toFixed(
      2
    )} L ${x(points[0].tYears).toFixed(2)} ${yCum(EUR).toFixed(2)} Z`;
    return topPath + " " + baseTo;
  }, [points, EUR, x, yCum]);

  const bg = dark ? "#0b1020" : "#f7f9ff";
  const fg = dark ? "#e6efff" : "#1a2233";
  const accentA = dark ? "#58b6ff" : "#0066cc";
  const accentB = dark ? "#6affc9" : "#009966";
  const accentC = dark ? "#ff9f6a" : "#d45500";

  return (
    <div
      style={{
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system",
        color: fg,
      }}
    >
      <style>{`
        .rd-card {
          background: ${bg};
          border: 1px solid ${dark ? "#1b2340" : "#ccd6ff"};
          border-radius: 16px;
          overflow: hidden;
          box-shadow: ${
            dark
              ? "0 10px 30px rgba(0,0,0,0.4)"
              : "0 10px 30px rgba(0,30,80,0.12)"
          };
        }
        .rd-title {
          display:flex; align-items:center; justify-content:space-between;
          padding: 14px 18px; border-bottom: 1px dashed ${
            dark ? "#253055" : "#dbe5ff"
          };
          background: linear-gradient(90deg, ${
            dark ? "#0b1020" : "#eef3ff"
          } 0%, transparent 100%);
        }
        .rd-chips { display:flex; gap:8px; flex-wrap:wrap; }
        .chip {
          font-size:12px; padding:6px 10px; border-radius:999px; border:1px solid ${
            dark ? "#253055" : "#cfe0ff"
          };
          background:${dark ? "rgba(255,255,255,0.04)" : "white"};
        }
        .rd-controls { display:grid; grid-template-columns: repeat(5, minmax(160px, 1fr)); gap:12px; padding:14px 18px; }
        .field { display:flex; flex-direction:column; gap:6px; }
        .field input[type=range]{ width:100%; }
        .field input, .field select {
          background:${dark ? "#0e142a" : "white"}; color:${fg};
          border:1px solid ${dark ? "#243055" : "#cfe0ff"};
          height:36px; border-radius:8px; padding:0 10px;
        }
        .toggle { display:flex; align-items:center; gap:8px; font-size:13px; }
        .legend { display:flex; gap:16px; align-items:center; padding: 6px 18px 16px; }
        .pill { display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:999px; border:1px solid ${
          dark ? "#243055" : "#cfe0ff"
        }; font-size:12px;}
        .swatch { width:10px; height:10px; border-radius:2px; }
        .rd-footer { display:flex; gap:16px; padding:12px 18px 16px; flex-wrap:wrap; }
        .badge {
          padding:10px 14px; border-radius:12px; border:1px solid ${
            dark ? "#243055" : "#cfe0ff"
          };
          background:${dark ? "rgba(255,255,255,0.03)" : "#ffffff"};
          display:flex; flex-direction:column; gap:4px; min-width:180px;
        }
        .badge .k { font-size:12px; opacity:0.75 }
        .badge .v { font-weight:700 }
        .schematic {
          position:absolute; right:22px; top:70px; width:110px; height:270px;
          border-left:2px dashed ${dark ? "#2a375f" : "#cfe0ff"};
          pointer-events:none; opacity:${dark ? 0.35 : 0.5};
        }
        .schematic .well {
          position:absolute; left:44px; top:10px; bottom:10px; width:4px; background: ${
            dark ? "#7aaaff" : "#004bcc"
          };
          box-shadow: 0 0 10px ${
            dark ? "rgba(90,140,255,0.5)" : "rgba(0,60,200,0.25)"
          };
        }
        .perf { position:absolute; left:38px; width:16px; height:2px; background:${
          dark ? "#ffb780" : "#d45500"
        }; }
      `}</style>

      <div className="rd-card">
        {/* Header */}
        <div className="rd-title">
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>
              Reservoir Dreamscape • Decline Curve & Reserves
            </div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Arps DCA · EUR & Remaining Reserves · Economic Limit · Pretty SVGs
            </div>
          </div>
          <div className="rd-chips">
            <div className="chip">
              Porosity ~ {(maxMode ? 0.14 : 0.1).toFixed(2)}
            </div>
            <div className="chip">Permeability ~ {maxMode ? 45 : 12} mD</div>
            <div className="chip">Net Pay ~ {maxMode ? 62 : 40} ft</div>
            <div className="chip">
              GOR ~ {fluid === "gas" ? "—" : "900 scf/STB"}
            </div>
            <div className="chip">Depth ~ 9,850 ft TVD</div>
          </div>
        </div>

        {/* Controls */}
        <div className="rd-controls">
          <div className="field">
            <label>
              Initial Rate, q<sub>i</sub> ({unit})
            </label>
            <input
              type="range"
              min={100}
              max={5000}
              step={10}
              value={qiLive}
              onChange={(e) => setQi(parseFloat(e.target.value))}
            />
            <input
              type="number"
              value={qiLive}
              onChange={(e) => setQi(parseFloat(e.target.value || "0"))}
            />
          </div>
          <div className="field">
            <label>
              Initial Decline, D<sub>i</sub> (1/yr)
            </label>
            <input
              type="range"
              min={0.05}
              max={2.0}
              step={0.01}
              value={DiLive}
              onChange={(e) => setDi(parseFloat(e.target.value))}
            />
            <input
              type="number"
              step={0.01}
              value={DiLive}
              onChange={(e) => setDi(parseFloat(e.target.value || "0"))}
            />
          </div>
          <div className="field">
            <label>Arps b-factor</label>
            <input
              type="range"
              min={0}
              max={0.99}
              step={0.01}
              value={bLive}
              onChange={(e) => setB(parseFloat(e.target.value))}
            />
            <input
              type="number"
              step={0.01}
              value={bLive}
              onChange={(e) =>
                setB(clamp(parseFloat(e.target.value || "0"), 0, 0.99))
              }
            />
          </div>
          <div className="field">
            <label>
              Economic Limit q<sub>econ</sub> ({unit})
            </label>
            <input
              type="range"
              min={1}
              max={400}
              step={1}
              value={qEconLive}
              onChange={(e) => setQEcon(parseFloat(e.target.value))}
            />
            <input
              type="number"
              step={1}
              value={qEconLive}
              onChange={(e) => setQEcon(parseFloat(e.target.value || "0"))}
            />
          </div>
          <div className="field" style={{ justifyContent: "center" }}>
            <label className="toggle">
              <input
                type="checkbox"
                checked={maxMode}
                onChange={(e) => setMaxMode(e.target.checked)}
              />
              &quot;Maximum Reserves&quot; (long tail mode)
            </label>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Nudges b↑, D<sub>i</sub>↓, q<sub>econ</sub>↓
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="legend">
          <div className="pill">
            <span className="swatch" style={{ background: accentA }} /> Rate
            q(t) [{unit}]
          </div>
          <div className="pill">
            <span className="swatch" style={{ background: accentB }} />{" "}
            Cumulative N<sub>p</sub>(t)
          </div>
          <div className="pill">
            <span className="swatch" style={{ background: accentC }} />{" "}
            Remaining to EUR
          </div>
        </div>

        {/* Chart */}
        <div style={{ position: "relative", padding: "0 12px 8px" }}>
          <svg
            width="100%"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="Decline and reserves chart"
          >
            <defs>
              <linearGradient id="gradRate" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={accentA} stopOpacity="0.95" />
                <stop offset="100%" stopColor={accentA} stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="gradCum" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={accentB} stopOpacity="0.95" />
                <stop offset="100%" stopColor={accentB} stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="bgNebula" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor={dark ? "#0f1632" : "#eef3ff"} />
                <stop offset="100%" stopColor={dark ? "#0a0f24" : "#f8fbff"} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* background */}
            <rect x="0" y="0" width={W} height={H} fill="url(#bgNebula)" />

            {/* grid */}
            {Array.from({ length: 6 }).map((_, i) => {
              const y = plot.top + (i / 5) * innerH;
              return (
                <line
                  key={`h${i}`}
                  x1={plot.left}
                  y1={y}
                  x2={W - plot.right}
                  y2={y}
                  stroke={dark ? "#1a2444" : "#e3ecff"}
                  strokeDasharray="4 6"
                  strokeWidth="1"
                />
              );
            })}
            {Array.from({ length: 11 }).map((_, i) => {
              const xg = plot.left + (i / 10) * innerW;
              return (
                <line
                  key={`v${i}`}
                  x1={xg}
                  y1={plot.top}
                  x2={xg}
                  y2={H - plot.bottom}
                  stroke={dark ? "#121a33" : "#eef3ff"}
                  strokeDasharray="3 9"
                  strokeWidth="1"
                />
              );
            })}

            {/* axes labels */}
            <text x={plot.left} y={plot.top - 8} fontSize="12" fill={fg}>
              q(t), {unit}
            </text>
            <text
              x={W - plot.right}
              y={plot.top - 8}
              fontSize="12"
              textAnchor="end"
              fill={fg}
            >
              Nₚ(t), cumulative
            </text>
            <text
              x={W / 2}
              y={H - 12}
              fontSize="12"
              textAnchor="middle"
              fill={fg}
            >
              Time (years)
            </text>

            {/* axes ticks */}
            {Array.from({ length: 11 }).map((_, i) => {
              const t = (points.at(-1)?.tYears ?? 10) * (i / 10);
              const xt = x(t);
              return (
                <g key={`xt${i}`}>
                  <line
                    x1={xt}
                    x2={xt}
                    y1={H - plot.bottom}
                    y2={H - plot.bottom + 6}
                    stroke={fg}
                  />
                  <text
                    x={xt}
                    y={H - plot.bottom + 20}
                    fontSize="11"
                    textAnchor="middle"
                    fill={fg}
                  >
                    {t.toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* y left (rate) ticks */}
            {Array.from({ length: 6 }).map((_, i) => {
              const qv = (maxQ + padQ) * (1 - i / 5);
              const yy = yRate(qv);
              return (
                <g key={`yl${i}`}>
                  <line
                    x1={plot.left - 6}
                    x2={plot.left}
                    y1={yy}
                    y2={yy}
                    stroke={fg}
                  />
                  <text
                    x={plot.left - 10}
                    y={yy + 4}
                    fontSize="11"
                    textAnchor="end"
                    fill={fg}
                  >
                    {formatNumber(qv, "")}
                  </text>
                </g>
              );
            })}

            {/* y right (cum) ticks */}
            {Array.from({ length: 6 }).map((_, i) => {
              const Nv = (maxNp + padNp) * (1 - i / 5);
              const yy = yCum(Nv);
              return (
                <g key={`yr${i}`}>
                  <line
                    x1={W - plot.right}
                    x2={W - plot.right + 6}
                    y1={yy}
                    y2={yy}
                    stroke={fg}
                  />
                  <text
                    x={W - plot.right + 10}
                    y={yy + 4}
                    fontSize="11"
                    fill={fg}
                  >
                    {formatVolume(Nv, fluid)}
                  </text>
                </g>
              );
            })}

            {/* remaining reserves area */}
            <path d={remainingAreaPath} fill={accentC} opacity="0.18" />

            {/* cumulative curve */}
            <path
              d={cumPath}
              stroke="url(#gradCum)"
              strokeWidth="3"
              fill="none"
              filter="url(#glow)"
            />

            {/* rate curve */}
            <path
              d={ratePath}
              stroke="url(#gradRate)"
              strokeWidth="3"
              fill="none"
              filter="url(#glow)"
            />

            {/* econ limit line */}
            <line
              x1={plot.left}
              x2={W - plot.right}
              y1={yRate(qEconEff)}
              y2={yRate(qEconEff)}
              stroke={accentC}
              strokeDasharray="6 6"
            />
            <text
              x={plot.left + 6}
              y={yRate(qEconEff) - 6}
              fontSize="12"
              fill={accentC}
            >
              qₑ₍ₑcₒₙ₎ = {formatNumber(qEconEff, unit)}
            </text>
          </svg>

          {/* tiny well schematic */}
          <div className="schematic" aria-hidden>
            <div className="well" />
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="perf" style={{ top: 30 + i * 30 }} />
            ))}
          </div>
        </div>

        {/* KPI badges */}
        <div className="rd-footer">
          <div className="badge">
            <div className="k">EUR (to qₑcₒₙ)</div>
            <div className="v">{formatVolume(EUR, fluid)}</div>
          </div>
          <div className="badge">
            <div className="k">Remaining Reserves</div>
            <div className="v">
              {formatVolume(Math.max(EUR - (points.at(-1)?.Np ?? 0), 0), fluid)}
            </div>
          </div>
          <div className="badge">
            <div className="k">q @ 5 years</div>
            <div className="v">{formatNumber(qAt5y, unit)}</div>
          </div>
          <div className="badge">
            <div className="k">Cum @ 5 years</div>
            <div className="v">{formatVolume(cumAt5y, fluid)}</div>
          </div>
          <div className="badge">
            <div className="k">
              T<sub>econ</sub>
            </div>
            <div className="v">
              {tEcon === Infinity ? "—" : `${tEcon.toFixed(2)} yrs`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservoirDreamscape;
