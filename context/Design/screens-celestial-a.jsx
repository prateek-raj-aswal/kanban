/* screens-celestial-a.jsx
   Celestial & Seasonal Environment — Part A
   ─ Celestial Atrium · master environmental dashboard
   ─ Day Cycle · 5 states across a single day
*/

/* ════════════════════════════════════════════════════════
   SHARED CELESTIAL ATOMS
   ════════════════════════════════════════════════════════ */

// Moon phase SVG (radius default 36). illum: 0..1, waxing: bool
function MoonGlyph({ size=72, illum=0.85, waxing=true, glow=true, dim=false }) {
  const r = size/2;
  const surface = dim ? "#cdd2e6" : "#e8edf7";
  const dark    = "#0b0d18";
  // We render a circle, then carve out the shadow with an ellipse path that mirrors illum.
  // Approach: full bright disc, then dark side as ellipse + half-mask via path.
  // For simplicity, build a moon path using two arcs.
  const lit = (1 - illum); // fraction occluded
  // ellipse x-radius for terminator
  const ex = r * (1 - 2*illum); // negative when more than half illuminated
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display:"block" }}>
      <defs>
        <radialGradient id={`moon-surface-${size}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".95"/>
          <stop offset="60%" stopColor={surface} stopOpacity=".75"/>
          <stop offset="100%" stopColor="#8c93b3" stopOpacity=".55"/>
        </radialGradient>
        <radialGradient id={`moon-glow-${size}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".22"/>
          <stop offset="60%" stopColor="#cdd2e6" stopOpacity=".06"/>
          <stop offset="100%" stopColor="#cdd2e6" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {glow && <circle cx={r} cy={r} r={r*1.4} fill={`url(#moon-glow-${size})`}/>}
      {/* lit disc */}
      <circle cx={r} cy={r} r={r*.86} fill={`url(#moon-surface-${size})`}/>
      {/* shadow side: draw an arc + ellipse */}
      {illum < 1 && illum > 0 && (
        <path
          d={`
            M ${r} ${r - r*.86}
            A ${r*.86} ${r*.86} 0 0 ${waxing ? 0 : 1} ${r} ${r + r*.86}
            A ${Math.abs(ex)*.86} ${r*.86} 0 0 ${(waxing ? (ex < 0 ? 0 : 1) : (ex < 0 ? 1 : 0))} ${r} ${r - r*.86}
            Z`}
          fill={dark}
          opacity=".88"/>
      )}
      {illum === 0 && <circle cx={r} cy={r} r={r*.86} fill={dark}/>}
      {/* subtle craters */}
      <circle cx={r*1.15} cy={r*.85} r={r*.06} fill="#7a809e" opacity=".25"/>
      <circle cx={r*.85} cy={r*1.15} r={r*.04} fill="#7a809e" opacity=".22"/>
      <circle cx={r*1.25} cy={r*1.2}  r={r*.05} fill="#7a809e" opacity=".18"/>
    </svg>
  );
}

