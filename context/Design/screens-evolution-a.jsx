/* screens-evolution-a.jsx
   Evolution Engine — Part A
   ─ System Sync · the emotional heartbeat
   ─ Skill Network · neural interdependency graph
   ─ Identity Drift · class evolution pathway
   ─ Shadow Index · entropy & neglect atmospheric
*/

/* ════════════════════════════════════════════════════════
   SHARED ATOMS for evolution screens
   ════════════════════════════════════════════════════════ */

// State badge — used in many evolution screens to signal system mood
function StateChip({ label, state="stable", small=false }) {
  const map = {
    peak:      ["var(--c-blue)",    "PEAK"],
    flow:      ["var(--c-cyan)",    "FLOW"],
    stable:    ["var(--c-emerald)", "STABLE"],
    growing:   ["var(--c-emerald)", "GROWING"],
    fragmented:["var(--c-gold)",    "FRAGMENTED"],
    fatigued:  ["var(--c-gold)",    "FATIGUED"],
    low:       ["var(--c-crimson)", "LOW"],
    critical:  ["var(--c-crimson)", "CRITICAL"],
    neglected: ["#5a4a78",          "NEGLECTED"],
    recovering:["var(--c-violet)",  "RECOVERING"]
  };
  const [c, def] = map[state] || map.stable;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:6,
      padding: small ? "2px 7px" : "3px 9px",
      border:`1px solid ${c}55`, background:`${c}10`, borderRadius:3,
      fontFamily:"var(--ff-mono)", fontSize: small ? 9 : 10,
      color:c, letterSpacing:".16em"
    }}>
      <span style={{ width:5, height:5, borderRadius:5, background:c, boxShadow:`0 0 8px ${c}` }}/>
      {label || def}
    </span>
  );
}

// 7-axis radar (used in System Sync as the central resonance polygon)
function ResonanceRadar({ size=440, axes, glow=true }) {
  const cx = size/2, cy = size/2;
  const rings = [.2, .4, .6, .8, 1.0];
  const radius = size/2 - 40;
  const points = axes.map((a, i) => {
    const angle = (Math.PI * 2 * i / axes.length) - Math.PI/2;
    const r = radius * a.value;
    return [cx + Math.cos(angle)*r, cy + Math.sin(angle)*r];
  });
  const idealPts = axes.map((_, i) => {
    const angle = (Math.PI * 2 * i / axes.length) - Math.PI/2;
    const r = radius * 0.78;
    return [cx + Math.cos(angle)*r, cy + Math.sin(angle)*r];
  });
  const poly = points.map(p => p.join(",")).join(" ");
  const idealPoly = idealPts.map(p => p.join(",")).join(" ");

  return (
    <svg width={size} height={size} style={{ display:"block" }}>
      <defs>
        <radialGradient id="resonance-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4ea1ff" stopOpacity=".35"/>
          <stop offset="100%" stopColor="#b07cff" stopOpacity=".05"/>
        </radialGradient>
        <linearGradient id="resonance-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5be7e0"/>
          <stop offset="100%" stopColor="#b07cff"/>
        </linearGradient>
      </defs>

      {/* concentric rings */}
      {rings.map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={radius*r}
          fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="1"
          strokeDasharray={i===rings.length-1 ? "0" : "2 4"}/>
      ))}

      {/* axis spokes */}
      {axes.map((a, i) => {
        const angle = (Math.PI * 2 * i / axes.length) - Math.PI/2;
        const x2 = cx + Math.cos(angle)*radius;
        const y2 = cy + Math.sin(angle)*radius;
        return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgba(255,255,255,.08)" strokeWidth="1"/>;
      })}

      {/* ideal harmony polygon (dashed reference) */}
      <polygon points={idealPoly} fill="none" stroke="rgba(245,196,81,.35)" strokeWidth="1" strokeDasharray="3 5"/>

      {/* actual polygon */}
      <polygon points={poly}
        fill="url(#resonance-fill)"
        stroke="url(#resonance-stroke)"
        strokeWidth="1.8"
        style={{ filter: glow ? "drop-shadow(0 0 10px rgba(91,231,224,.4))" : "none" }}/>

      {/* nodes at corners */}
      {points.map(([x,y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5" fill="#0a0e18" stroke={axes[i].color || "#5be7e0"} strokeWidth="1.5"/>
          <circle cx={x} cy={y} r="2" fill={axes[i].color || "#5be7e0"}/>
        </g>
      ))}

      {/* labels at outer radius */}
      {axes.map((a, i) => {
        const angle = (Math.PI * 2 * i / axes.length) - Math.PI/2;
        const lx = cx + Math.cos(angle)*(radius + 22);
        const ly = cy + Math.sin(angle)*(radius + 22);
        const anchor = Math.cos(angle) > 0.3 ? "start" : Math.cos(angle) < -0.3 ? "end" : "middle";
        return (
          <g key={i}>
            <text x={lx} y={ly-4} textAnchor={anchor}
              style={{ fontFamily:"var(--ff-mono)", fontSize:9, fill:"var(--text-lo)", letterSpacing:".16em" }}>
              {a.label.toUpperCase()}
            </text>
            <text x={lx} y={ly+9} textAnchor={anchor}
              style={{ fontFamily:"var(--ff-mono)", fontSize:11, fill:a.color || "#5be7e0", fontWeight:600 }}>
              {Math.round(a.value*100)}
            </text>
          </g>
        );
      })}

      {/* center resonance value */}
      <circle cx={cx} cy={cy} r="42" fill="rgba(10,14,24,.9)" stroke="rgba(91,231,224,.4)" strokeWidth="1"/>
      <text x={cx} y={cy-4} textAnchor="middle"
        style={{ fontFamily:"var(--ff-mono)", fontSize:9, fill:"var(--text-lo)", letterSpacing:".22em" }}>
        RESONANCE
      </text>
      <text x={cx} y={cy+18} textAnchor="middle"
        style={{ fontFamily:"var(--ff-ui)", fontSize:26, fontWeight:700, fill:"#5be7e0", letterSpacing:"-.02em" }}>
        {Math.round(axes.reduce((s,a) => s+a.value, 0)/axes.length*100)}
      </text>
    </svg>
  );
}

