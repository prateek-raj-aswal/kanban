/* screens-evolution-b.jsx
   Evolution Engine — Part B
   ─ Narrative Arc · cinematic season title
   ─ Forecast Engine · AI projection corridors
   ─ Life Build Simulator · interactive future builder
   ─ System States · UI in 4 emotional registers
*/

/* ════════════════════════════════════════════════════════
   5 — NARRATIVE ARC  ·  cinematic season title
   ════════════════════════════════════════════════════════ */

function ScreenNarrativeArc() {
  return (
    <div className="scr" style={{ display:"flex", flexDirection:"column", position:"relative" }}>
      {/* atmospheric background — replaces sidenav for full-bleed cinematic */}
      <div style={{ position:"absolute", inset:0, zIndex:0,
        background:
          "radial-gradient(60% 50% at 50% 20%, rgba(176,124,255,.22), transparent 60%)," +
          "radial-gradient(40% 40% at 20% 90%, rgba(78,161,255,.16), transparent 60%)," +
          "radial-gradient(40% 40% at 85% 80%, rgba(245,196,81,.10), transparent 60%)"
      }}/>
      {/* starfield dots */}
      <svg style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none" }} width="100%" height="100%">
        {Array.from({length:80}).map((_, i) => {
          const x = (i * 71) % 100, y = (i * 47) % 100;
          const r = (i % 5 === 0) ? 1.5 : 0.8;
          const op = 0.15 + ((i*13) % 50)/100;
          return <circle key={i} cx={`${x}%`} cy={`${y}%`} r={r} fill="#fff" opacity={op}/>;
        })}
      </svg>
      <div className="scan-overlay" style={{ zIndex:1 }}/>

      <div style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", height:"100%" }}>
        {/* slim top strip */}
        <div style={{ padding:"18px 36px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid var(--hl)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg, var(--c-blue), var(--c-violet))", display:"grid", placeItems:"center", fontWeight:800, color:"#06080f", fontSize:14, boxShadow:"0 0 14px var(--c-blue-glow)" }}>A</div>
            <div className="mono" style={{ fontSize:10, color:"var(--text-md)", letterSpacing:".3em" }}>ASCENDANT // NARRATIVE INDEX</div>
          </div>
          <div className="mono" style={{ fontSize:10, color:"var(--text-lo)", letterSpacing:".24em" }}>
            CHAPTER 14 OF AN ONGOING LIFE
          </div>
        </div>

        {/* hero */}
        <div style={{ flex:1, display:"grid", gridTemplateRows:"1fr auto", padding:"40px 60px 28px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:60, alignItems:"center" }}>

            <div>
              <div className="mono" style={{ fontSize:11, color:"var(--c-violet-2)", letterSpacing:".42em", marginBottom:18 }}>
                ◇ ◇ ◇ &nbsp;&nbsp; SEASON 03 &nbsp;&nbsp; ◇ ◇ ◇
              </div>
              <h1 className="h-display" style={{ fontSize:88, margin:"0 0 14px", lineHeight:.92,
                background:"linear-gradient(180deg, #ffffff 0%, #cda6ff 60%, #b07cff 100%)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                textShadow:"0 0 60px rgba(176,124,255,.15)",
                letterSpacing:"-.03em"
              }}>
                The Rebuild<br/>Arc.
              </h1>
              <div style={{ fontSize:17, color:"var(--text-md)", maxWidth:560, lineHeight:1.55, letterSpacing:".01em" }}>
                You spent two seasons fragmenting. Now the system observes you rebuilding from quieter ground — fewer obligations, deeper rhythm, stricter sleep. This is the arc where discipline stops being performance and becomes architecture.
              </div>

              <div style={{ marginTop:32, display:"flex", gap:14, alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", border:"1px solid rgba(176,124,255,.3)", background:"rgba(176,124,255,.06)", borderRadius:8 }}>
                  <span style={{ width:7, height:7, borderRadius:7, background:"var(--c-violet)", boxShadow:"0 0 10px var(--c-violet)", animation:"glow-pulse 2.4s infinite" }}/>
                  <span className="mono" style={{ fontSize:11, color:"var(--c-violet-2)", letterSpacing:".18em" }}>ARC IN PROGRESS · DAY 41 OF 90</span>
                </div>
                <div className="mono" style={{ fontSize:11, color:"var(--text-lo)" }}>Began 16.MAR · projected close 14.JUN</div>
              </div>
            </div>

            {/* arc seal — circular emblem */}
            <div style={{ position:"relative", width:280, height:280 }}>
              <svg viewBox="0 0 280 280" width="280" height="280">
                <defs>
                  <radialGradient id="seal-bg" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#b07cff" stopOpacity=".25"/>
                    <stop offset="60%" stopColor="#3a1e6b" stopOpacity=".15"/>
                    <stop offset="100%" stopColor="transparent"/>
                  </radialGradient>
                </defs>
                <circle cx="140" cy="140" r="130" fill="url(#seal-bg)"/>
                <circle cx="140" cy="140" r="125" fill="none" stroke="rgba(176,124,255,.35)" strokeWidth="1" strokeDasharray="2 5"/>
                <circle cx="140" cy="140" r="105" fill="none" stroke="rgba(176,124,255,.5)" strokeWidth="1.2"/>
                <circle cx="140" cy="140" r="80"  fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="1"/>
                {/* progress arc 41/90 */}
                <circle cx="140" cy="140" r="115" fill="none" stroke="#b07cff" strokeWidth="2.5"
                  strokeDasharray={`${2*Math.PI*115*(41/90)} ${2*Math.PI*115}`}
                  strokeLinecap="round"
                  transform="rotate(-90 140 140)"
                  style={{ filter:"drop-shadow(0 0 8px #b07cff)" }}/>
                {/* hexagonal sigil */}
                <polygon points="140,55 215,97 215,183 140,225 65,183 65,97"
                  fill="none" stroke="rgba(176,124,255,.7)" strokeWidth="1.2"/>
                <polygon points="140,75 195,107 195,173 140,205 85,173 85,107"
                  fill="none" stroke="rgba(176,124,255,.3)" strokeWidth=".8"/>
                <text x="140" y="135" textAnchor="middle"
                  style={{ fontFamily:"var(--ff-mono)", fontSize:11, fill:"var(--text-lo)", letterSpacing:".3em" }}>SEASON</text>
                <text x="140" y="170" textAnchor="middle"
                  style={{ fontFamily:"var(--ff-ui)", fontSize:42, fontWeight:800, fill:"#cda6ff", letterSpacing:"-.03em" }}>03</text>
                {/* small ticks around */}
                {Array.from({length:24}).map((_,i) => {
                  const a = (i/24)*Math.PI*2 - Math.PI/2;
                  const x1 = 140 + Math.cos(a)*128, y1 = 140 + Math.sin(a)*128;
                  const x2 = 140 + Math.cos(a)*134, y2 = 140 + Math.sin(a)*134;
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,.15)"/>;
                })}
              </svg>
            </div>
          </div>

          {/* TIMELINE — 4 chapters across season */}
          <div style={{ marginTop:28 }}>
            <div className="ticks" style={{ marginBottom:10 }}/>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14 }}>
              {[
                { idx:"01", name:"Sleep Lock",      win:"d01—d20", done:true,  detail:"Circadian rebuilt. 7h41m baseline.", c:"var(--c-emerald)" },
                { idx:"02", name:"Strength Floor",  win:"d18—d45", done:false, detail:"3× weekly. Pull. Press. Carry.",     c:"var(--c-blue)",   active:true },
                { idx:"03", name:"Deep Work",       win:"d40—d70", done:false, detail:"90m blocks. One file. Closed door.", c:"var(--c-violet)" },
                { idx:"04", name:"Public Return",   win:"d65—d90", done:false, detail:"Ship. Publish. Re-engage.",          c:"var(--c-gold)" }
              ].map((c, i) => (
                <div key={i} style={{
                  position:"relative",
                  padding:"16px 16px 14px",
                  border:`1px solid ${c.active ? c.c+"55" : "var(--hl)"}`,
                  background: c.done
                    ? "linear-gradient(180deg, rgba(52,214,160,.06), transparent)"
                    : c.active
                    ? `linear-gradient(180deg, ${c.c}10, transparent)`
                    : "rgba(255,255,255,.015)",
                  borderRadius:10,
                  opacity: c.done ? .8 : 1
                }}>
                  {c.active && <Brackets color={c.c+"66"} inset={4}/>}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                    <span className="mono" style={{ fontSize:9, color: c.done ? "var(--c-emerald)" : c.c, letterSpacing:".24em" }}>
                      CH {c.idx}
                    </span>
                    <span className="mono" style={{ fontSize:9, color:"var(--text-dim)", letterSpacing:".14em" }}>{c.win.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize:18, fontWeight:600, marginTop:7, color: c.done ? "var(--text-md)" : "var(--text-hi)", textDecoration: c.done ? "line-through rgba(255,255,255,.15)" : "none" }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize:11, color:"var(--text-md)", marginTop:5, lineHeight:1.45 }}>{c.detail}</div>
                  <div style={{ marginTop:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span className="mono" style={{ fontSize:9, color: c.done ? "var(--c-emerald)" : c.active ? c.c : "var(--text-dim)", letterSpacing:".18em" }}>
                      {c.done ? "◉ COMPLETE" : c.active ? "▶ IN PROGRESS" : "○ UPCOMING"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* footer plate */}
        <div style={{ padding:"14px 36px", borderTop:"1px solid var(--hl)", display:"flex", justifyContent:"space-between", alignItems:"center", background:"linear-gradient(180deg, transparent, rgba(10,8,18,.4))" }}>
          <div className="mono" style={{ fontSize:10, color:"var(--text-lo)", letterSpacing:".22em" }}>
            ◇ PRIOR ARCS · S01 THE FRAGMENT · S02 THE QUIET FALL · S03 THE REBUILD ▶
          </div>
          <div className="mono" style={{ fontSize:10, color:"var(--c-violet-2)", letterSpacing:".22em" }}>
            NEXT MILESTONE → DAY 60 · FIRST ASCENSION
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   6 — FORECAST ENGINE  ·  AI projection corridors
   ════════════════════════════════════════════════════════ */

function ProjectionCurve({ width=680, height=300, current=24, projected=[26,28,29,31,32], lowerBand=[25,26,27,28,28], upperBand=[27,30,32,34,36], days=[14,30,60,90,180] }) {
  const padL = 40, padR = 20, padT = 20, padB = 30;
  const W = width - padL - padR, H = height - padT - padB;
  const yMax = 40, yMin = 20;
  const xs = days.map(d => padL + (Math.log(d)/Math.log(days[days.length-1])) * W);
  const yOf = v => padT + H - ((v - yMin)/(yMax - yMin)) * H;

  const linePath = (vals) => xs.map((x,i) => (i===0 ? "M" : "L") + x.toFixed(1) + " " + yOf(vals[i]).toFixed(1)).join(" ");
  const bandPath =
    xs.map((x,i) => (i===0 ? "M" : "L") + x.toFixed(1) + " " + yOf(upperBand[i]).toFixed(1)).join(" ") +
    " " +
    [...xs].reverse().map((x,i) => "L" + x.toFixed(1) + " " + yOf(lowerBand[lowerBand.length-1-i]).toFixed(1)).join(" ") + " Z";

  return (
    <svg width={width} height={height} style={{ display:"block" }}>
      <defs>
        <linearGradient id="proj-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#4ea1ff" stopOpacity=".18"/>
          <stop offset="100%" stopColor="#4ea1ff" stopOpacity=".02"/>
        </linearGradient>
        <linearGradient id="proj-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"  stopColor="#4ea1ff"/>
          <stop offset="100%" stopColor="#5be7e0"/>
        </linearGradient>
      </defs>

      {/* grid */}
      {[20,25,30,35,40].map(v => (
        <g key={v}>
          <line x1={padL} y1={yOf(v)} x2={width-padR} y2={yOf(v)} stroke="rgba(255,255,255,.04)" strokeDasharray="2 5"/>
          <text x={padL-6} y={yOf(v)+3} textAnchor="end" style={{ fontFamily:"var(--ff-mono)", fontSize:9, fill:"var(--text-dim)" }}>LV {v}</text>
        </g>
      ))}

      {/* confidence band */}
      <path d={bandPath} fill="url(#proj-band)" stroke="rgba(78,161,255,.25)" strokeWidth="1" strokeDasharray="3 4"/>

      {/* current line */}
      <line x1={padL} y1={yOf(current)} x2={padL} y2={yOf(current)} stroke="#4ea1ff" strokeWidth="3"/>

      {/* projected median */}
      <path d={linePath(projected)} fill="none" stroke="url(#proj-line)" strokeWidth="2.4"
        style={{ filter:"drop-shadow(0 0 6px rgba(78,161,255,.5))" }}/>

      {/* x ticks */}
      {days.map((d, i) => (
        <g key={d}>
          <line x1={xs[i]} y1={height-padB} x2={xs[i]} y2={height-padB+5} stroke="rgba(255,255,255,.15)"/>
          <text x={xs[i]} y={height-padB+18} textAnchor="middle" style={{ fontFamily:"var(--ff-mono)", fontSize:9, fill:"var(--text-dim)", letterSpacing:".1em" }}>{d}d</text>
          <circle cx={xs[i]} cy={yOf(projected[i])} r="3.5" fill="#0a0e18" stroke="#5be7e0" strokeWidth="1.6"/>
          {i === projected.length-1 && (
            <text x={xs[i]+8} y={yOf(projected[i])-6} style={{ fontFamily:"var(--ff-mono)", fontSize:10, fill:"#5be7e0", fontWeight:600 }}>
              LV {projected[i]}
            </text>
          )}
        </g>
      ))}

      {/* "now" anchor */}
      <circle cx={padL} cy={yOf(current)} r="5" fill="#4ea1ff" style={{ filter:"drop-shadow(0 0 6px #4ea1ff)" }}/>
      <text x={padL+8} y={yOf(current)-8} style={{ fontFamily:"var(--ff-mono)", fontSize:10, fill:"#4ea1ff", letterSpacing:".1em" }}>NOW · LV {current}</text>
    </svg>
  );
}

function ScreenForecast() {
  return (
    <div className="scr" style={{ display:"flex" }}>
      <SideNav active="analytics"/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
        <TopBar title="Forecast · System Projection" crumb="EVOLUTION / FORECAST" clock="07:42:18" energy={62}/>
        <div className="scrollY" style={{ flex:1, padding:"22px 26px", display:"grid", gridTemplateColumns:"1.4fr .6fr", gap:18, gridAutoRows:"min-content" }}>

          {/* PROJECTION HERO */}
          <section className="panel glow-blue" style={{ padding:22, position:"relative", overflow:"hidden" }}>
            <Brackets color="var(--c-blue-glow)" inset={8}/>
            <div className="scan-overlay"/>
            <PanelHead
              eyebrow="◈ PROJECTION · STRENGTH · 180d HORIZON"
              title="At current momentum, Strength LV 32 projected in 12 days."
              right={<StateChip label="MODEL · STABLE" state="stable"/>}/>

            <div style={{ display:"grid", placeItems:"center", padding:"10px 0" }}>
              <ProjectionCurve width={680} height={300}/>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginTop:6 }}>
              {[
                ["+14d", "LV 26", ".92", "high"],
                ["+30d", "LV 28", ".84", "high"],
                ["+90d", "LV 31", ".62", "med"],
                ["+180d","LV 32–36",".41", "med"]
              ].map(([d, lv, conf, c], i) => (
                <div key={i} style={{ padding:"10px 12px", border:"1px solid var(--hl)", background:"rgba(255,255,255,.015)", borderRadius:8 }}>
                  <div className="mono" style={{ fontSize:10, color:"var(--text-lo)", letterSpacing:".2em" }}>HORIZON {d}</div>
                  <div style={{ fontSize:18, fontWeight:700, marginTop:4, color:"var(--c-blue-2)" }}>{lv}</div>
                  <div className="mono" style={{ fontSize:9, color: c==="high" ? "var(--c-emerald)" : "var(--c-gold)", marginTop:3 }}>
                    CONF {conf} · {c.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI VOICE — observation/strategy */}
          <section className="panel" style={{ padding:18, position:"relative" }}>
            <PanelHead eyebrow="◉ ORACLE · OBSERVATION" title="What the system notices"/>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                { tone:"cool",  txt:"Deep work consistency improving learning retention. Reading throughput up 38% week-over-week.", c:"var(--c-blue)" },
                { tone:"warn",  txt:"Burnout probability rising. Recovery floor breached three nights in nine. Suggest one full rest day inside d12–d14.", c:"var(--c-crimson)" },
                { tone:"strat", txt:"You hit your highest weekly resonance when sleep precedes training by ≥30 minutes. Anchor sleep first.", c:"var(--c-emerald)" }
              ].map((o, i) => (
                <div key={i} style={{ padding:"11px 12px", border:`1px solid ${o.c}33`, background:`${o.c}08`, borderRadius:8 }}>
                  <div className="mono" style={{ fontSize:9, color:o.c, letterSpacing:".22em", marginBottom:5 }}>
                    {o.tone === "warn" ? "⚠ FLAG" : o.tone === "strat" ? "✦ STRATEGY" : "◇ OBSERVATION"}
                  </div>
                  <div style={{ fontSize:12, color:"var(--text-md)", lineHeight:1.5 }}>{o.txt}</div>
                </div>
              ))}
            </div>
          </section>

          {/* BURNOUT PROBABILITY CONE */}
          <section className="panel" style={{ padding:18, position:"relative" }}>
            <PanelHead eyebrow="⚠ BURNOUT PROBABILITY · 30d" title="Risk envelope" right={<span className="mono" style={{ fontSize:10, color:"var(--c-gold)" }}>RISING · 24% → 47%</span>}/>
            <svg viewBox="0 0 500 140" width="100%" height="140" style={{ display:"block" }}>
              <defs>
                <linearGradient id="cone-fill" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#34d6a0" stopOpacity=".2"/>
                  <stop offset="100%" stopColor="#ff5a6e" stopOpacity=".35"/>
                </linearGradient>
              </defs>
              {/* axis */}
              <line x1="30" y1="110" x2="480" y2="110" stroke="rgba(255,255,255,.15)"/>
              {/* probability cone */}
              <path d="M 30 90 Q 200 100 480 30 L 480 110 L 30 110 Z" fill="url(#cone-fill)" stroke="rgba(255,90,110,.5)" strokeDasharray="2 4"/>
              {/* median */}
              <path d="M 30 95 Q 220 80 480 55" fill="none" stroke="#ff5a6e" strokeWidth="2" strokeDasharray="0" style={{ filter:"drop-shadow(0 0 6px #ff5a6e)"}}/>
              {/* threshold */}
              <line x1="30" y1="60" x2="480" y2="60" stroke="rgba(245,196,81,.4)" strokeDasharray="3 4"/>
              <text x="38" y="55" style={{ fontFamily:"var(--ff-mono)", fontSize:9, fill:"var(--c-gold)", letterSpacing:".14em" }}>RED LINE · 50%</text>
              {/* ticks */}
              {["d0","d7","d14","d21","d30"].map((d,i) => (
                <text key={d} x={30 + i*112.5} y="128" textAnchor="middle" style={{ fontFamily:"var(--ff-mono)", fontSize:9, fill:"var(--text-dim)", letterSpacing:".1em" }}>{d}</text>
              ))}
              {/* trigger marker */}
              <circle cx="350" cy="68" r="4" fill="#ff5a6e" style={{ filter:"drop-shadow(0 0 6px #ff5a6e)" }}/>
              <text x="358" y="64" style={{ fontFamily:"var(--ff-mono)", fontSize:10, fill:"#ff5a6e", fontWeight:600 }}>d21 · breach likely</text>
            </svg>
            <div className="mono" style={{ fontSize:10, color:"var(--text-lo)", marginTop:8 }}>
              Drivers: <span style={{ color:"var(--c-crimson)" }}>sleep deficit</span> · <span style={{ color:"var(--c-crimson)" }}>training load ×1.3</span> · <span style={{ color:"var(--c-gold)" }}>caffeine creep</span>
            </div>
          </section>

          {/* OPTIMAL RECOVERY WINDOWS */}
          <section className="panel" style={{ padding:18 }}>
            <PanelHead eyebrow="◐ OPTIMAL RECOVERY WINDOWS" title="When the system says rest"/>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { date:"Thu · 30.MAY", win:"21:00–07:00", label:"Sleep-only window", gain:"+22 Recovery", c:"var(--c-cyan)" },
                { date:"Sat · 01.JUN", win:"All day · soft",label:"Full rest · zone-1 walk", gain:"+34 Recovery", c:"var(--c-emerald)" },
                { date:"Wed · 05.JUN", win:"18:00–20:00", label:"Deload session",  gain:"+14 Recovery", c:"var(--c-violet)" }
              ].map((w, i) => (
                <div key={i} style={{ padding:"10px 12px", border:`1px solid ${w.c}33`, background:`${w.c}08`, borderRadius:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                    <span className="mono" style={{ fontSize:10, color:w.c, letterSpacing:".18em" }}>{w.date.toUpperCase()}</span>
                    <span className="mono" style={{ fontSize:10, color:"var(--c-emerald)" }}>{w.gain}</span>
                  </div>
                  <div style={{ fontSize:12, color:"var(--text-hi)", marginTop:5 }}>{w.label}</div>
                  <div className="mono" style={{ fontSize:9, color:"var(--text-lo)", marginTop:3 }}>{w.win}</div>
                </div>
              ))}
            </div>
          </section>

          {/* CONSISTENCY FORECAST — full width */}
          <section className="panel" style={{ gridColumn:"1 / span 2", padding:18 }}>
            <PanelHead eyebrow="▦ CONSISTENCY FORECAST · 8 SYSTEMS · 30d" title="Where habits hold, where they slip" right={<span className="mono" style={{ fontSize:10, color:"var(--text-lo)" }}>MODEL TRAINED ON 248d HISTORY</span>}/>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:10 }}>
              {[
                { name:"Sleep",     trend:"hold", v:.84, c:"var(--c-cyan)" },
                { name:"Train",     trend:"climb",v:.78, c:"var(--c-emerald)" },
                { name:"Read",      trend:"climb",v:.74, c:"var(--c-blue)" },
                { name:"Focus",     trend:"hold", v:.62, c:"var(--c-gold)" },
                { name:"Create",    trend:"slip", v:.41, c:"var(--c-crimson)" },
                { name:"Journal",   trend:"climb",v:.68, c:"var(--c-violet)" },
                { name:"Discipline",trend:"hold", v:.88, c:"var(--c-emerald)" },
                { name:"Connect",   trend:"slip", v:.28, c:"var(--c-crimson)" }
              ].map(s => (
                <div key={s.name} style={{ padding:"11px 12px", border:`1px solid ${s.c}33`, background:`${s.c}08`, borderRadius:8 }}>
                  <div className="mono" style={{ fontSize:9, color:"var(--text-lo)", letterSpacing:".18em" }}>{s.name.toUpperCase()}</div>
                  <div style={{ fontSize:18, fontWeight:700, color:s.c, marginTop:6 }}>{Math.round(s.v*100)}%</div>
                  <div className="mono" style={{ fontSize:9, color:s.c, marginTop:2, letterSpacing:".14em" }}>
                    {s.trend === "climb" ? "↗ CLIMB" : s.trend === "hold" ? "→ HOLD" : "↘ SLIP"}
                  </div>
                  <div className="xpbar" style={{ marginTop:6, height:2 }}>
                    <i style={{ width:`${s.v*100}%`, background:s.c, boxShadow:"none" }}/>
                  </div>
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
   7 — LIFE BUILD SIMULATOR  ·  interactive future builder
   ════════════════════════════════════════════════════════ */

function ScreenLifeSim() {
  const [habits, setHabits] = React.useState({
    code:    .8,
    sleep:   .9,
    train:   .7,
    create:  .4,
    read:    .6,
    meditate:.3
  });
  const set = (k, v) => setHabits(h => ({ ...h, [k]:v }));

  const totalLoad = Object.values(habits).reduce((s,v) => s+v, 0);
  const burnoutRisk = Math.max(0, Math.min(1, (totalLoad - habits.sleep*1.4 - habits.meditate*0.6)/3.6));
  const growth = Math.round((habits.code*.4 + habits.read*.25 + habits.create*.2 + habits.train*.15) * 100);
  const recovery = Math.round((habits.sleep*.5 + habits.meditate*.3 + (1-habits.train*.7)*.2) * 100);

  return (
    <div className="scr" style={{ display:"flex" }}>
      <SideNav active="analytics"/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
        <TopBar title="Life Build · Future Simulator" crumb="EVOLUTION / SIM" clock="07:42:18" energy={62}/>

        <div className="scrollY" style={{ flex:1, padding:"22px 26px", display:"grid", gridTemplateColumns:".75fr 1.25fr", gap:18, gridAutoRows:"min-content" }}>

          {/* LEFT: INPUT BUILD */}
          <section className="panel glow-violet" style={{ padding:20, position:"relative" }}>
            <Brackets color="var(--c-violet-glow)" inset={8}/>
            <PanelHead eyebrow="◇ INPUT · YOUR 90-DAY BUILD" title="Allocate your conviction"
              right={<span className="mono" style={{ fontSize:10, color:"var(--c-violet-2)" }}>LOAD · {Math.round(totalLoad/6*100)}%</span>}/>
            <div className="mono" style={{ fontSize:10, color:"var(--text-lo)", marginBottom:14, lineHeight:1.5 }}>
              What happens if you consistently train these systems for 90 days?
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                ["code",     "Code · deep work",       "var(--c-blue)"],
                ["sleep",    "Sleep · circadian",      "var(--c-cyan)"],
                ["train",    "Train · strength",       "var(--c-emerald)"],
                ["read",     "Read · long-form",       "var(--c-blue-2)"],
                ["create",   "Create · music · art",   "var(--c-violet)"],
                ["meditate", "Meditate · breath",      "var(--c-gold)"]
              ].map(([k, label, c]) => (
                <div key={k}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                    <span style={{ fontSize:12, color:"var(--text-md)" }}>{label}</span>
                    <span className="mono" style={{ fontSize:11, color:c }}>{Math.round(habits[k]*100)}%</span>
                  </div>
                  <div style={{ marginTop:6, position:"relative", height:10 }}>
                    <div style={{ position:"absolute", inset:"3px 0", borderRadius:6, background:"rgba(255,255,255,.04)", border:"1px solid var(--hl)" }}/>
                    <div style={{ position:"absolute", left:0, top:3, bottom:3, width:`${habits[k]*100}%`, borderRadius:6, background:`linear-gradient(90deg, ${c}, ${c}aa)`, boxShadow:`0 0 8px ${c}66` }}/>
                    <input type="range" min="0" max="100" value={habits[k]*100}
                      onChange={e => set(k, e.target.value/100)}
                      style={{ position:"absolute", inset:0, width:"100%", margin:0, opacity:0, cursor:"pointer" }}/>
                    <div style={{ position:"absolute", left:`calc(${habits[k]*100}% - 6px)`, top:-1, width:12, height:12, borderRadius:"50%", background:c, boxShadow:`0 0 10px ${c}, 0 0 0 2px rgba(10,14,24,.95)`, pointerEvents:"none" }}/>
                  </div>
                </div>
              ))}
            </div>

            <div className="divider" style={{ margin:"18px 0 14px" }}/>

            <div className="mono" style={{ fontSize:10, color:"var(--text-lo)", letterSpacing:".18em", marginBottom:8 }}>PRESETS</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {[
                ["MONK MODE",       { code:.4, sleep:1, train:.5, create:.6, read:.9, meditate:.9 }],
                ["BUILDER ARC",     { code:1, sleep:.8, train:.6, create:.3, read:.7, meditate:.3 }],
                ["ATHLETE FOCUS",   { code:.4, sleep:.9, train:1,  create:.3, read:.4, meditate:.5 }],
                ["BALANCED REBUILD",{ code:.7, sleep:.9, train:.7, create:.6, read:.7, meditate:.6 }]
              ].map(([n, h]) => (
                <button key={n} onClick={() => setHabits(h)} style={{
                  all:"unset", cursor:"pointer", textAlign:"left",
                  padding:"8px 10px", border:"1px solid var(--hl)", borderRadius:6,
                  background:"rgba(255,255,255,.015)",
                  fontFamily:"var(--ff-mono)", fontSize:10, color:"var(--text-md)", letterSpacing:".14em"
                }}>{n}</button>
              ))}
            </div>
          </section>

          {/* RIGHT: OUTCOME */}
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

            {/* PROJECTED YOU */}
            <section className="panel glow-blue" style={{ padding:22, position:"relative", overflow:"hidden" }}>
              <Brackets color="var(--c-blue-glow)" inset={6}/>
              <div className="scan-overlay"/>
              <PanelHead eyebrow="◈ +90 DAYS · PROJECTED YOU" title="What this build becomes"
                right={<span className="mono" style={{ fontSize:10, color:"var(--c-blue-2)" }}>SIM RUN · 14ms</span>}/>

              <div style={{ display:"grid", gridTemplateColumns:"auto 1fr auto", gap:24, alignItems:"center" }}>
                <Sigil size={88} hue={burnoutRisk > .55 ? "crimson" : recovery > 60 ? "blue" : "violet"} glyph="K"/>
                <div>
                  <div className="mono" style={{ fontSize:9, color:"var(--text-lo)", letterSpacing:".22em" }}>PROJECTED CLASS</div>
                  <div style={{ fontSize:22, fontWeight:700, marginTop:4, color: burnoutRisk > .55 ? "var(--c-crimson)" : "var(--c-blue-2)" }}>
                    {burnoutRisk > .55 ? "Overclocked Operator" : recovery > 60 ? "Stable Architect" : "Driven Strategist"}
                  </div>
                  <div style={{ fontSize:12, color:"var(--text-md)", marginTop:4 }}>
                    LV {Math.round(24 + growth/8)} · {burnoutRisk > .55 ? "S-RANK · UNSTABLE" : recovery > 60 ? "A-RANK · STABLE" : "A-RANK · CLIMBING"}
                  </div>
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <StatRing value={growth}   size={80} stroke={6} color="#4ea1ff" label={growth}     sub="GROWTH"/>
                  <StatRing value={recovery} size={80} stroke={6} color="#34d6a0" label={recovery}   sub="RECOVERY"/>
                  <StatRing value={burnoutRisk*100} size={80} stroke={6} color="#ff5a6e" label={Math.round(burnoutRisk*100)} sub="BURNOUT"/>
                </div>
              </div>
            </section>

            {/* BRANCHING FUTURES */}
            <section className="panel" style={{ padding:18 }}>
              <PanelHead eyebrow="⌥ BRANCHING FUTURES" title="Three timelines from here"/>
              <svg viewBox="0 0 700 220" width="100%" height="220">
                <defs>
                  <linearGradient id="b-good" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#4ea1ff" stopOpacity=".2"/><stop offset="100%" stopColor="#34d6a0"/></linearGradient>
                  <linearGradient id="b-mid"  x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#4ea1ff" stopOpacity=".2"/><stop offset="100%" stopColor="#b07cff"/></linearGradient>
                  <linearGradient id="b-bad"  x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#4ea1ff" stopOpacity=".2"/><stop offset="100%" stopColor="#ff5a6e"/></linearGradient>
                </defs>
                {/* anchor */}
                <circle cx="40" cy="110" r="8" fill="#4ea1ff" style={{ filter:"drop-shadow(0 0 6px #4ea1ff)" }}/>
                <text x="40" y="138" textAnchor="middle" style={{ fontFamily:"var(--ff-mono)", fontSize:10, fill:"var(--c-blue-2)", letterSpacing:".14em" }}>NOW</text>

                {/* paths */}
                <path d="M 40 110 Q 320 30 660 30"  fill="none" stroke="url(#b-good)" strokeWidth="2.4" style={{ filter:"drop-shadow(0 0 6px rgba(52,214,160,.5))" }}/>
                <path d="M 40 110 Q 320 110 660 110" fill="none" stroke="url(#b-mid)"  strokeWidth="2.4"/>
                <path d="M 40 110 Q 320 190 660 190" fill="none" stroke="url(#b-bad)"  strokeWidth="2.4" strokeDasharray="4 4"/>

                {/* end nodes */}
                {[
                  { x:660, y:30,  c:"#34d6a0", t:"Stable Architect", p:"42%", d:"LV 31 · resonance ↑" },
                  { x:660, y:110, c:"#b07cff", t:"Driven Strategist",p:"38%", d:"LV 29 · momentum hold" },
                  { x:660, y:190, c:"#ff5a6e", t:"Overclocked Op.",  p:"20%", d:"LV 33 · burnout d51" }
                ].map((n, i) => (
                  <g key={i}>
                    <circle cx={n.x} cy={n.y} r="9" fill="rgba(10,14,24,.95)" stroke={n.c} strokeWidth="1.8" style={{ filter:`drop-shadow(0 0 8px ${n.c})` }}/>
                    <text x={n.x-14} y={n.y-12} textAnchor="end" style={{ fontFamily:"var(--ff-mono)", fontSize:10, fill:n.c, fontWeight:600 }}>{n.t}</text>
                    <text x={n.x-14} y={n.y+4} textAnchor="end" style={{ fontFamily:"var(--ff-mono)", fontSize:9, fill:"var(--text-md)" }}>{n.d}</text>
                    <text x={n.x-14} y={n.y+18} textAnchor="end" style={{ fontFamily:"var(--ff-mono)", fontSize:9, fill:"var(--text-lo)", letterSpacing:".14em" }}>P {n.p}</text>
                  </g>
                ))}
              </svg>
            </section>

            {/* OUTCOME PREVIEW STATS */}
            <section className="panel" style={{ padding:18 }}>
              <PanelHead eyebrow="↗ DELTA · +90d" title="Stat shifts under this build"/>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                {[
                  ["STR", 20, +6,  "var(--c-emerald)"],
                  ["INT", 24, +5,  "var(--c-blue)"],
                  ["FOC", 22, +4,  "var(--c-gold)"],
                  ["CRE", 21, +2,  "var(--c-violet)"],
                  ["DSC", 25, +3,  "var(--c-emerald)"],
                  ["REC", 18, burnoutRisk > .55 ? -2 : +4, burnoutRisk > .55 ? "var(--c-crimson)" : "var(--c-emerald)"],
                  ["SPI", 19, +2,  "var(--c-cyan)"],
                  ["CON", 14, -1,  "var(--c-crimson)"]
                ].map(([abv, lv, d, c]) => (
                  <div key={abv} style={{ padding:"10px 11px", border:"1px solid var(--hl)", borderRadius:8, background:"rgba(255,255,255,.015)" }}>
                    <div className="mono" style={{ fontSize:9, color:"var(--text-lo)", letterSpacing:".22em" }}>{abv}</div>
                    <div style={{ display:"flex", alignItems:"baseline", gap:6, marginTop:5 }}>
                      <span style={{ fontSize:16, fontWeight:700, color:"var(--text-hi)" }}>LV {lv+d}</span>
                      <span className="mono" style={{ fontSize:10, color:c }}>{d > 0 ? `+${d}` : d}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   8 — SYSTEM STATES  ·  UI in 4 emotional registers
   ════════════════════════════════════════════════════════ */

// Mini HUD card showing the dashboard at one state
function StateHUD({ stateName, mood, accent, message, energy, harmony, momentum, glitch=false, scanlinesOff=false }) {
  return (
    <div style={{
      position:"relative", borderRadius:12, overflow:"hidden",
      background:
        mood === "peak"     ? "radial-gradient(120% 80% at 30% 0%, rgba(78,161,255,.20), transparent 60%), linear-gradient(180deg, #06080f, #05070d)"
      : mood === "flow"     ? "radial-gradient(120% 80% at 50% 0%, rgba(91,231,224,.18), transparent 60%), linear-gradient(180deg, #060a10, #04080c)"
      : mood === "fatigue"  ? "radial-gradient(120% 80% at 50% 0%, rgba(245,196,81,.10), transparent 60%), linear-gradient(180deg, #0c0a08, #08070a)"
      :                       "radial-gradient(120% 80% at 30% 0%, rgba(255,90,110,.16), transparent 60%), linear-gradient(180deg, #0d0608, #08050a)",
      border: `1px solid ${mood === "burnout" ? "rgba(255,90,110,.32)" : mood === "fatigue" ? "rgba(245,196,81,.22)" : "var(--hl)"}`,
      boxShadow: mood === "peak" ? `0 0 0 1px ${accent}33, 0 0 28px -8px ${accent}88` : "none",
      height: 380, padding:16, display:"flex", flexDirection:"column"
    }}>
      <Brackets color={accent+"55"} inset={6}/>
      {!scanlinesOff && <div className="scan-overlay" style={{ animationDuration: mood === "flow" ? "4s" : "10s", opacity: mood === "burnout" ? .25 : .5 }}/>}
      {glitch && (
        <>
          <div style={{ position:"absolute", left:0, right:0, top:`${30+Math.random()*20}%`, height:1, background:"rgba(91,231,224,.4)", boxShadow:"0 0 4px rgba(91,231,224,.6)" }}/>
          <div style={{ position:"absolute", left:0, right:0, top:`${60+Math.random()*15}%`, height:2, background:"rgba(255,90,110,.35)" }}/>
          <div style={{ position:"absolute", inset:0, background:"repeating-linear-gradient(0deg, rgba(255,90,110,.02) 0 1px, transparent 1px 4px)", mixBlendMode:"overlay", opacity:.7 }}/>
        </>
      )}

      {/* head */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", position:"relative" }}>
        <div>
          <div className="mono" style={{ fontSize:9, color:accent, letterSpacing:".26em",
            filter: glitch ? "blur(.3px)" : "none",
            textShadow: glitch ? "1px 0 rgba(91,231,224,.5), -1px 0 rgba(255,90,110,.4)" : "none"
          }}>SYSTEM STATE</div>
          <div style={{ fontSize:24, fontWeight:700, marginTop:4, color: mood === "burnout" ? "#ff6e80" : mood === "fatigue" ? "#e3c478" : "var(--text-hi)", letterSpacing:"-.01em" }}>
            {stateName}
          </div>
          <div style={{ fontSize:11, color: mood === "burnout" ? "rgba(255,180,190,.7)" : "var(--text-md)", marginTop:5, maxWidth:200, lineHeight:1.45 }}>{message}</div>
        </div>
        <div style={{ width:54, height:54, position:"relative" }}>
          <StatRing value={energy} size={54} stroke={5} color={accent} label={`${energy}`} sub="E"/>
        </div>
      </div>

      {/* mid: identity strip */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:14, padding:"8px 10px", background:"rgba(255,255,255,.025)", border:`1px solid ${accent}22`, borderRadius:8 }}>
        <Sigil size={36} hue={mood === "burnout" ? "crimson" : mood === "fatigue" ? "gold" : mood === "flow" ? "blue" : "blue"} glyph="K"/>
        <div style={{ minWidth:0, flex:1 }}>
          <div className="mono" style={{ fontSize:8, color:"var(--text-lo)", letterSpacing:".22em" }}>OPERATOR · LV 24</div>
          <div style={{ fontSize:12, fontWeight:600, color: mood === "burnout" ? "#e3a0aa" : "var(--text-hi)", marginTop:1, filter: glitch ? "blur(.4px)" : "none" }}>Kai Aldrich</div>
        </div>
        <div className="mono" style={{ fontSize:10, color:accent, fontWeight:600 }}>×{momentum.toFixed(1)}</div>
      </div>

      {/* bar grid */}
      <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:7 }}>
        {[
          ["FOC", harmony.foc, accent],
          ["BDY", harmony.bdy, accent],
          ["REC", harmony.rec, mood === "burnout" || mood === "fatigue" ? "var(--c-crimson)" : accent]
        ].map(([n, v, c]) => (
          <div key={n}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, fontFamily:"var(--ff-mono)", letterSpacing:".18em" }}>
              <span style={{ color:"var(--text-lo)" }}>{n}</span>
              <span style={{ color:c }}>{Math.round(v*100)}</span>
            </div>
            <div className="xpbar" style={{ marginTop:3, height:3 }}>
              <i style={{ width:`${v*100}%`, background:c, boxShadow:`0 0 6px ${c}88` }}/>
            </div>
          </div>
        ))}
      </div>

      {/* footer */}
      <div style={{ marginTop:"auto", display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:12, borderTop:"1px solid var(--hl)" }}>
        <span className="mono" style={{ fontSize:9, color:accent, letterSpacing:".22em" }}>{mood.toUpperCase()}</span>
        <span className="mono" style={{ fontSize:9, color:"var(--text-dim)", letterSpacing:".16em" }}>
          {mood === "peak" ? "TRANSITIONS · SMOOTH" : mood === "flow" ? "PARTICLES · LIVE" : mood === "fatigue" ? "FX · MUTED" : "FX · UNSTABLE"}
        </span>
      </div>
    </div>
  );
}

function ScreenSystemStates() {
  return (
    <div className="scr" style={{ display:"flex" }}>
      <SideNav active="dashboard"/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
        <TopBar title="System States · Reactive Skin" crumb="EVOLUTION / STATES" clock="07:42:18" energy={62}/>

        <div className="scrollY" style={{ flex:1, padding:"22px 26px", display:"grid", gridTemplateColumns:"1fr", gap:18 }}>

          {/* INTRO STRIP */}
          <section className="panel" style={{ padding:18, position:"relative" }}>
            <PanelHead
              eyebrow="◇ SYSTEM PRESENCE · ENVIRONMENTAL RESPONSE"
              title="The UI breathes with you."
              right={<StateChip label="LIVE PREVIEW · ALL 4 STATES" state="stable"/>}/>
            <div style={{ fontSize:12, color:"var(--text-md)", maxWidth:780, lineHeight:1.55 }}>
              The same dashboard renders differently depending on your internal weather. Colors, motion speed, particle density, glitch behavior, and bracket intensity all shift. You are not looking at four screens — you are looking at one screen, four moods.
            </div>
          </section>

          {/* 4 STATES */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
            <StateHUD
              stateName="Peak"
              mood="peak"
              accent="#4ea1ff"
              message="Brighter neon. Energized stat rings. Holographic expansion."
              energy={92}
              momentum={1.8}
              harmony={{ foc:.88, bdy:.82, rec:.78 }}
            />
            <StateHUD
              stateName="Flow"
              mood="flow"
              accent="#5be7e0"
              message="Glowing pathways. Synchronized motion. Ultra-clean transitions."
              energy={84}
              momentum={1.6}
              harmony={{ foc:.94, bdy:.74, rec:.70 }}
            />
            <StateHUD
              stateName="Fatigued"
              mood="fatigue"
              accent="#f5c451"
              message="Muted colors. Slower UI. Dimmed HUD. Static interference."
              energy={48}
              momentum={1.1}
              harmony={{ foc:.52, bdy:.46, rec:.38 }}
              scanlinesOff
            />
            <StateHUD
              stateName="Burnout"
              mood="burnout"
              accent="#ff5a6e"
              message="Fractured overlays. Warning indicators. Distorted system messages."
              energy={22}
              momentum={0.6}
              harmony={{ foc:.28, bdy:.31, rec:.18 }}
              glitch
            />
          </div>

          {/* TRANSITION RULES */}
          <section className="panel" style={{ padding:18 }}>
            <PanelHead eyebrow="↪ STATE TRANSITION RULES" title="What the system does when you change"/>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
              {[
                { from:"PEAK → FLOW",     dur:"600ms", note:"Particle density rises. Scanline tempo to 4s. Curves over right-angles.", c:"var(--c-cyan)" },
                { from:"FLOW → FATIGUE",  dur:"1200ms", note:"Saturation -20%. Motion easing softened. Energy ring desaturates.", c:"var(--c-gold)" },
                { from:"FATIGUE → BURNOUT",dur:"2400ms", note:"Glitch frames inject. UI flickers on action. Bracket color shifts crimson.", c:"var(--c-crimson)" },
                { from:"BURNOUT → RECOVERY",dur:"3000ms", note:"Color returns first, motion last. Violet inflection through purple-blue.", c:"var(--c-violet)" }
              ].map((r, i) => (
                <div key={i} style={{ padding:"12px 12px 10px", border:`1px solid ${r.c}33`, background:`${r.c}06`, borderRadius:8 }}>
                  <div className="mono" style={{ fontSize:10, color:r.c, letterSpacing:".22em" }}>{r.from}</div>
                  <div className="mono" style={{ fontSize:9, color:"var(--text-dim)", marginTop:3 }}>EASE · {r.dur}</div>
                  <div style={{ fontSize:11, color:"var(--text-md)", marginTop:6, lineHeight:1.5 }}>{r.note}</div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenNarrativeArc, ScreenForecast, ScreenLifeSim, ScreenSystemStates, ProjectionCurve, StateHUD });