// Sky scene: a generative SVG that takes a time-of-day and renders a band
function SkyScene({ width=860, height=300, time="dawn", season="spring", showMoon=true, showSun=true, sunPos=0.4, moonPos=0.7, weather="clear" }) {
  // palette by time-of-day
  const palettes = {
    dawn:    [["#1a1734","#3a2a55","#a86a4e","#e0a070"], "#ffd28a", "#cdd2e6"],
    morning: [["#1f2a55","#3a5a8c","#7aa8d8","#d4e0f0"], "#ffe9a8", "#dde2f0"],
    noon:    [["#1d3d6b","#3e7bbf","#7ec0e8","#cce4f5"], "#fff3c0", "#ffffff"],
    evening: [["#1a1226","#3a1f4f","#7a3a6e","#d97a6c"], "#ff7e5a", "#e6d3ff"],
    night:   [["#04050d","#0a0d20","#1a2042","#2a3260"], "#fff0c0", "#e8edf7"],
    midnight:[["#020308","#04060f","#0a0d20","#161a30"], "#fff0c0", "#e8edf7"]
  };
  const [grad, sunColor, moonColor] = palettes[time] || palettes.night;

  // season particles
  const particles = (() => {
    const arr = [];
    const n = 28;
    for (let i=0;i<n;i++) {
      arr.push({
        x: ((i*53)%100)/100,
        y: ((i*31)%100)/100,
        r: ((i%4))*0.6 + 0.4,
        op: ((i%5)/5)*0.5 + 0.2
      });
    }
    return arr;
  })();

  // stars layer (visible at night)
  const starsVisible = time === "night" || time === "midnight" || time === "evening" || time === "dawn";
  const stars = (() => {
    if (!starsVisible) return [];
    const arr = [];
    for (let i=0;i<60;i++) {
      arr.push({
        x: ((i*71)%100)/100,
        y: ((i*37)%70)/100,
        r: (i%6 === 0) ? 1.6 : 0.8,
        op: ((i*13)%80)/100 + 0.15
      });
    }
    return arr;
  })();

  // sun and moon trajectory: arc across the band
  const arc = (t) => {
    const x = 60 + t*(width-120);
    const y = height*0.92 - Math.sin(t*Math.PI) * (height*0.65);
    return [x, y];
  };
  const [sx, sy] = arc(sunPos);
  const [mx, my] = arc(moonPos);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display:"block", borderRadius:14 }}>
      <defs>
        <linearGradient id={`sky-${time}`} x1="0" y1="0" x2="0" y2="1">
          {grad.map((c, i) => (
            <stop key={i} offset={`${(i/(grad.length-1))*100}%`} stopColor={c}/>
          ))}
        </linearGradient>
        <radialGradient id={`sun-${time}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={sunColor} stopOpacity="1"/>
          <stop offset="40%" stopColor={sunColor} stopOpacity=".5"/>
          <stop offset="100%" stopColor={sunColor} stopOpacity="0"/>
        </radialGradient>
        <linearGradient id={`horizon-${time}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={grad[grad.length-1]} stopOpacity="0"/>
          <stop offset="100%" stopColor={grad[grad.length-1]} stopOpacity=".5"/>
        </linearGradient>
      </defs>

      {/* sky */}
      <rect x="0" y="0" width={width} height={height} fill={`url(#sky-${time})`}/>

      {/* stars */}
      {stars.map((s, i) => (
        <circle key={i} cx={s.x*width} cy={s.y*height*0.65} r={s.r} fill="#fff" opacity={s.op}>
          {(i%9 === 0) && <animate attributeName="opacity" values={`${s.op};${s.op*0.4};${s.op}`} dur={`${3+i%4}s`} repeatCount="indefinite"/>}
        </circle>
      ))}

      {/* sun */}
      {showSun && time !== "midnight" && time !== "night" && (
        <g>
          <circle cx={sx} cy={sy} r={48} fill={`url(#sun-${time})`}/>
          <circle cx={sx} cy={sy} r={18} fill={sunColor} style={{ filter:`drop-shadow(0 0 18px ${sunColor})` }}/>
        </g>
      )}

      {/* moon (inline simple render) */}
      {showMoon && (time === "night" || time === "midnight" || time === "evening" || time === "dawn") && (
        <g transform={`translate(${mx} ${my})`}>
          <circle r="32" fill={moonColor} opacity=".18"/>
          <circle r="18" fill={moonColor} opacity=".95" style={{ filter:`drop-shadow(0 0 10px ${moonColor})` }}/>
          {/* terminator shadow — 85% illuminated waxing */}
          <ellipse rx="5" ry="18" fill="#0b0d18" opacity=".75"/>
          <circle cx="-5" cy="-4" r="2.4" fill="#7a809e" opacity=".4"/>
          <circle cx="6" cy="6" r="1.8" fill="#7a809e" opacity=".3"/>
        </g>
      )}

      {/* sun/moon arc trajectory line */}
      <path d={`M 60 ${height*0.92} Q ${width/2} ${height*0.18} ${width-60} ${height*0.92}`}
        fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1" strokeDasharray="2 5"/>

      {/* horizon mist */}
      <rect x="0" y={height*0.65} width={width} height={height*0.35} fill={`url(#horizon-${time})`}/>

      {/* skyline silhouette — futuristic city */}
      <g opacity={time === "midnight" || time === "night" ? 0.95 : 0.85}>
        <path d={`
          M 0 ${height}
          L 0 ${height*0.78}
          L 40 ${height*0.78} L 40 ${height*0.66} L 80 ${height*0.66} L 80 ${height*0.72}
          L 120 ${height*0.72} L 120 ${height*0.58} L 160 ${height*0.58} L 160 ${height*0.70}
          L 200 ${height*0.70} L 200 ${height*0.62} L 240 ${height*0.62} L 240 ${height*0.50}
          L 280 ${height*0.50} L 280 ${height*0.66} L 340 ${height*0.66} L 340 ${height*0.74}
          L 380 ${height*0.74} L 380 ${height*0.56} L 430 ${height*0.56} L 430 ${height*0.68}
          L 480 ${height*0.68} L 480 ${height*0.46} L 520 ${height*0.46} L 520 ${height*0.60}
          L 580 ${height*0.60} L 580 ${height*0.72} L 640 ${height*0.72} L 640 ${height*0.64}
          L 700 ${height*0.64} L 700 ${height*0.76} L 760 ${height*0.76} L 760 ${height*0.68}
          L 820 ${height*0.68} L 820 ${height*0.80} L ${width} ${height*0.80}
          L ${width} ${height} Z
        `} fill="rgba(4,6,12,.7)"/>
        {/* city window lights — at night */}
        {(time === "night" || time === "midnight" || time === "evening") && (
          <g>
            {Array.from({length:50}).map((_, i) => {
              const x = (i*43) % (width-40) + 20;
              const y = height*0.78 + ((i*17)%(height*0.15));
              const op = ((i*11)%60)/100 + 0.2;
              return <rect key={i} x={x} y={y} width="2" height="2" fill="#ffe7a8" opacity={op}/>;
            })}
          </g>
        )}
      </g>

      {/* weather particles */}
      {weather === "rain" && Array.from({length:40}).map((_, i) => (
        <line key={i} x1={(i*53)%width} y1={(i*23)%height} x2={(i*53)%width + 1} y2={(i*23)%height + 8}
          stroke="rgba(160,200,255,.35)" strokeWidth="1"/>
      ))}
      {weather === "snow" && Array.from({length:30}).map((_, i) => (
        <circle key={i} cx={(i*47)%width} cy={(i*29)%height} r="1.4" fill="rgba(220,235,255,.55)"/>
      ))}
      {weather === "fog" && (
        <rect x="0" y={height*0.5} width={width} height={height*0.4} fill="rgba(220,225,240,.08)"/>
      )}

      {/* season tint */}
      {season === "autumn" && Array.from({length:18}).map((_, i) => (
        <circle key={i} cx={(i*61)%width} cy={(i*41)%(height*0.7)} r="1.6" fill="#e08a4a" opacity={.3 + (i%5)/10}/>
      ))}
      {season === "spring" && Array.from({length:14}).map((_, i) => (
        <circle key={i} cx={(i*51)%width} cy={(i*37)%(height*0.7)} r="1.4" fill="#7ad99a" opacity={.25 + (i%5)/10}/>
      ))}
    </svg>
  );
}

