/* hud-shared.jsx — atoms shared across screens */

// Animated radial stat ring
function StatRing({ value=72, size=120, stroke=8, color="#4ea1ff", label="LV 24", sub="XP", glow=true, dashed=false }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (value/100) * c;
  return (
    <div style={{ position:"relative", width:size, height:size }}>
      <svg width={size} height={size} style={{ display:"block", transform:"rotate(-90deg)" }}>
        <defs>
          <linearGradient id={`g-${color.slice(1)}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1"/>
            <stop offset="100%" stopColor={color} stopOpacity=".4"/>
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={stroke} />
        {dashed && (
          <circle cx={size/2} cy={size/2} r={r-stroke-3} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1" strokeDasharray="2 4"/>
        )}
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={`url(#g-${color.slice(1)})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c-dash}`}
          style={{ filter: glow ? `drop-shadow(0 0 6px ${color})` : "none", transition: "stroke-dasharray .6s ease" }}
        />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <div className="mono" style={{ fontSize:10, color:"var(--text-lo)", letterSpacing:".18em" }}>{sub}</div>
        <div style={{ fontWeight:700, fontSize: size > 110 ? 26 : 20, marginTop:2, color:"var(--text-hi)" }}>{label}</div>
      </div>
    </div>
  );
}

// Attribute bar — stat name, level, mini XP bar, delta
function AttrBar({ icon, name, level, xp=60, delta="+12", trend="up", color="var(--c-blue)", decay=false }) {
  const trendColor = decay ? "var(--c-crimson)" : (trend === "up" ? "var(--c-emerald)" : "var(--text-lo)");
  return (
    <div style={{ display:"grid", gridTemplateColumns:"22px 1fr auto", gap:10, alignItems:"center", padding:"8px 12px", borderRadius:8, background:"rgba(255,255,255,.015)", border:"1px solid var(--hl)" }}>
      <div style={{ width:22, height:22, borderRadius:6, background:`linear-gradient(135deg, ${color}33, transparent)`, border:`1px solid ${color}55`, display:"grid", placeItems:"center", color: color, fontFamily:"var(--ff-mono)", fontSize:10, fontWeight:700 }}>{icon}</div>
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
          <div style={{ fontSize:11, color:"var(--text-md)", letterSpacing:".05em" }}>{name}</div>
          <div className="mono" style={{ fontSize:10, color:"var(--text-lo)" }}>LV {level}</div>
        </div>
        <div className="xpbar" style={{ marginTop:4, height:4 }}>
          <i style={{ width:`${xp}%`, background:`linear-gradient(90deg, ${color}, ${color}aa)`, boxShadow:`0 0 8px ${color}88` }}/>
        </div>
      </div>
      <div className="mono" style={{ fontSize:10, color: trendColor, minWidth:30, textAlign:"right" }}>{delta}</div>
    </div>
  );
}

// Quest row (interactive checkbox)
function QuestRow({ done=false, rarity="common", title="Deep work — 90m", reward="+120 XP · Focus", multi="×1.4", tag="MAIN", onToggle }) {
  const rarityColor = {
    common: "var(--text-lo)",
    rare: "var(--c-blue)",
    epic: "var(--c-violet)",
    legendary: "var(--c-gold)"
  }[rarity];
  return (
    <button
      onClick={onToggle}
      style={{
        all:"unset", cursor:"pointer", display:"grid",
        gridTemplateColumns:"20px 1fr auto", gap:12,
        padding:"11px 14px",
        background: done ? "rgba(52,214,160,.05)" : "rgba(255,255,255,.015)",
        border: `1px solid ${done ? "rgba(52,214,160,.25)" : "var(--hl)"}`,
        borderRadius:10,
        position:"relative",
        transition:"background .2s, border-color .2s"
      }}>
      <span className={`qbox ${done ? "done" : ""}`}>
        {done && <svg viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </span>
      <div style={{ minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span className="mono" style={{ fontSize:9, color: rarityColor, letterSpacing:".18em", padding:"2px 6px", border:`1px solid ${rarityColor}66`, borderRadius:3 }}>{tag}</span>
          <div style={{ fontSize:13, color: done ? "var(--text-lo)" : "var(--text-hi)", fontWeight:500, textDecoration: done ? "line-through" : "none" }}>{title}</div>
        </div>
        <div className="mono" style={{ fontSize:10, color:"var(--text-lo)", marginTop:4 }}>{reward}</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
        <span className="mono" style={{ fontSize:10, color:"var(--c-gold)", fontWeight:600 }}>{multi}</span>
        <span className="mono" style={{ fontSize:9, color:"var(--text-dim)" }}>streak</span>
      </div>
    </button>
  );
}

// HUD-style corner brackets — wrap any panel for the cinematic feel
function Brackets({ color="rgba(78,161,255,.5)", size=10, inset=-1, thickness=1 }) {
  const corner = (pos) => ({
    position:"absolute",
    width:size, height:size,
    borderColor: color,
    borderStyle:"solid",
    pointerEvents:"none",
    ...pos,
  });
  return (
    <>
      <span style={{ ...corner({ top:inset, left:inset, borderWidth:`${thickness}px 0 0 ${thickness}px` }) }}/>
      <span style={{ ...corner({ top:inset, right:inset, borderWidth:`${thickness}px ${thickness}px 0 0` }) }}/>
      <span style={{ ...corner({ bottom:inset, left:inset, borderWidth:`0 0 ${thickness}px ${thickness}px` }) }}/>
      <span style={{ ...corner({ bottom:inset, right:inset, borderWidth:`0 ${thickness}px ${thickness}px 0` }) }}/>
    </>
  );
}

// Section header used inside panels
function PanelHead({ eyebrow, title, right }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:12 }}>
      <div>
        {eyebrow && <div className="eyebrow" style={{ marginBottom:4 }}>{eyebrow}</div>}
        <div style={{ fontSize:14, fontWeight:600, letterSpacing:".01em" }}>{title}</div>
      </div>
      {right}
    </div>
  );
}

// Avatar tile — abstract sigil instead of photo (RPG-y)
function Sigil({ size=72, hue="blue", glyph="A" }) {
  const colors = {
    blue: ["#4ea1ff", "#1e3a6b"],
    violet:["#b07cff", "#3a1e6b"],
    emerald:["#34d6a0", "#0e3a2c"],
    gold:["#f5c451", "#5a4310"],
    crimson:["#ff5a6e", "#5a1822"]
  }[hue] || ["#4ea1ff", "#1e3a6b"];
  return (
    <div style={{
      width:size, height:size, position:"relative",
      borderRadius:14,
      background: `radial-gradient(circle at 30% 20%, ${colors[0]}55, ${colors[1]}cc 60%, #0a0e18 100%)`,
      border:`1px solid ${colors[0]}66`,
      display:"grid", placeItems:"center",
      boxShadow:`0 0 24px -6px ${colors[0]}88, inset 0 0 24px ${colors[1]}88`,
      overflow:"hidden"
    }}>
      <svg viewBox="0 0 100 100" width="80%" height="80%" style={{ position:"absolute", opacity:.18 }}>
        <polygon points="50,5 95,30 95,70 50,95 5,70 5,30" fill="none" stroke={colors[0]} strokeWidth="1"/>
        <polygon points="50,18 82,35 82,65 50,82 18,65 18,35" fill="none" stroke={colors[0]} strokeWidth="1"/>
        <circle cx="50" cy="50" r="22" fill="none" stroke={colors[0]} strokeWidth="1" strokeDasharray="2 3"/>
      </svg>
      <div style={{ position:"relative", fontWeight:800, fontSize:size*.42, color: colors[0], textShadow:`0 0 12px ${colors[0]}`, letterSpacing:"-.04em" }}>{glyph}</div>
    </div>
  );
}

// Tiny sparkline
function Spark({ data=[3,5,4,7,6,9,8,11,9,12,11,14], width=120, height=28, color="var(--c-blue)", fill=true }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v,i) => {
    const x = (i / (data.length-1)) * width;
    const y = height - ((v - min) / (max - min || 1)) * (height - 4) - 2;
    return [x,y];
  });
  const path = pts.map((p,i) => (i===0?"M":"L") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = path + ` L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg width={width} height={height} style={{ display:"block" }}>
      {fill && <path d={area} fill={color} opacity=".12"/>}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

// Heatmap (year contributions style)
function Heatmap({ weeks=24, color="var(--c-emerald)" }) {
  const cells = [];
  for (let w=0; w<weeks; w++) {
    for (let d=0; d<7; d++) {
      const v = Math.random();
      const intensity = v < .2 ? 0 : v < .45 ? .25 : v < .7 ? .5 : v < .88 ? .75 : 1;
      cells.push(intensity);
    }
  }
  return (
    <div style={{ display:"grid", gridTemplateRows:"repeat(7, 9px)", gridAutoFlow:"column", gridAutoColumns:"9px", gap:2 }}>
      {cells.map((v,i) => (
        <div key={i} style={{
          background: v === 0 ? "rgba(255,255,255,.04)" : color,
          opacity: v === 0 ? 1 : .25 + v*.75,
          borderRadius:2
        }}/>
      ))}
    </div>
  );
}

// Layered side nav used by hi-fi desktop screens
function SideNav({ active="dashboard" }) {
  const items = [
    ["dashboard", "◈", "System"],
    ["quests",    "◇", "Quests"],
    ["domains",   "◎", "Domains"],
    ["skills",    "✦", "Skill Tree"],
    ["analytics", "▦", "Analytics"],
    ["coach",     "◉", "Oracle"],
    ["recovery",  "◐", "Recovery"],
  ];
  return (
    <nav style={{
      width:72, padding:"22px 0",
      borderRight:"1px solid var(--hl)",
      background:"linear-gradient(180deg, rgba(10,14,24,.9), rgba(6,8,15,.9))",
      display:"flex", flexDirection:"column", alignItems:"center", gap:6,
      position:"relative"
    }}>
      <div style={{
        width:36, height:36, borderRadius:10,
        background:"linear-gradient(135deg, var(--c-blue), var(--c-violet))",
        display:"grid", placeItems:"center",
        boxShadow:"0 0 20px -4px var(--c-blue-glow)",
        fontWeight:800, color:"#06080f", marginBottom:18
      }}>A</div>
      {items.map(([id, gl, label]) => {
        const on = id === active;
        return (
          <div key={id} title={label} style={{
            width:44, height:44, borderRadius:10,
            display:"grid", placeItems:"center",
            color: on ? "var(--c-blue-2)" : "var(--text-lo)",
            background: on ? "linear-gradient(135deg, rgba(78,161,255,.16), rgba(176,124,255,.08))" : "transparent",
            border: on ? "1px solid var(--hl-blue)" : "1px solid transparent",
            position:"relative", fontSize:18
          }}>
            {on && <span style={{ position:"absolute", left:-9, top:8, bottom:8, width:2, background:"var(--c-blue)", borderRadius:2, boxShadow:"0 0 8px var(--c-blue-glow)" }}/>}
            {gl}
          </div>
        );
      })}
      <div style={{ flex:1 }}/>
      <div style={{
        width:36, height:36, borderRadius:"50%",
        background:"linear-gradient(135deg, #2a3450, #131a29)",
        border:"1px solid var(--hl)",
        display:"grid", placeItems:"center",
        color:"var(--c-gold)", fontWeight:700, fontSize:13
      }}>K</div>
    </nav>
  );
}

// Top bar
function TopBar({ title="System Dashboard", crumb="HOME", clock="07:42:18", energy=78 }) {
  return (
    <header style={{
      height:54, padding:"0 22px",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      borderBottom:"1px solid var(--hl)",
      background:"linear-gradient(180deg, rgba(10,14,24,.5), transparent)"
    }}>
      <div>
        <div className="eyebrow">SYSTEM // {crumb}</div>
        <div style={{ fontSize:15, fontWeight:600, letterSpacing:"-.01em", marginTop:1 }}>{title}</div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ width:6, height:6, borderRadius:6, background:"var(--c-emerald)", boxShadow:"0 0 8px var(--c-emerald-glow)" }}/>
          <span className="mono" style={{ fontSize:10, color:"var(--text-md)" }}>ONLINE</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span className="tag">CYCLE</span>
          <span className="mono" style={{ fontSize:12, color:"var(--text-hi)" }}>{clock}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span className="tag">ENERGY</span>
          <div style={{ width:80 }}>
            <div className="xpbar em"><i style={{ width:`${energy}%` }}/></div>
          </div>
          <span className="mono" style={{ fontSize:11, color:"var(--c-emerald)" }}>{energy}%</span>
        </div>
      </div>
    </header>
  );
}

Object.assign(window, { StatRing, AttrBar, QuestRow, Brackets, PanelHead, Sigil, Spark, Heatmap, SideNav, TopBar });