/* ════════════════════════════════════════════════════════
   1 — SYSTEM SYNC  ·  the emotional heartbeat
   ════════════════════════════════════════════════════════ */

function ScreenSystemSync() {
  const axes = [
    { label:"Mind",      value:.82, color:"#4ea1ff", state:"stable" },
    { label:"Body",      value:.71, color:"#34d6a0", state:"growing" },
    { label:"Focus",     value:.43, color:"#f5c451", state:"fragmented" },
    { label:"Creativity",value:.66, color:"#b07cff", state:"stable" },
    { label:"Recovery",  value:.38, color:"#ff5a6e", state:"low" },
    { label:"Emotion",   value:.74, color:"#5be7e0", state:"stable" },
    { label:"Momentum",  value:.81, color:"#f5c451", state:"growing" }
  ];

  return (
    <div className="scr" style={{ display:"flex" }}>
      <SideNav active="dashboard"/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
        <TopBar title="System Sync · Internal Resonance" crumb="EVOLUTION / SYNC" clock="07:42:18" energy={62}/>
        <div className="scrollY" style={{ flex:1, padding:"22px 26px", display:"grid", gridTemplateColumns:"1.15fr .85fr", gap:18, gridAutoRows:"min-content" }}>

          {/* HEARTBEAT — central resonance radar */}
          <section className="panel glow-blue" style={{ gridRow:"1 / span 2", padding:24, position:"relative", overflow:"hidden", minHeight:560 }}>
            <Brackets color="rgba(91,231,224,.45)" inset={8}/>
            <div className="scan-overlay"/>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div className="eyebrow" style={{ color:"#5be7e0" }}>◉ HEARTBEAT · LIVE</div>
                <h1 className="h-display" style={{ fontSize:30, margin:"6px 0 2px" }}>Internal Resonance</h1>
                <div style={{ fontSize:12, color:"var(--text-md)" }}>The system is observing your seven core states.</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div className="mono" style={{ fontSize:9, color:"var(--text-lo)", letterSpacing:".22em" }}>SYSTEM STATUS</div>
                <div style={{ marginTop:6, display:"flex", gap:6, justifyContent:"flex-end" }}>
                  <StateChip state="fragmented"/>
                </div>
                <div className="mono" style={{ fontSize:10, color:"var(--text-lo)", marginTop:8, maxWidth:200 }}>
                  Focus fragmentation and low recovery are dragging your harmony index. Three corrections suggested →
                </div>
              </div>
            </div>

            {/* radar */}
            <div style={{ display:"grid", placeItems:"center", marginTop:8 }}>
              <ResonanceRadar size={440} axes={axes}/>
            </div>

            {/* legend strip */}
            <div style={{ marginTop:8, display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6 }}>
              {axes.map(a => (
                <div key={a.label} style={{
                  padding:"7px 8px", border:"1px solid var(--hl)", borderRadius:6,
                  background:"rgba(255,255,255,.015)", textAlign:"center"
                }}>
                  <div className="mono" style={{ fontSize:8, color:"var(--text-lo)", letterSpacing:".18em" }}>{a.label.toUpperCase()}</div>
                  <div style={{ fontSize:15, fontWeight:700, color:a.color, marginTop:3 }}>{Math.round(a.value*100)}</div>
                  <div style={{ marginTop:4, display:"flex", justifyContent:"center" }}>
                    <StateChip state={a.state} small/>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* HARMONY INDEX */}
          <section className="panel" style={{ padding:18, position:"relative" }}>
            <PanelHead eyebrow="◇ HARMONY INDEX" title="System Balance" right={<span className="mono" style={{ fontSize:10, color:"var(--c-cyan)" }}>63 / 100</span>}/>
            <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:14, alignItems:"center" }}>
              <StatRing value={63} size={92} stroke={7} color="#5be7e0" label="63" sub="HARMONY"/>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {[
                  ["Synchronized",  4, "var(--c-emerald)"],
                  ["Drifting",      2, "var(--c-gold)"],
                  ["Out of phase",  1, "var(--c-crimson)"]
                ].map(([label, n, c]) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 8px", border:`1px solid ${c}33`, background:`${c}08`, borderRadius:6 }}>
                    <span style={{ fontSize:11, color:"var(--text-md)" }}>{label}</span>
                    <span className="mono" style={{ fontSize:11, color:c, fontWeight:700 }}>{n} systems</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="divider" style={{ margin:"14px 0 10px" }}/>
            <div className="mono" style={{ fontSize:10, color:"var(--text-lo)" }}>
              Imbalance detected between <span style={{ color:"var(--c-blue-2)" }}>MIND</span> (high) and <span style={{ color:"var(--c-crimson)" }}>RECOVERY</span> (low). System is running cognitively over physical baseline.
            </div>
          </section>

          {/* INTERNAL CONFLICT */}
          <section className="panel" style={{ padding:18, position:"relative" }}>
            <PanelHead eyebrow="✕ INTERNAL CONFLICT" title="Where systems pull against each other"/>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { a:"Focus", b:"Recovery", desc:"Deep work consuming sleep reserves",  severity:.7,  color:"var(--c-crimson)" },
                { a:"Body",  b:"Creativity",desc:"Training load suppressing creative bandwidth", severity:.45, color:"var(--c-gold)" },
                { a:"Mind",  b:"Emotion",   desc:"Cognitive load drifting from emotional center", severity:.3, color:"var(--c-gold)" }
              ].map((c, i) => (
                <div key={i} style={{ padding:"10px 12px", border:`1px solid ${c.color}33`, background:`${c.color}08`, borderRadius:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <span style={{ fontSize:12, color:"var(--text-hi)", fontWeight:600 }}>{c.a}</span>
                    <span className="mono" style={{ fontSize:14, color:c.color }}>⇄</span>
                    <span style={{ fontSize:12, color:"var(--text-hi)", fontWeight:600 }}>{c.b}</span>
                    <span style={{ flex:1 }}/>
                    <span className="mono" style={{ fontSize:9, color:c.color, letterSpacing:".14em" }}>{Math.round(c.severity*100)}%</span>
                  </div>
                  <div style={{ fontSize:11, color:"var(--text-md)" }}>{c.desc}</div>
                  <div className="xpbar" style={{ marginTop:7, height:3 }}>
                    <i style={{ width:`${c.severity*100}%`, background:c.color, boxShadow:`0 0 6px ${c.color}`}}/>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* RESTORATION DIRECTIVES — full width */}
          <section className="panel glow-emerald" style={{ gridColumn:"1 / span 2", padding:18, position:"relative" }}>
            <Brackets color="var(--c-emerald-glow)" inset={6}/>
            <PanelHead eyebrow="◐ SYSTEM DIRECTIVES · CORRECTION" title="Restore resonance"
              right={<span className="mono" style={{ fontSize:10, color:"var(--c-emerald)" }}>3 ACTIONS · 90 MIN</span>}/>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {[
                { id:"01", title:"Single-block focus", detail:"90m monotask. Recover fragmented Focus → Stable.", impact:"Focus +14", domain:"FOCUS", color:"#f5c451" },
                { id:"02", title:"Early circadian shutdown", detail:"Cut screens 21:30. Restore Recovery from Low.", impact:"Recovery +22", domain:"RECOVERY", color:"#ff5a6e" },
                { id:"03", title:"Zone-2 cardio · 30m",   detail:"Decouple Body from Creativity suppression.",   impact:"Harmony +9",  domain:"BODY", color:"#34d6a0" }
              ].map(d => (
                <div key={d.id} style={{
                  padding:"14px 14px 12px",
                  border:`1px solid ${d.color}44`,
                  background:`linear-gradient(180deg, ${d.color}10, transparent)`,
                  borderRadius:10, position:"relative"
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <span className="mono" style={{ fontSize:10, color:d.color, letterSpacing:".22em" }}>{d.domain} · {d.id}</span>
                    <span className="mono" style={{ fontSize:10, color:"var(--c-emerald)" }}>{d.impact}</span>
                  </div>
                  <div style={{ fontSize:14, fontWeight:600, marginTop:8 }}>{d.title}</div>
                  <div style={{ fontSize:11, color:"var(--text-md)", marginTop:5 }}>{d.detail}</div>
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
   2 — SKILL NETWORK  ·  neural interdependency graph
   ════════════════════════════════════════════════════════ */

function NodeGraph({ width=720, height=560, nodes, edges, hot }) {
  // Edge: { from, to, strength (0..1), kind:"boost"|"suppress" }
  const findNode = id => nodes.find(n => n.id === id);
  return (
    <svg width={width} height={height} style={{ display:"block" }}>
      <defs>
        <radialGradient id="ng-hot" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5be7e0" stopOpacity=".55"/>
          <stop offset="100%" stopColor="#5be7e0" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="ng-edge-boost" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4ea1ff" stopOpacity=".1"/>
          <stop offset="100%" stopColor="#5be7e0" stopOpacity=".9"/>
        </linearGradient>
        <linearGradient id="ng-edge-suppress" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff5a6e" stopOpacity=".15"/>
          <stop offset="100%" stopColor="#ff5a6e" stopOpacity=".7"/>
        </linearGradient>
      </defs>

      {/* connections */}
      {edges.map((e, i) => {
        const a = findNode(e.from), b = findNode(e.to);
        if (!a || !b) return null;
        const dx = b.x - a.x, dy = b.y - a.y;
        const mid = { x: a.x + dx*.5 + dy*.06, y: a.y + dy*.5 - dx*.06 };
        const path = `M ${a.x} ${a.y} Q ${mid.x} ${mid.y} ${b.x} ${b.y}`;
        const color = e.kind === "suppress" ? "url(#ng-edge-suppress)" : "url(#ng-edge-boost)";
        const stroke = e.kind === "suppress" ? "#ff5a6e" : "#5be7e0";
        const isHot = hot && (e.from === hot || e.to === hot);
        return (
          <g key={i}>
            <path d={path} fill="none" stroke={color}
              strokeWidth={1 + e.strength*1.8}
              strokeOpacity={isHot ? 1 : .55}
              strokeDasharray={e.kind === "suppress" ? "4 4" : "0"}
              style={{ filter:isHot ? `drop-shadow(0 0 6px ${stroke})` : "none" }}/>
            {/* directional dot */}
            <circle r={isHot ? 3 : 2} fill={stroke}
              style={{ filter: isHot ? `drop-shadow(0 0 6px ${stroke})` : "none" }}>
              <animateMotion dur={`${4 + (i%3)*0.7}s`} repeatCount="indefinite" path={path}/>
            </circle>
          </g>
        );
      })}

      {/* nodes */}
      {nodes.map(n => {
        const isHot = hot && hot === n.id;
        const r = n.size || 26;
        return (
          <g key={n.id} transform={`translate(${n.x} ${n.y})`}>
            {isHot && <circle r={r+18} fill="url(#ng-hot)"/>}
            <circle r={r+6} fill="none" stroke={n.color} strokeOpacity=".18" strokeWidth="1"/>
            <circle r={r} fill="rgba(10,14,24,.92)" stroke={n.color}
              strokeWidth={isHot ? 2 : 1.2}
              style={{ filter: isHot ? `drop-shadow(0 0 12px ${n.color})` : `drop-shadow(0 0 5px ${n.color}66)` }}/>
            <text textAnchor="middle" y="2"
              style={{ fontFamily:"var(--ff-ui)", fontSize:13, fontWeight:700, fill:n.color, letterSpacing:"-.01em" }}>
              {n.glyph}
            </text>
            <text textAnchor="middle" y={r+14}
              style={{ fontFamily:"var(--ff-mono)", fontSize:9, fill:"var(--text-md)", letterSpacing:".14em" }}>
              {n.label.toUpperCase()}
            </text>
            <text textAnchor="middle" y={r+25}
              style={{ fontFamily:"var(--ff-mono)", fontSize:9, fill:"var(--text-dim)" }}>
              LV {n.lv}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ScreenSkillNetwork() {
  const nodes = [
    { id:"sleep",    label:"Sleep",     glyph:"☾", lv:18, x:140, y:120, color:"#5be7e0", size:30 },
    { id:"focus",    label:"Focus",     glyph:"◉", lv:22, x:360, y:90,  color:"#f5c451", size:32 },
    { id:"meditate", label:"Meditate",  glyph:"◯", lv:14, x:140, y:300, color:"#b07cff", size:26 },
    { id:"train",    label:"Train",     glyph:"▲", lv:20, x:580, y:180, color:"#34d6a0", size:30 },
    { id:"read",     label:"Read",      glyph:"▦", lv:16, x:360, y:280, color:"#4ea1ff", size:28 },
    { id:"create",   label:"Create",    glyph:"✦", lv:21, x:580, y:420, color:"#b07cff", size:32 },
    { id:"journal",  label:"Journal",   glyph:"≋", lv:12, x:140, y:460, color:"#34d6a0", size:24 },
    { id:"discipline",label:"Discipline",glyph:"❖", lv:25, x:360, y:460, color:"#f5c451", size:34 }
  ];
  const edges = [
    { from:"sleep",    to:"focus",      strength:.9, kind:"boost" },
    { from:"sleep",    to:"train",      strength:.7, kind:"boost" },
    { from:"meditate", to:"focus",      strength:.8, kind:"boost" },
    { from:"meditate", to:"discipline", strength:.5, kind:"boost" },
    { from:"focus",    to:"read",       strength:.6, kind:"boost" },
    { from:"read",     to:"create",     strength:.7, kind:"boost" },
    { from:"train",    to:"discipline", strength:.7, kind:"boost" },
    { from:"discipline",to:"focus",     strength:.6, kind:"boost" },
    { from:"create",   to:"sleep",      strength:.4, kind:"suppress" },
    { from:"train",    to:"create",     strength:.3, kind:"suppress" },
    { from:"journal",  to:"meditate",   strength:.5, kind:"boost" },
    { from:"journal",  to:"discipline", strength:.4, kind:"boost" }
  ];

  return (
    <div className="scr" style={{ display:"flex" }}>
      <SideNav active="skills"/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
        <TopBar title="Skill Network · Synergy Engine" crumb="EVOLUTION / NETWORK" clock="07:42:18" energy={62}/>
        <div className="scrollY" style={{ flex:1, padding:"22px 26px", display:"grid", gridTemplateColumns:"1.45fr .55fr", gap:18, gridAutoRows:"min-content" }}>

          {/* GRAPH */}
          <section className="panel glow-blue" style={{ padding:18, position:"relative", overflow:"hidden", minHeight:620 }}>
            <Brackets color="var(--c-blue-glow)" inset={6}/>
            <div className="scan-overlay"/>
            <PanelHead
              eyebrow="◈ SKILL INTERDEPENDENCY"
              title="Living synergy map · 8 nodes · 12 active links"
              right={
                <div style={{ display:"flex", gap:8 }}>
                  <StateChip label="BOOST" state="stable" small/>
                  <span className="mono" style={{ fontSize:9, color:"var(--c-crimson)", padding:"2px 7px", border:"1px solid rgba(255,90,110,.4)", borderRadius:3, letterSpacing:".16em" }}>● SUPPRESS</span>
                </div>
              }/>
            <div style={{ position:"relative", display:"grid", placeItems:"center", padding:"4px 0 18px" }}>
              <NodeGraph nodes={nodes} edges={edges} hot="focus"/>
            </div>
            <div className="mono" style={{ position:"absolute", left:24, bottom:18, fontSize:9, color:"var(--text-dim)", letterSpacing:".18em" }}>
              SELECTED · FOCUS · LV 22 · 4 inbound · 1 outbound
            </div>
          </section>

          {/* CASCADING EFFECTS */}
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <section className="panel" style={{ padding:18 }}>
              <PanelHead eyebrow="↪ CASCADE · FOCUS" title="When FOCUS climbs, these follow"/>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  ["Read",       "+0.6×", .82, "var(--c-blue)"],
                  ["Create",     "+0.4×", .54, "var(--c-violet)"],
                  ["Discipline", "+0.3×", .42, "var(--c-gold)"]
                ].map(([n, m, w, c]) => (
                  <div key={n}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}>
                      <span style={{ color:"var(--text-md)" }}>{n}</span>
                      <span className="mono" style={{ color:c }}>{m}</span>
                    </div>
                    <div className="xpbar" style={{ marginTop:4, height:3 }}>
                      <i style={{ width:`${w*100}%`, background:c, boxShadow:`0 0 6px ${c}88` }}/>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel" style={{ padding:18 }}>
              <PanelHead eyebrow="⚠ SUPPRESSION DETECTED" title="Active drains"/>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  { src:"Create", dst:"Sleep",     why:"Late sessions past 22:30", val:"-0.4×" },
                  { src:"Train",  dst:"Create",    why:"High training load consuming bandwidth", val:"-0.3×" }
                ].map((r, i) => (
                  <div key={i} style={{ padding:"10px 11px", border:"1px solid rgba(255,90,110,.25)", background:"rgba(255,90,110,.06)", borderRadius:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11 }}>
                      <span style={{ color:"var(--c-crimson)", fontWeight:600 }}>{r.src}</span>
                      <span className="mono" style={{ color:"var(--c-crimson)" }}>→</span>
                      <span style={{ color:"var(--text-hi)", fontWeight:600 }}>{r.dst}</span>
                      <span style={{ flex:1 }}/>
                      <span className="mono" style={{ color:"var(--c-crimson)", fontSize:10 }}>{r.val}</span>
                    </div>
                    <div style={{ fontSize:10, color:"var(--text-md)", marginTop:5 }}>{r.why}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel glow-emerald" style={{ padding:18, position:"relative" }}>
              <Brackets color="var(--c-emerald-glow)" inset={6}/>
              <PanelHead eyebrow="✦ KEYSTONE NODE" title="Highest leverage"/>
              <div style={{ padding:14, border:"1px solid rgba(52,214,160,.25)", borderRadius:10, background:"linear-gradient(180deg, rgba(52,214,160,.08), transparent)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:44, height:44, borderRadius:12, display:"grid", placeItems:"center", background:"radial-gradient(circle at 30% 20%, #5be7e055, #0a3a35cc 70%)", border:"1px solid rgba(91,231,224,.45)", color:"#5be7e0", fontSize:22, fontWeight:700 }}>☾</div>
                  <div>
                    <div className="mono" style={{ fontSize:9, color:"var(--text-lo)", letterSpacing:".22em" }}>NODE</div>
                    <div style={{ fontSize:15, fontWeight:600 }}>Sleep</div>
                  </div>
                </div>
                <div style={{ fontSize:11, color:"var(--text-md)", marginTop:10, lineHeight:1.5 }}>
                  Raising <b style={{ color:"var(--c-cyan)" }}>Sleep</b> by one level lifts 4 downstream systems an average of <b style={{ color:"var(--c-emerald)" }}>0.5×</b>. Highest network leverage this season.
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   3 — IDENTITY DRIFT  ·  class evolution pathway
   ════════════════════════════════════════════════════════ */

function ScreenIdentityDrift() {
  // Drift arc from current class through a corridor of probable classes
  return (
    <div className="scr" style={{ display:"flex" }}>
      <SideNav active="skills"/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
        <TopBar title="Identity · Behavioral Drift Analysis" crumb="EVOLUTION / IDENTITY" clock="07:42:18" energy={62}/>
        <div className="scrollY" style={{ flex:1, padding:"22px 26px", display:"grid", gridTemplateColumns:"1fr", gap:18 }}>

          {/* HERO: from → to */}
          <section className="panel glow-violet" style={{ padding:24, position:"relative", overflow:"hidden" }}>
            <Brackets color="var(--c-violet-glow)" inset={8}/>
            <div className="scan-overlay"/>
            <div style={{ display:"grid", gridTemplateColumns:"auto 1fr auto", gap:24, alignItems:"center", position:"relative" }}>
              <div style={{ textAlign:"center" }}>
                <Sigil size={120} hue="blue" glyph="K"/>
                <div className="mono" style={{ fontSize:9, color:"var(--text-lo)", marginTop:10, letterSpacing:".22em" }}>CURRENT · 248d</div>
                <div style={{ fontSize:16, fontWeight:700, marginTop:3, color:"var(--c-blue-2)" }}>Systems Architect</div>
                <div className="mono" style={{ fontSize:9, color:"var(--text-dim)", marginTop:2 }}>A-RANK · LV 24</div>
              </div>

              {/* drift corridor */}
              <svg viewBox="0 0 800 220" style={{ width:"100%", height:220 }}>
                <defs>
                  <linearGradient id="drift-corridor" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4ea1ff" stopOpacity=".8"/>
                    <stop offset="50%" stopColor="#5be7e0" stopOpacity=".6"/>
                    <stop offset="100%" stopColor="#b07cff" stopOpacity=".8"/>
                  </linearGradient>
                  <linearGradient id="drift-band" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4ea1ff" stopOpacity=".2"/>
                    <stop offset="100%" stopColor="#b07cff" stopOpacity=".2"/>
                  </linearGradient>
                </defs>
                {/* probability band */}
                <path d="M 30 110 Q 200 60 400 100 T 770 90 L 770 130 Q 600 170 400 140 T 30 130 Z" fill="url(#drift-band)" opacity=".6"/>
                {/* main drift line */}
                <path d="M 30 110 Q 200 70 400 100 T 770 90" fill="none" stroke="url(#drift-corridor)" strokeWidth="2.5"/>
                {/* tick marks */}
                {[100, 250, 400, 550, 700].map((x,i) => (
                  <g key={i}>
                    <line x1={x} y1={185} x2={x} y2={195} stroke="rgba(255,255,255,.15)"/>
                    <text x={x} y={210} textAnchor="middle" style={{ fontFamily:"var(--ff-mono)", fontSize:9, fill:"var(--text-dim)", letterSpacing:".18em" }}>
                      {["NOW","30d","90d","180d","1Y"][i]}
                    </text>
                  </g>
                ))}
                {/* milestone nodes along path */}
                {[
                  { x:30,  y:110, c:"#4ea1ff", label:"Systems Architect", sub:"current" },
                  { x:225, y:78,  c:"#5be7e0", label:"Systems Scholar",   sub:"+30d · 71%" },
                  { x:415, y:100, c:"#b07cff", label:"Shadow Architect",  sub:"+90d · 54%" },
                  { x:610, y:88,  c:"#b07cff", label:"Ascendant Strategist", sub:"+180d · 38%" },
                  { x:770, y:90,  c:"#f5c451", label:"???", sub:"hidden" }
                ].map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="10" fill="rgba(10,14,24,.95)" stroke={p.c} strokeWidth="1.8" style={{ filter:`drop-shadow(0 0 8px ${p.c})` }}/>
                    <circle cx={p.x} cy={p.y} r="3" fill={p.c}/>
                    <text x={p.x} y={p.y-18} textAnchor="middle" style={{ fontFamily:"var(--ff-ui)", fontSize:11, fontWeight:600, fill:"var(--text-hi)" }}>{p.label}</text>
                    <text x={p.x} y={p.y-30} textAnchor="middle" style={{ fontFamily:"var(--ff-mono)", fontSize:8, fill:p.c, letterSpacing:".18em" }}>{p.sub.toUpperCase()}</text>
                  </g>
                ))}
              </svg>

              <div style={{ textAlign:"center" }}>
                <Sigil size={120} hue="violet" glyph="?"/>
                <div className="mono" style={{ fontSize:9, color:"var(--text-lo)", marginTop:10, letterSpacing:".22em" }}>PROJECTED · 180d</div>
                <div style={{ fontSize:16, fontWeight:700, marginTop:3, color:"var(--c-violet-2)" }}>Ascendant Strategist</div>
                <div className="mono" style={{ fontSize:9, color:"var(--text-dim)", marginTop:2 }}>S-RANK · LV ~31</div>
              </div>
            </div>

            <div style={{ marginTop:18, padding:"12px 14px", background:"rgba(176,124,255,.05)", border:"1px solid rgba(176,124,255,.18)", borderRadius:8 }}>
              <div className="mono" style={{ fontSize:9, color:"var(--c-violet-2)", letterSpacing:".22em", marginBottom:4 }}>SYSTEM NOTICE</div>
              <div style={{ fontSize:13, color:"var(--text-hi)", lineHeight:1.5 }}>
                Your behavior is drifting from <b>execution-heavy</b> toward <b>strategy-heavy</b>. You are observing more, journaling more, and choosing leverage over volume. The system is preparing an archetype fusion.
              </div>
            </div>
          </section>

          {/* THREE COLUMN: BEHAVIORS · ARCHETYPES · HIDDEN */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1.05fr .85fr", gap:18 }}>

            {/* DOMINANT BEHAVIORS */}
            <section className="panel" style={{ padding:18 }}>
              <PanelHead eyebrow="◐ DOMINANT BEHAVIORS · 90d" title="What you actually do"/>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  ["System design · architecture sketching", 92, "var(--c-blue)"],
                  ["Deep reading · long-form synthesis",      78, "var(--c-blue-2)"],
                  ["Journaling · pattern logging",            71, "var(--c-emerald)"],
                  ["Music production · composition",          54, "var(--c-violet)"],
                  ["Tactical execution · shipping",           41, "var(--text-lo)", true],
                  ["Networking · external broadcast",         22, "var(--text-dim)", true]
                ].map(([n, v, c, decay]) => (
                  <div key={n}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}>
                      <span style={{ color: decay ? "var(--text-lo)" : "var(--text-md)", textDecoration: decay ? "line-through rgba(255,255,255,.25)" : "none" }}>{n}</span>
                      <span className="mono" style={{ color:c }}>{v}</span>
                    </div>
                    <div className="xpbar" style={{ marginTop:4, height:3 }}>
                      <i style={{ width:`${v}%`, background:c, boxShadow: decay ? "none" : `0 0 6px ${c}88` }}/>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mono" style={{ fontSize:9, color:"var(--text-dim)", marginTop:12, letterSpacing:".16em" }}>
                NEGLECTED: NETWORKING · TACTICAL SHIPPING
              </div>
            </section>

            {/* ARCHETYPE FUSION */}
            <section className="panel" style={{ padding:18, position:"relative" }}>
              <PanelHead eyebrow="✦ ARCHETYPE FUSION" title="Hybrid class probabilities"/>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {[
                  { from:"Iron Vanguard", op:"+", to:"Systems Scholar", out:"Strategist · Forge",   p:.71, c:"var(--c-blue)" },
                  { from:"Shadow Operative", op:"+", to:"Creative Rogue", out:"Shadow Architect", p:.54, c:"var(--c-violet)" },
                  { from:"Battle Monk", op:"+", to:"Systems Scholar", out:"Ascendant Strategist",  p:.38, c:"var(--c-gold)" },
                  { from:"Wanderer", op:"+", to:"Oracle", out:"Pathseer", p:.16, c:"var(--text-lo)" }
                ].map((f, i) => (
                  <div key={i} style={{ padding:"11px 12px", border:`1px solid ${f.c}33`, background:`${f.c}08`, borderRadius:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:11, color:"var(--text-md)" }}>
                      <span>{f.from}</span>
                      <span className="mono" style={{ color:f.c }}>{f.op}</span>
                      <span>{f.to}</span>
                      <span style={{ flex:1 }}/>
                      <span className="mono" style={{ color:f.c, fontSize:10 }}>{Math.round(f.p*100)}%</span>
                    </div>
                    <div style={{ marginTop:6, fontSize:13, fontWeight:600, color:f.c }}>→ {f.out}</div>
                    <div className="xpbar" style={{ marginTop:7, height:3 }}>
                      <i style={{ width:`${f.p*100}%`, background:f.c, boxShadow:`0 0 6px ${f.c}88` }}/>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* HIDDEN CLASSES */}
            <section className="panel" style={{ padding:18, position:"relative", overflow:"hidden" }}>
              <PanelHead eyebrow="⌬ HIDDEN ARCHETYPES" title="Locked corridors"/>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  { name:"Cathedral Builder",  unlock:"Ship for 365d straight", c:"var(--c-gold)", glyph:"⌂", locked:true },
                  { name:"Resonant Oracle",    unlock:"Meditate 100d × Sleep stable", c:"var(--c-cyan)", glyph:"◯", locked:true },
                  { name:"Shadow Architect",   unlock:"Journal 60d + System 90d", c:"var(--c-violet)", glyph:"▲", locked:false },
                  { name:"???",                unlock:"━━━━━━━━━━━━━━",  c:"var(--text-dim)", glyph:"✕", locked:true }
                ].map((c, i) => (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"32px 1fr", gap:10, padding:"9px 10px", border:`1px solid ${c.locked ? "var(--hl)" : c.c+"55"}`, borderRadius:8, background: c.locked ? "rgba(255,255,255,.015)" : `${c.c}10`, opacity: c.locked ? .65 : 1 }}>
                    <div style={{ width:32, height:32, borderRadius:8, display:"grid", placeItems:"center", border:`1px solid ${c.c}55`, background:`${c.c}15`, color:c.c, fontSize:16 }}>{c.glyph}</div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color: c.locked ? "var(--text-md)" : c.c }}>{c.name}</div>
                      <div className="mono" style={{ fontSize:9, color:"var(--text-dim)", marginTop:2, letterSpacing:".12em" }}>
                        {c.locked ? "🔒 " : "◉ "}{c.unlock.toUpperCase()}
                      </div>
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
   4 — SHADOW INDEX  ·  entropy & neglect atmospherics
   ════════════════════════════════════════════════════════ */

function ScreenShadowIndex() {
  return (
    <div className="scr" style={{ display:"flex" }}>
      <SideNav active="recovery"/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
        <TopBar title="Shadow · Entropy Index" crumb="EVOLUTION / SHADOW" clock="07:42:18" energy={62}/>

        {/* atmospheric corruption layer */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
          background:
            "radial-gradient(40% 50% at 22% 78%, rgba(255,90,110,.10), transparent 60%)," +
            "radial-gradient(35% 40% at 80% 20%, rgba(90,74,120,.18), transparent 60%)"
        }}/>

        <div className="scrollY" style={{ flex:1, padding:"22px 26px", display:"grid", gridTemplateColumns:"1.05fr .95fr", gap:18, gridAutoRows:"min-content", position:"relative", zIndex:1 }}>

          {/* HERO: SHADOW READING */}
          <section className="panel" style={{ gridColumn:"1 / span 2", padding:24, position:"relative", overflow:"hidden",
            background:"linear-gradient(180deg, rgba(40,16,30,.55) 0%, rgba(14,10,22,.78) 100%)",
            boxShadow:"inset 0 1px 0 rgba(255,255,255,.04), 0 0 0 1px rgba(255,90,110,.22), 0 0 32px -10px rgba(255,90,110,.4)"
          }}>
            <Brackets color="rgba(255,90,110,.45)" inset={8}/>
            <div className="scan-overlay" style={{ background:"linear-gradient(180deg, transparent 0%, rgba(255,90,110,.08) 50%, transparent 100%)" }}/>

            <div style={{ display:"grid", gridTemplateColumns:"auto 1fr auto", gap:24, alignItems:"center" }}>
              <div style={{ position:"relative" }}>
                <StatRing value={34} size={130} stroke={9} color="#ff5a6e" label="34" sub="ENTROPY"/>
                <div style={{ position:"absolute", inset:-10, borderRadius:"50%", border:"1px dashed rgba(255,90,110,.25)" }}/>
              </div>
              <div>
                <div className="eyebrow" style={{ color:"var(--c-crimson)" }}>◐ SHADOW READING · 07:42</div>
                <h1 className="h-display" style={{ fontSize:32, margin:"6px 0 4px" }}>
                  Three systems are accruing shadow.
                </h1>
                <div style={{ fontSize:13, color:"var(--text-md)", maxWidth:520, lineHeight:1.5 }}>
                  Neglect creates noise. Noise becomes drag. This is not failure — it is the system telling you where attention has gone quiet.
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end" }}>
                <StateChip label="ENTROPY · LOW-MED" state="fatigued"/>
                <span className="mono" style={{ fontSize:10, color:"var(--text-lo)" }}>34 / 100 · trending ↑</span>
                <Spark data={[8,9,11,10,14,16,18,22,25,28,30,34]} width={140} height={28} color="#ff5a6e"/>
              </div>
            </div>
          </section>

          {/* DEGRADATION ZONES */}
          <section className="panel" style={{ padding:18, position:"relative" }}>
            <PanelHead eyebrow="▌ DEGRADATION ZONES" title="Where the shadow lives"/>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { sys:"Sleep · Circadian", msg:"MENTAL FOG DETECTED", days:11, sev:.78, glitch:true },
                { sys:"Physical Training", msg:"PHYSICAL SYSTEM DEGRADATION", days:6, sev:.54, glitch:false },
                { sys:"Creative Practice", msg:"CREATIVE STAGNATION ACCUMULATING", days:14, sev:.62, glitch:true }
              ].map((z, i) => (
                <div key={i} style={{
                  position:"relative",
                  padding:"12px 14px",
                  border:"1px solid rgba(255,90,110,.22)",
                  background:"linear-gradient(180deg, rgba(255,90,110,.06) 0%, transparent 100%)",
                  borderRadius:8,
                  overflow:"hidden"
                }}>
                  {/* fragmented corner */}
                  <div style={{ position:"absolute", top:0, right:0, width:50, height:50,
                    background:"repeating-linear-gradient(45deg, rgba(255,90,110,.12) 0 2px, transparent 2px 6px)",
                    mask:"linear-gradient(225deg, #000, transparent 70%)",
                    WebkitMask:"linear-gradient(225deg, #000, transparent 70%)"
                  }}/>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}>
                    <div className="mono" style={{ fontSize:10, color:"var(--c-crimson)", letterSpacing:".22em",
                      filter: z.glitch ? "blur(.3px)" : "none",
                      textShadow: z.glitch ? "1px 0 rgba(91,231,224,.4), -1px 0 rgba(255,90,110,.4)" : "none"
                    }}>
                      ⚠ {z.msg}
                    </div>
                    <span className="mono" style={{ fontSize:9, color:"var(--text-lo)" }}>{z.days}d quiet</span>
                  </div>
                  <div style={{ fontSize:13, color:"var(--text-hi)", fontWeight:500 }}>{z.sys}</div>
                  <div className="xpbar cr" style={{ marginTop:8, height:3 }}>
                    <i style={{ width:`${z.sev*100}%` }}/>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SHADOW MAP — visual UI corruption */}
          <section className="panel" style={{ padding:18 }}>
            <PanelHead eyebrow="◐ SHADOW MAP · 8 SYSTEMS" title="Where light is, where it isn't"/>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
              {[
                { name:"Mind",       v:.82, shadow:.05 },
                { name:"Body",       v:.71, shadow:.18 },
                { name:"Focus",      v:.43, shadow:.55 },
                { name:"Sleep",      v:.34, shadow:.72 },
                { name:"Create",     v:.66, shadow:.38 },
                { name:"Recovery",   v:.38, shadow:.62 },
                { name:"Discipline", v:.85, shadow:.05 },
                { name:"Connection", v:.22, shadow:.78 }
              ].map((s, i) => {
                const isDark = s.shadow > 0.4;
                return (
                  <div key={i} style={{
                    aspectRatio:"1", padding:10, borderRadius:8, position:"relative",
                    border: `1px solid ${isDark ? "rgba(255,90,110,.25)" : "var(--hl)"}`,
                    background: isDark
                      ? `radial-gradient(circle at 50% 60%, rgba(40,12,20,.8), rgba(10,4,14,.95))`
                      : "rgba(255,255,255,.02)",
                    overflow:"hidden"
                  }}>
                    {isDark && (
                      <div style={{ position:"absolute", inset:0,
                        background:"repeating-linear-gradient(0deg, rgba(255,255,255,.04) 0 1px, transparent 1px 4px)",
                        mixBlendMode:"overlay", opacity:.4
                      }}/>
                    )}
                    <div className="mono" style={{ fontSize:9, color: isDark ? "rgba(255,90,110,.85)" : "var(--text-lo)", letterSpacing:".18em" }}>{s.name.toUpperCase()}</div>
                    <div style={{ marginTop:8, fontSize:20, fontWeight:700, color: isDark ? "#7a4754" : "var(--text-hi)" }}>
                      {Math.round(s.v*100)}
                    </div>
                    <div style={{ position:"absolute", bottom:8, left:10, right:10 }}>
                      <div className="xpbar" style={{ height:2, background:"rgba(255,255,255,.04)" }}>
                        <i style={{ width:`${s.v*100}%`, background: isDark ? "#ff5a6e" : "var(--c-emerald)", boxShadow:"none" }}/>
                      </div>
                    </div>
                    {s.shadow > 0.6 && (
                      <div style={{ position:"absolute", top:8, right:8, fontSize:9, color:"var(--c-crimson)", fontFamily:"var(--ff-mono)", letterSpacing:".1em" }}>●</div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* DISSOLVE RITUALS — full width */}
          <section className="panel" style={{ gridColumn:"1 / span 2", padding:18, position:"relative",
            background:"linear-gradient(180deg, rgba(20,12,30,.6), rgba(14,10,22,.78))",
            boxShadow:"inset 0 1px 0 rgba(255,255,255,.04), 0 0 0 1px rgba(176,124,255,.22)"
          }}>
            <PanelHead eyebrow="◯ DISSOLVE · LIGHT RITUALS" title="Small acts that quiet the shadow"
              right={<span className="mono" style={{ fontSize:10, color:"var(--c-violet-2)" }}>NO PUNISHMENT · NO SHAME</span>}/>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
              {[
                { glyph:"☾", label:"15m walk · no phone",       dis:"-4 entropy",  c:"var(--c-cyan)" },
                { glyph:"◯", label:"One page · journal anything", dis:"-3 entropy", c:"var(--c-violet)" },
                { glyph:"▲", label:"5 pushups · 5 squats",       dis:"-2 entropy",  c:"var(--c-emerald)" },
                { glyph:"✦", label:"Open the creative file",     dis:"-3 entropy",  c:"var(--c-gold)" }
              ].map((r, i) => (
                <div key={i} style={{ padding:"14px 14px 12px", border:`1px solid ${r.c}33`, background:`linear-gradient(180deg, ${r.c}08, transparent)`, borderRadius:10 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontSize:22, color:r.c }}>{r.glyph}</span>
                    <span className="mono" style={{ fontSize:9, color:r.c, letterSpacing:".18em" }}>{r.dis}</span>
                  </div>
                  <div style={{ fontSize:13, fontWeight:500, marginTop:10, color:"var(--text-hi)" }}>{r.label}</div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenSystemSync, ScreenSkillNetwork, ScreenIdentityDrift, ScreenShadowIndex, StateChip, ResonanceRadar, NodeGraph });