/* ════════════════════════════════════════════════════════
   1 — CELESTIAL ATRIUM · master environmental dashboard
   ════════════════════════════════════════════════════════ */

function ScreenCelestialAtrium() {
  return (
    <div className="scr" style={{ display:"flex" }}>
      <SideNav active="dashboard"/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
        <TopBar title="Celestial Atrium · World State" crumb="ENVIRONMENT / ATRIUM" clock="20:14:08" energy={62}/>

        <div className="scrollY" style={{ flex:1, padding:"22px 26px", display:"grid", gridTemplateColumns:"1fr", gap:18 }}>

          {/* HERO: SKY SCENE */}
          <section className="panel" style={{ padding:0, position:"relative", overflow:"hidden", borderRadius:14 }}>
            <div style={{ position:"relative" }}>
              <SkyScene width={1300} height={340} time="evening" season="spring" sunPos={0.84} moonPos={0.38} weather="clear"/>

              {/* overlay HUD */}
              <div style={{ position:"absolute", inset:0, padding:"22px 28px", display:"flex", flexDirection:"column", justifyContent:"space-between", pointerEvents:"none" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,.7)", letterSpacing:".34em" }}>◯ ◯ ◯  &nbsp; WORLD STATE · LIVE  &nbsp; ◯ ◯ ◯</div>
                    <h1 className="h-display" style={{ fontSize:38, margin:"8px 0 4px", color:"#fff", textShadow:"0 2px 18px rgba(0,0,0,.6)" }}>
                      Tuesday Dusk · 20:14
                    </h1>
                    <div style={{ fontSize:13, color:"rgba(255,255,255,.78)", textShadow:"0 1px 6px rgba(0,0,0,.6)" }}>
                      26.MAY.2026 · Day 41 of Spring · Waxing Gibbous · 85% illuminated
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,.7)", letterSpacing:".22em" }}>SUNSET · 20:42</div>
                    <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,.55)", letterSpacing:".22em", marginTop:3 }}>MOONRISE · 19:08</div>
                    <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,.55)", letterSpacing:".22em", marginTop:3 }}>NEXT FULL · 31.MAY · 4d 6h</div>
                  </div>
                </div>

                {/* lower band tags */}
                <div style={{ display:"flex", gap:10 }}>
                  <span className="mono" style={{ padding:"6px 10px", borderRadius:4, border:"1px solid rgba(255,255,255,.25)", background:"rgba(0,0,0,.35)", fontSize:10, color:"#ffd28a", letterSpacing:".22em" }}>◐ EVENING</span>
                  <span className="mono" style={{ padding:"6px 10px", borderRadius:4, border:"1px solid rgba(255,255,255,.25)", background:"rgba(0,0,0,.35)", fontSize:10, color:"#7ad99a", letterSpacing:".22em" }}>✿ SPRING · D41</span>
                  <span className="mono" style={{ padding:"6px 10px", borderRadius:4, border:"1px solid rgba(255,255,255,.25)", background:"rgba(0,0,0,.35)", fontSize:10, color:"#cdd2e6", letterSpacing:".22em" }}>☾ WAXING GIBBOUS · 85%</span>
                  <span className="mono" style={{ padding:"6px 10px", borderRadius:4, border:"1px solid rgba(255,255,255,.25)", background:"rgba(0,0,0,.35)", fontSize:10, color:"#cce4f5", letterSpacing:".22em" }}>≋ WEATHER · CLEAR</span>
                  <span className="mono" style={{ padding:"6px 10px", borderRadius:4, border:"1px solid rgba(78,161,255,.45)", background:"rgba(78,161,255,.18)", fontSize:10, color:"#7cc4ff", letterSpacing:".22em" }}>✦ AURA · CLIMBING</span>
                </div>
              </div>
            </div>
          </section>

          {/* SECONDARY GRID */}
          <div style={{ display:"grid", gridTemplateColumns:".95fr 1.1fr .95fr", gap:18 }}>

            {/* DAY POSITION */}
            <section className="panel" style={{ padding:20, position:"relative" }}>
              <PanelHead eyebrow="◐ DAY POSITION · LOCAL" title="Where you are in the cycle"/>
              <div style={{ position:"relative", padding:"10px 0 6px" }}>
                <svg viewBox="0 0 360 160" width="100%" height="160" style={{ display:"block" }}>
                  <defs>
                    <linearGradient id="day-band" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%"   stopColor="#1a1734"/>
                      <stop offset="20%"  stopColor="#a86a4e"/>
                      <stop offset="40%"  stopColor="#7ec0e8"/>
                      <stop offset="60%"  stopColor="#fff3c0"/>
                      <stop offset="80%"  stopColor="#d97a6c"/>
                      <stop offset="100%" stopColor="#0a0d20"/>
                    </linearGradient>
                  </defs>
                  {/* arc */}
                  <path d="M 30 140 Q 180 -20 330 140" fill="none" stroke="url(#day-band)" strokeWidth="3" strokeLinecap="round"/>
                  {/* tick markers */}
                  {[
                    { t:0,    h:"00", l:"midnight" },
                    { t:.25, h:"06", l:"dawn" },
                    { t:.5,  h:"12", l:"noon" },
                    { t:.75, h:"18", l:"dusk" },
                    { t:1,   h:"24", l:"midnight" }
                  ].map((p, i) => {
                    const x = 30 + p.t*300;
                    const y = 140 - Math.sin(p.t*Math.PI)*160;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="3" fill="rgba(255,255,255,.7)"/>
                        <text x={x} y={150} textAnchor="middle" style={{ fontFamily:"var(--ff-mono)", fontSize:9, fill:"var(--text-dim)", letterSpacing:".14em" }}>{p.h}</text>
                      </g>
                    );
                  })}
                  {/* sun marker */}
                  {(() => {
                    const t = 20.23/24;
                    const x = 30 + t*300;
                    const y = 140 - Math.sin(t*Math.PI)*160;
                    return (
                      <g>
                        <circle cx={x} cy={y} r="14" fill="#d97a6c" opacity=".35"/>
                        <circle cx={x} cy={y} r="6" fill="#ff7e5a" style={{ filter:"drop-shadow(0 0 8px #d97a6c)" }}/>
                        <text x={x} y={y-18} textAnchor="middle" style={{ fontFamily:"var(--ff-mono)", fontSize:10, fill:"#ff9078", letterSpacing:".18em" }}>NOW</text>
                      </g>
                    );
                  })()}
                </svg>
              </div>
              <div className="divider" style={{ margin:"8px 0 12px" }}/>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {[
                  ["Morning",   "warm sunrise · soft golden",  "#ffd28a", false],
                  ["Afternoon", "bright clarity · stronger contrast", "#7ec0e8", false],
                  ["Evening",   "softer neon · dusk gradients", "#d97a6c", true],
                  ["Night",     "moonlight · ambient stars",   "#7a8cb8", false],
                  ["Midnight",  "deep atmospheric · introspective", "#3a4060", false]
                ].map(([n, d, c, active]) => (
                  <div key={n} style={{ display:"grid", gridTemplateColumns:"10px 80px 1fr", gap:10, alignItems:"center", padding:"3px 0" }}>
                    <span style={{ width:8, height:8, borderRadius:8, background: active ? c : "transparent", border:`1px solid ${c}55`, boxShadow: active ? `0 0 8px ${c}` : "none" }}/>
                    <span style={{ fontSize:11, color: active ? c : "var(--text-md)", fontWeight: active ? 600 : 400 }}>{n}</span>
                    <span className="mono" style={{ fontSize:9, color:"var(--text-lo)", letterSpacing:".14em" }}>{d}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* MOON · LUNAR RESONANCE */}
            <section className="panel" style={{ padding:20, position:"relative" }}>
              <PanelHead eyebrow="☾ LUNAR RESONANCE" title="Current phase"
                right={<span className="mono" style={{ fontSize:10, color:"var(--c-cyan)" }}>+8% NIGHT GLOW</span>}/>
              <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:18, alignItems:"center" }}>
                <div style={{ position:"relative" }}>
                  <MoonGlyph size={140} illum={0.85} waxing/>
                  <div style={{ position:"absolute", inset:-18, borderRadius:"50%", border:"1px dashed rgba(205,210,230,.25)" }}/>
                </div>
                <div>
                  <div style={{ fontSize:11, color:"var(--text-lo)", letterSpacing:".22em", fontFamily:"var(--ff-mono)" }}>26.MAY.2026</div>
                  <div style={{ fontSize:20, fontWeight:700, marginTop:6, color:"#e8edf7" }}>Waxing Gibbous</div>
                  <div className="mono" style={{ fontSize:11, color:"var(--c-cyan)", marginTop:3 }}>85% illuminated · age 11d</div>
                  <div style={{ fontSize:12, color:"var(--text-md)", marginTop:10, lineHeight:1.5 }}>
                    The system reads a brighter atmospheric tone. Night animations gain a soft silver lift. Discipline streaks compound with lunar resonance during the gibbous window.
                  </div>
                </div>
              </div>

              <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:4 }}>
                {[
                  { l:"new",         i:0,    a:false },
                  { l:"first qrtr",  i:0.5,  a:false },
                  { l:"full",        i:1,    a:false },
                  { l:"last qrtr",   i:0.5,  a:false }
                ].map((m, k) => (
                  <div key={k} style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"6px 0", borderRadius:6, background:"rgba(255,255,255,.02)" }}>
                    <MoonGlyph size={24} illum={m.i} waxing={k<2} glow={false} dim/>
                    <span className="mono" style={{ fontSize:8, color:"var(--text-dim)", letterSpacing:".14em", marginTop:4 }}>{m.l.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* SEASON · SPRING ARC */}
            <section className="panel" style={{ padding:20, position:"relative" }}>
              <PanelHead eyebrow="✿ SEASON · SPRING" title="Day 41 of 92"
                right={<span className="mono" style={{ fontSize:10, color:"#7ad99a" }}>RENEWAL ARC</span>}/>
              <div style={{ marginTop:4 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"var(--text-lo)", fontFamily:"var(--ff-mono)", letterSpacing:".14em" }}>
                  <span>20.MAR · EQUINOX</span>
                  <span>21.JUN · SOLSTICE</span>
                </div>
                <div className="xpbar" style={{ marginTop:6, height:5 }}>
                  <i style={{ width:"45%", background:"linear-gradient(90deg, #7ad99a, #c4e8a0)", boxShadow:"0 0 10px rgba(122,217,154,.5)" }}/>
                </div>
                <div className="mono" style={{ marginTop:6, fontSize:9, color:"#7ad99a", letterSpacing:".14em" }}>45% THROUGH · 51 DAYS REMAINING</div>
              </div>

              <div className="divider" style={{ margin:"14px 0" }}/>

              <div className="mono" style={{ fontSize:9, color:"var(--text-lo)", letterSpacing:".22em", marginBottom:8 }}>SEASONAL EFFECTS · ACTIVE</div>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {[
                  { l:"Soft greens infused",         c:"#7ad99a" },
                  { l:"Bloom particles · subtle",    c:"#c4e8a0" },
                  { l:"Renewal aura tint · +6%",     c:"#a8d8b0" },
                  { l:"Morning ambient · birdsong",  c:"#cde0a8" }
                ].map((s, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, fontSize:11, color:"var(--text-md)" }}>
                    <span style={{ width:6, height:6, borderRadius:6, background:s.c, boxShadow:`0 0 6px ${s.c}` }}/>
                    {s.l}
                  </div>
                ))}
              </div>

              <div className="divider" style={{ margin:"14px 0" }}/>

              <div className="mono" style={{ fontSize:9, color:"var(--text-lo)", letterSpacing:".22em" }}>UPCOMING TRANSITIONS</div>
              <div style={{ marginTop:8, fontSize:11, color:"var(--text-md)", lineHeight:1.6 }}>
                <div>21.JUN — <span style={{ color:"#f5c451" }}>Summer arc begins</span></div>
                <div>22.SEP — <span style={{ color:"#e08a4a" }}>Autumn · reflective mood</span></div>
                <div>21.DEC — <span style={{ color:"#7cc4ff" }}>Winter · frost atmosphere</span></div>
              </div>
            </section>

          </div>

          {/* ATMOSPHERIC OVERLAYS */}
          <section className="panel" style={{ padding:20, position:"relative" }}>
            <PanelHead eyebrow="≋ ATMOSPHERIC OVERLAYS" title="Weather mirroring inner state"
              right={<span className="mono" style={{ fontSize:10, color:"var(--c-cyan)" }}>1 ACTIVE · 4 STANDBY</span>}/>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
              {[
                { name:"Clear Skies",  ev:"peak momentum",  c:"#7cc4ff", glyph:"◯", active:true },
                { name:"Drifting Fog", ev:"recovery period", c:"#cdd2e6", glyph:"≋", active:false },
                { name:"Rain Veil",    ev:"burnout window",  c:"#7a8cb8", glyph:"⋮", active:false },
                { name:"Storm Edge",   ev:"instability spike",c:"#ff8a9a",glyph:"⌇", active:false },
                { name:"Aurora",       ev:"major milestone", c:"#b07cff", glyph:"✧", active:false }
              ].map((w, i) => (
                <div key={i} style={{
                  position:"relative", padding:"14px 14px 12px",
                  border: `1px solid ${w.active ? w.c+"55" : "var(--hl)"}`,
                  background: w.active ? `linear-gradient(180deg, ${w.c}12, transparent)` : "rgba(255,255,255,.015)",
                  borderRadius:10
                }}>
                  {w.active && <Brackets color={w.c+"66"} inset={4}/>}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:24, color:w.c }}>{w.glyph}</span>
                    {w.active && <span className="mono" style={{ fontSize:9, color:w.c, letterSpacing:".22em" }}>● LIVE</span>}
                  </div>
                  <div style={{ fontSize:13, fontWeight:600, marginTop:10, color: w.active ? w.c : "var(--text-hi)" }}>{w.name}</div>
                  <div className="mono" style={{ fontSize:9, color:"var(--text-dim)", marginTop:4, letterSpacing:".14em" }}>WHEN · {w.ev.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   2 — DAY CYCLE STATES · 5 versions of the dashboard
   ════════════════════════════════════════════════════════ */

function CycleCard({ time, title, hour, palette, sunMoon, accent, message, energy, momentum }) {
  return (
    <div style={{
      position:"relative", borderRadius:12, overflow:"hidden",
      background: palette.bg,
      border: `1px solid ${palette.border}`,
      height: 460, display:"flex", flexDirection:"column"
    }}>
      <Brackets color={accent+"55"} inset={6}/>

      {/* sky band at top */}
      <div style={{ height:120, position:"relative", overflow:"hidden", borderBottom:`1px solid ${palette.border}` }}>
        <SkyScene width={300} height={120} time={time} season="spring" sunPos={sunMoon.sun} moonPos={sunMoon.moon}/>
      </div>

      {/* content */}
      <div style={{ flex:1, padding:14, display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div className="mono" style={{ fontSize:9, color:accent, letterSpacing:".26em" }}>◐ {time.toUpperCase()}</div>
            <div style={{ fontSize:22, fontWeight:700, marginTop:5, color:palette.text, letterSpacing:"-.01em" }}>{title}</div>
            <div className="mono" style={{ fontSize:9, color:palette.subtext, marginTop:3, letterSpacing:".18em" }}>{hour}</div>
          </div>
          <StatRing value={energy} size={50} stroke={5} color={accent} label={`${energy}`} sub="E"/>
        </div>

        <div style={{ fontSize:11, color:palette.subtext, lineHeight:1.5, marginTop:2 }}>{message}</div>

        {/* mini identity strip */}
        <div style={{ marginTop:"auto", padding:"9px 11px", border:`1px solid ${accent}33`, background: palette.cardBg, borderRadius:8, display:"flex", alignItems:"center", gap:9 }}>
          <Sigil size={32} hue={accent.includes("ff") ? "blue" : "violet"} glyph="K"/>
          <div style={{ flex:1 }}>
            <div className="mono" style={{ fontSize:8, color:palette.subtext, letterSpacing:".22em" }}>OPERATOR · LV 24</div>
            <div style={{ fontSize:11, fontWeight:600, color:palette.text, marginTop:1 }}>Kai Aldrich</div>
          </div>
          <span className="mono" style={{ fontSize:10, color:accent, fontWeight:700 }}>×{momentum.toFixed(1)}</span>
        </div>

        {/* feature list */}
        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
          {palette.features.map((f, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:7, fontSize:10, color:palette.subtext, fontFamily:"var(--ff-mono)", letterSpacing:".06em" }}>
              <span style={{ width:4, height:4, borderRadius:4, background:accent, boxShadow:`0 0 4px ${accent}` }}/>
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScreenDayCycle() {
  return (
    <div className="scr" style={{ display:"flex" }}>
      <SideNav active="dashboard"/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
        <TopBar title="Day Cycle · One UI, Five Atmospheres" crumb="ENVIRONMENT / CYCLE" clock="20:14:08" energy={62}/>

        <div className="scrollY" style={{ flex:1, padding:"22px 26px", display:"grid", gridTemplateColumns:"1fr", gap:18 }}>

          {/* INTRO */}
          <section className="panel" style={{ padding:18, position:"relative" }}>
            <PanelHead
              eyebrow="◇ DAY & NIGHT SYSTEM · LIVE BIND"
              title="The interface follows the sun."
              right={<StateChip label="LOCAL · 26.MAY.2026" state="stable"/>}/>
            <div style={{ fontSize:12, color:"var(--text-md)", maxWidth:780, lineHeight:1.55 }}>
              Five transitions across one rotation. Gradients, motion speed, particle density, and ambient sound all shift with the local clock. You feel the time of day, not just see it.
            </div>
          </section>

          {/* 5 CYCLE CARDS */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
            <CycleCard
              time="dawn"
              title="Morning"
              hour="06:24"
              accent="#ffd28a"
              sunMoon={{ sun:.15, moon:.85 }}
              palette={{
                bg:"radial-gradient(120% 80% at 50% 0%, rgba(255,210,138,.15), transparent 60%), linear-gradient(180deg, #16110a, #0a0807)",
                border:"rgba(255,210,138,.2)",
                text:"#fff",
                subtext:"#c8b89a",
                cardBg:"rgba(255,210,138,.05)",
                features:["WARM SUNRISE GRADIENT", "SOFT GOLDEN LIGHTING", "FOG · LIGHT HAZE", "AWAKENING ANIMATIONS"]
              }}
              message="The system wakes gently. Calm rituals load first."
              energy={68}
              momentum={1.4}
            />
            <CycleCard
              time="noon"
              title="Afternoon"
              hour="13:08"
              accent="#7cc4ff"
              sunMoon={{ sun:.5, moon:1 }}
              palette={{
                bg:"radial-gradient(120% 80% at 50% 0%, rgba(124,196,255,.14), transparent 60%), linear-gradient(180deg, #0a1320, #060a15)",
                border:"rgba(124,196,255,.2)",
                text:"#fff",
                subtext:"#aac3e0",
                cardBg:"rgba(124,196,255,.06)",
                features:["BRIGHT CLARITY", "STRONGER CONTRAST", "ACTIVE MOTION", "PEAK PRODUCTIVITY"]
              }}
              message="Clean energetic clarity. Stronger contrast across the HUD."
              energy={88}
              momentum={1.8}
            />
            <CycleCard
              time="evening"
              title="Evening"
              hour="20:14"
              accent="#d97a6c"
              sunMoon={{ sun:.84, moon:.38 }}
              palette={{
                bg:"radial-gradient(120% 80% at 50% 0%, rgba(217,122,108,.14), transparent 60%), linear-gradient(180deg, #1a0d14, #0c0610)",
                border:"rgba(217,122,108,.22)",
                text:"#fff",
                subtext:"#d8aaa0",
                cardBg:"rgba(217,122,108,.06)",
                features:["SOFTER NEON GLOW", "DUSK GRADIENTS", "RELAXED TRANSITIONS", "REFLECTIVE MOOD"]
              }}
              message="The system slows. Reflection rituals surface. Heat tones."
              energy={62}
              momentum={1.6}
            />
            <CycleCard
              time="night"
              title="Night"
              hour="23:40"
              accent="#7a8cb8"
              sunMoon={{ sun:1.1, moon:.55 }}
              palette={{
                bg:"radial-gradient(120% 80% at 50% 0%, rgba(122,140,184,.12), transparent 60%), linear-gradient(180deg, #06080f, #04060c)",
                border:"rgba(122,140,184,.22)",
                text:"#fff",
                subtext:"#9aa5c4",
                cardBg:"rgba(122,140,184,.06)",
                features:["MOONLIGHT WASH", "AMBIENT STARS", "DEEPER SHADOWS", "QUIETER MOTION"]
              }}
              message="Cinematic dark. The HUD focuses. Quieter animations."
              energy={42}
              momentum={1.2}
            />
            <CycleCard
              time="midnight"
              title="Midnight"
              hour="02:18"
              accent="#3a4060"
              sunMoon={{ sun:1.1, moon:.65 }}
              palette={{
                bg:"radial-gradient(120% 80% at 50% 0%, rgba(58,64,96,.18), transparent 60%), linear-gradient(180deg, #02030a, #010207)",
                border:"rgba(58,64,96,.32)",
                text:"#cdd2e6",
                subtext:"#6a7295",
                cardBg:"rgba(58,64,96,.08)",
                features:["DEEP ATMOSPHERIC DARK", "MINIMAL MOVEMENT", "INTROSPECTIVE TONE", "GLOWING HUD FOCUS"]
              }}
              message="Almost still. Only essential glyphs remain lit."
              energy={28}
              momentum={1.0}
            />
          </div>

          {/* CIRCADIAN ALIGNMENT */}
          <section className="panel" style={{ padding:18 }}>
            <PanelHead eyebrow="◐ CIRCADIAN ALIGNMENT" title="Where your real rhythm sits inside the cycle"
              right={<span className="mono" style={{ fontSize:10, color:"var(--c-emerald)" }}>ALIGNED · 78%</span>}/>
            <div style={{ position:"relative", padding:"6px 0" }}>
              <svg viewBox="0 0 1100 90" width="100%" height="90" style={{ display:"block" }}>
                <defs>
                  <linearGradient id="cir-band" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#02030a"/>
                    <stop offset="22%"  stopColor="#a86a4e"/>
                    <stop offset="35%"  stopColor="#7ec0e8"/>
                    <stop offset="55%"  stopColor="#fff3c0"/>
                    <stop offset="78%"  stopColor="#d97a6c"/>
                    <stop offset="92%"  stopColor="#1a2042"/>
                    <stop offset="100%" stopColor="#02030a"/>
                  </linearGradient>
                </defs>
                <rect x="20" y="30" width="1060" height="22" rx="11" fill="url(#cir-band)" opacity=".82"/>

                {/* hour ticks */}
                {Array.from({length:25}).map((_, i) => (
                  <g key={i}>
                    <line x1={20 + (i/24)*1060} y1="54" x2={20 + (i/24)*1060} y2="60" stroke="rgba(255,255,255,.2)"/>
                    {i%3===0 && <text x={20 + (i/24)*1060} y="74" textAnchor="middle" style={{ fontFamily:"var(--ff-mono)", fontSize:9, fill:"var(--text-dim)" }}>{String(i).padStart(2,"0")}</text>}
                  </g>
                ))}

                {/* sleep window (real) */}
                <rect x={20 + (22/24)*1060} y="20" width={(8/24)*1060 - (22-22)*0} height="42" rx="6" fill="rgba(91,231,224,.12)" stroke="rgba(91,231,224,.45)" strokeDasharray="3 4"/>
                <rect x="20" y="20" width={(6/24)*1060} height="42" rx="6" fill="rgba(91,231,224,.12)" stroke="rgba(91,231,224,.45)" strokeDasharray="3 4"/>

                {/* current moment */}
                {(() => {
                  const t = 20.23/24, x = 20 + t*1060;
                  return (
                    <g>
                      <line x1={x} y1="14" x2={x} y2="70" stroke="#fff" strokeWidth="1.5"/>
                      <circle cx={x} cy="14" r="5" fill="#fff" style={{ filter:"drop-shadow(0 0 8px #fff)" }}/>
                      <text x={x} y="10" textAnchor="middle" style={{ fontFamily:"var(--ff-mono)", fontSize:9, fill:"#fff", letterSpacing:".22em" }}>NOW</text>
                    </g>
                  );
                })()}

                {/* ideal anchors */}
                {[
                  { t:6.5, l:"WAKE · light", c:"#ffd28a" },
                  { t:13, l:"PEAK · deep work", c:"#7cc4ff" },
                  { t:18, l:"WIND-DOWN", c:"#d97a6c" },
                  { t:22, l:"SLEEP", c:"#5be7e0" }
                ].map((m, i) => {
                  const x = 20 + (m.t/24)*1060;
                  return (
                    <g key={i}>
                      <line x1={x} y1="20" x2={x} y2="62" stroke={m.c} strokeOpacity=".6" strokeDasharray="2 3"/>
                      <text x={x} y={i%2===0?28:88} textAnchor="middle" style={{ fontFamily:"var(--ff-mono)", fontSize:9, fill:m.c, letterSpacing:".16em" }}>{m.l}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="mono" style={{ fontSize:10, color:"var(--text-lo)", marginTop:6 }}>
              Your wake is consistently 14m late of optimal · Sleep onset 28m late · System nudging earlier sunset wind-down.
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenCelestialAtrium, ScreenDayCycle, MoonGlyph, SkyScene, CycleCard });
