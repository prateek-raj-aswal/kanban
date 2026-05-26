/* screens-skills.jsx — Life Domains + Skill Tree + Skill detail */

function ScreenDomains() {
  const domains = [
    { id:"FIT", name:"Fitness",     rank:"A",  level:22, mom:1.4, color:"var(--c-crimson)", icon:"⌖",
      one:"Train 4×/wk strength + 1 conditioning",
      habits:["Pushups · 45/day","Run · 3×/wk","Mobility · daily"],
      weak:"Cardio sessions slipping (3→1/wk)", trend:"up" },
    { id:"CAR", name:"Career",      rank:"S",  level:31, mom:1.6, color:"var(--c-blue)",    icon:"◈",
      one:"Ship one feature/day · production-grade",
      habits:["Deep work · 2× 90m","Review PRs · daily","Write spec · Mon/Thu"],
      weak:"Email backlog 142 unread", trend:"up" },
    { id:"CRE", name:"Creativity",  rank:"B+", level:19, mom:1.3, color:"var(--c-violet)",  icon:"✦",
      one:"Produce 45m music · daily",
      habits:["Sketch · 5m","Sample dig · 15m","Sound design · 30m"],
      weak:"Releases stalled — last ship 38d", trend:"up" },
    { id:"LRN", name:"Learning",    rank:"A",  level:28, mom:1.5, color:"var(--c-cyan)",    icon:"◐",
      one:"Read 20 pages, marked + summary",
      habits:["Spaced review · 12m","Notes · Obsidian","Course · 1 lesson"],
      weak:"Math drills 6d cold", trend:"up" },
    { id:"REL", name:"Relationships", rank:"C+", level:14, mom:0.9, color:"var(--c-gold)",  icon:"◯",
      one:"One deep call/week + 3 micro-touchpoints",
      habits:["Reach out · 1/day","Date night · weekly","Family call · Sun"],
      weak:"Social atrophy debuff active", trend:"down" },
    { id:"SPI", name:"Spirituality", rank:"B",  level:18, mom:1.1, color:"var(--c-cyan)",   icon:"☉",
      one:"Meditate 12m daily · breath box",
      habits:["Sit · 12m","Journal · 3 lines","Nature · 25m"],
      weak:"Missed 2 sessions this wk", trend:"flat" },
    { id:"FIN", name:"Finance",     rank:"B+", level:21, mom:1.2, color:"var(--c-emerald)", icon:"◇",
      one:"Net worth +1% / month · automated",
      habits:["Track · weekly","Invest · auto","No-spend day · Wed"],
      weak:"Discretionary 23% over budget", trend:"flat" },
    { id:"MEN", name:"Mental",      rank:"A-", level:24, mom:1.3, color:"var(--c-violet-2)",icon:"◉",
      one:"Therapy + weekly review · Fridays",
      habits:["Therapy · weekly","Mood log · daily","Walk · 25m"],
      weak:"Mood variance widening", trend:"up" },
  ];

  return (
    <div className="scr" style={{ display:"flex" }}>
      <SideNav active="domains"/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
        <TopBar title="Life Domains · 8 Active" crumb="DOMAINS"/>
        <div className="scrollY" style={{ flex:1, padding:"22px 26px" }}>

          <section className="panel" style={{ padding:18, marginBottom:16, display:"grid", gridTemplateColumns:"1fr auto auto auto", gap:18, alignItems:"center" }}>
            <div>
              <div className="eyebrow">DOMAIN MAP · CYCLE 248</div>
              <div style={{ fontSize:20, fontWeight:600, marginTop:4 }}>Eight pillars · one keystone each.</div>
              <div style={{ color:"var(--text-md)", fontSize:12.5, marginTop:4 }}>Inspired by The One Thing — disproportionate gains from a single focal habit per domain.</div>
            </div>
            <PillStat label="STRONGEST" value="CAREER · S"   color="var(--c-blue)"/>
            <PillStat label="WEAKEST"   value="RELATIONSHIPS · C+" color="var(--c-crimson)"/>
            <PillStat label="AVG MOM"   value="×1.29" color="var(--c-gold)"/>
          </section>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14 }}>
            {domains.map(d => <DomainCard key={d.id} d={d}/>)}
          </div>

          <section className="panel" style={{ padding:20, marginTop:16 }}>
            <PanelHead eyebrow="◬ KEYSTONE BALANCE" title="Domain investment · last 30 days"
              right={<span className="mono" style={{ fontSize:10, color:"var(--text-lo)" }}>OVER-INVESTED · CAREER, FITNESS</span>}/>
            <DomainRadar/>
          </section>
        </div>
      </div>
    </div>
  );
}

function DomainCard({ d }) {
  return (
    <div className="panel" style={{ padding:16, position:"relative", overflow:"hidden" }}>
      <span style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, transparent, ${d.color}, transparent)`, opacity:.7 }}/>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:`${d.color}1a`, border:`1px solid ${d.color}55`, color:d.color, display:"grid", placeItems:"center", fontSize:16 }}>{d.icon}</div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:"var(--text-hi)" }}>{d.name}</div>
            <div className="mono" style={{ fontSize:9, color:"var(--text-lo)", letterSpacing:".18em" }}>LV {d.level} · MOM ×{d.mom.toFixed(1)}</div>
          </div>
        </div>
        <span style={{ padding:"3px 8px", border:`1px solid ${d.color}`, color:d.color, borderRadius:4, fontFamily:"var(--ff-mono)", fontSize:11, fontWeight:700, letterSpacing:".1em" }}>{d.rank}</span>
      </div>
      <div style={{ marginTop:14, padding:"10px 12px", background:`linear-gradient(135deg, ${d.color}10, transparent)`, border:`1px solid ${d.color}33`, borderRadius:8 }}>
        <div className="mono" style={{ fontSize:9, color:d.color, letterSpacing:".18em" }}>◆ ONE THING</div>
        <div style={{ fontSize:12.5, color:"var(--text-hi)", marginTop:4, lineHeight:1.35 }}>{d.one}</div>
      </div>
      <div style={{ marginTop:10 }}>
        <div className="mono" style={{ fontSize:9, color:"var(--text-lo)", letterSpacing:".18em", marginBottom:6 }}>SUPPORT HABITS</div>
        {d.habits.map(h => (
          <div key={h} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"var(--text-md)", padding:"3px 0" }}>
            <span style={{ width:3, height:3, borderRadius:3, background:d.color }}/>
            {h}
          </div>
        ))}
      </div>
      <div style={{ marginTop:10, paddingTop:10, borderTop:"1px dashed var(--hl)" }}>
        <div className="mono" style={{ fontSize:9, color:"var(--c-crimson)", letterSpacing:".18em" }}>△ WEAKNESS</div>
        <div style={{ fontSize:11, color:"var(--text-md)", marginTop:3 }}>{d.weak}</div>
      </div>
      <div style={{ marginTop:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <Spark width={90} height={22} color={d.color} data={Array.from({length:14}, (_,i) => 4 + Math.abs(Math.sin(i*.5+d.level*.1))*6 + i*(d.trend === "down" ? -.2 : .35))}/>
        <span className="mono" style={{ fontSize:10, color: d.trend === "up" ? "var(--c-emerald)" : d.trend === "down" ? "var(--c-crimson)" : "var(--text-lo)" }}>
          {d.trend === "up" ? "↑" : d.trend === "down" ? "↓" : "→"} {d.trend.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

function DomainRadar() {
  const axes = ["Fitness","Career","Creativity","Learning","Relationships","Spirituality","Finance","Mental"];
  const data = [.65, .92, .58, .78, .35, .55, .68, .72];
  const cx=200, cy=140, R=110;
  const ang = i => -Math.PI/2 + i * 2*Math.PI/axes.length;
  const pt = (i, r) => [cx + Math.cos(ang(i))*R*r, cy + Math.sin(ang(i))*R*r];
  return (
    <svg viewBox="0 0 760 280" width="100%" height={280}>
      <g transform="translate(180, 0)">
        {[.25,.5,.75,1].map(r => (
          <polygon key={r} points={axes.map((_,i) => pt(i,r).join(",")).join(" ")} fill="none" stroke="rgba(255,255,255,.06)"/>
        ))}
        {axes.map((_,i) => (
          <line key={i} x1={cx} y1={cy} x2={pt(i,1)[0]} y2={pt(i,1)[1]} stroke="rgba(255,255,255,.05)"/>
        ))}
        <polygon points={axes.map((_,i) => pt(i, data[i]).join(",")).join(" ")} fill="rgba(78,161,255,.15)" stroke="var(--c-blue)" strokeWidth="1.5" style={{ filter:"drop-shadow(0 0 6px var(--c-blue))" }}/>
        {axes.map((a,i) => {
          const [x,y] = pt(i, 1.18);
          return <text key={a} x={x} y={y} textAnchor="middle" alignmentBaseline="middle" fontSize="10" fill="rgba(255,255,255,.55)" fontFamily="JetBrains Mono" letterSpacing=".1em">{a.toUpperCase()}</text>
        })}
        {data.map((v,i) => <circle key={i} cx={pt(i,v)[0]} cy={pt(i,v)[1]} r="3" fill="var(--c-blue)"/>)}
      </g>
      {/* legend */}
      <g transform="translate(560, 40)">
        <text x="0" y="0"  fontFamily="JetBrains Mono" fontSize="10" fill="rgba(255,255,255,.35)" letterSpacing=".15em">RING SCALE</text>
        {["0","25","50","75","100"].map((l,i) => (
          <text key={l} x="0" y={20 + i*16} fontFamily="JetBrains Mono" fontSize="10" fill="rgba(255,255,255,.5)">{l.padStart(3,"·")}</text>
        ))}
        <text x="0" y="140" fontFamily="JetBrains Mono" fontSize="10" fill="rgba(78,161,255,.8)" letterSpacing=".15em">▦ CURRENT</text>
        <text x="0" y="158" fontFamily="JetBrains Mono" fontSize="10" fill="rgba(255,255,255,.35)" letterSpacing=".15em">14% deviation</text>
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   SKILL TREE
   ───────────────────────────────────────────────────────────── */

function ScreenSkillTree() {
  // graph data: each node: id, x, y, label, tier, branch, state(locked/in/mastered)
  const branches = {
    code:   { color:"var(--c-blue)",    label:"CODE PATH" },
    body:   { color:"var(--c-crimson)", label:"BODY PATH" },
    sound:  { color:"var(--c-violet)",  label:"SOUND PATH" },
    mind:   { color:"var(--c-gold)",    label:"MIND PATH" },
  };

  const nodes = [
    // root
    { id:"root", x:480, y:340, label:"OPERATOR", state:"core", branch:"core" },
    // CODE branch (up-left)
    { id:"c1", x:300, y:280, label:"Scripts",          state:"mastered", branch:"code", level:5 },
    { id:"c2", x:180, y:220, label:"Systems Design",   state:"mastered", branch:"code", level:5 },
    { id:"c3", x:100, y:140, label:"Architecture",     state:"in-progress", branch:"code", level:3 },
    { id:"c4", x:200, y:60,  label:"Distributed Mind", state:"unlocked", branch:"code", level:1 },
    { id:"c5", x:60,  y:60,  label:"Compiler Path",    state:"locked", branch:"code" },
    // BODY branch (up-right)
    { id:"b1", x:660, y:280, label:"Conditioning",     state:"mastered", branch:"body", level:4 },
    { id:"b2", x:780, y:220, label:"Strength",         state:"mastered", branch:"body", level:5 },
    { id:"b3", x:860, y:140, label:"Iron Body",        state:"in-progress", branch:"body", level:2 },
    { id:"b4", x:760, y:60,  label:"Forge Discipline", state:"unlocked", branch:"body" },
    { id:"b5", x:900, y:60,  label:"Stoic Frame",      state:"locked", branch:"body" },
    // SOUND branch (down-left)
    { id:"s1", x:300, y:420, label:"Theory",           state:"mastered", branch:"sound", level:3 },
    { id:"s2", x:180, y:480, label:"Sound Design",     state:"in-progress", branch:"sound", level:2 },
    { id:"s3", x:100, y:560, label:"Producer",         state:"unlocked", branch:"sound" },
    { id:"s4", x:240, y:600, label:"Composer",         state:"locked", branch:"sound" },
    // MIND branch (down-right)
    { id:"m1", x:660, y:420, label:"Reading",          state:"mastered", branch:"mind", level:5 },
    { id:"m2", x:780, y:480, label:"Writing",          state:"in-progress", branch:"mind", level:3 },
    { id:"m3", x:860, y:560, label:"Strategist",       state:"unlocked", branch:"mind" },
    { id:"m4", x:720, y:600, label:"Oracle",           state:"locked", branch:"mind" },
  ];
  const edges = [
    ["root","c1"],["c1","c2"],["c2","c3"],["c3","c4"],["c3","c5"],
    ["root","b1"],["b1","b2"],["b2","b3"],["b3","b4"],["b3","b5"],
    ["root","s1"],["s1","s2"],["s2","s3"],["s3","s4"],
    ["root","m1"],["m1","m2"],["m2","m3"],["m3","m4"],
  ];
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));

  const [selected, setSelected] = React.useState("c3");
  const node = byId[selected] || byId.c3;

  return (
    <div className="scr" style={{ display:"flex" }}>
      <SideNav active="skills"/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
        <TopBar title="Skill Tree · Class Architect" crumb="ASCENSION MAP"/>
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 320px", gap:0, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"relative", overflow:"hidden" }}>
            {/* background grid */}
            <svg viewBox="0 0 960 680" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ position:"absolute", inset:0 }}>
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,.04)"/>
                </pattern>
                <radialGradient id="rootGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(78,161,255,.4)"/>
                  <stop offset="100%" stopColor="rgba(78,161,255,0)"/>
                </radialGradient>
              </defs>
              <rect width="960" height="680" fill="url(#grid)"/>
              <circle cx="480" cy="340" r="280" fill="url(#rootGlow)" opacity=".6"/>

              {/* edges */}
              {edges.map(([a,b]) => {
                const A = byId[a], B = byId[b];
                const color = branches[B.branch]?.color || "rgba(255,255,255,.2)";
                const active = B.state === "mastered" || B.state === "in-progress";
                return (
                  <line key={a+b} x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                    stroke={active ? color : "rgba(255,255,255,.08)"}
                    strokeWidth={active ? 1.5 : 1}
                    strokeDasharray={B.state === "locked" ? "3 5" : "none"}
                    style={{ filter: active ? `drop-shadow(0 0 4px ${color})` : "none" }}/>
                );
              })}

              {/* nodes */}
              {nodes.map(n => {
                const color = n.branch === "core" ? "var(--c-gold)" : branches[n.branch].color;
                const r = n.state === "core" ? 28 : n.state === "mastered" ? 22 : n.state === "in-progress" ? 22 : n.state === "unlocked" ? 18 : 14;
                const isSel = n.id === selected;
                return (
                  <g key={n.id} onClick={() => setSelected(n.id)} style={{ cursor:"pointer" }}>
                    {n.state === "in-progress" && <circle cx={n.x} cy={n.y} r={r+8} fill="none" stroke={color} strokeWidth="1" strokeDasharray="2 4" style={{ animation: "glow-pulse 2.4s infinite" }}/>}
                    {isSel && <circle cx={n.x} cy={n.y} r={r+12} fill="none" stroke={color} strokeWidth="1"/>}
                    <circle cx={n.x} cy={n.y} r={r}
                      fill={n.state === "locked" ? "rgba(255,255,255,.02)" : `${color}22`}
                      stroke={color}
                      strokeWidth={isSel ? 2 : 1}
                      style={{ filter: n.state === "locked" ? "none" : `drop-shadow(0 0 ${isSel?12:6}px ${color})` }}/>
                    {n.state === "core" && (
                      <>
                        <polygon points={`${n.x},${n.y-14} ${n.x+12},${n.y-4} ${n.x+12},${n.y+10} ${n.x},${n.y+18} ${n.x-12},${n.y+10} ${n.x-12},${n.y-4}`} fill="none" stroke="var(--c-gold)" strokeWidth="1"/>
                        <text x={n.x} y={n.y+5} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--c-gold)" fontFamily="Space Grotesk">★</text>
                      </>
                    )}
                    {n.state === "mastered" && (
                      <text x={n.x} y={n.y+4} textAnchor="middle" fontSize="13" fontWeight="700" fill={color} fontFamily="Space Grotesk">✦</text>
                    )}
                    {n.state === "in-progress" && (
                      <text x={n.x} y={n.y+4} textAnchor="middle" fontSize="12" fontWeight="700" fill={color}>{n.level}</text>
                    )}
                    {n.state === "unlocked" && (
                      <circle cx={n.x} cy={n.y} r="3" fill={color}/>
                    )}
                    {n.state === "locked" && (
                      <text x={n.x} y={n.y+4} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,.3)">⌬</text>
                    )}
                    <text x={n.x} y={n.y + r + 14} textAnchor="middle" fontSize="10" fill={n.state === "locked" ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.7)"} fontFamily="Space Grotesk" letterSpacing=".05em">{n.label}</text>
                  </g>
                );
              })}

              {/* branch labels */}
              <text x="100" y="30" fontFamily="JetBrains Mono" fontSize="10" letterSpacing=".22em" fill="var(--c-blue)">▲ CODE</text>
              <text x="800" y="30" fontFamily="JetBrains Mono" fontSize="10" letterSpacing=".22em" fill="var(--c-crimson)">BODY ▲</text>
              <text x="100" y="660" fontFamily="JetBrains Mono" fontSize="10" letterSpacing=".22em" fill="var(--c-violet)">▼ SOUND</text>
              <text x="800" y="660" fontFamily="JetBrains Mono" fontSize="10" letterSpacing=".22em" fill="var(--c-gold)">MIND ▼</text>
            </svg>

            {/* HUD overlays in corners */}
            <div style={{ position:"absolute", top:18, left:18, padding:"8px 12px", border:"1px solid var(--hl)", background:"rgba(10,14,24,.7)", borderRadius:6, backdropFilter:"blur(6px)" }}>
              <div className="mono" style={{ fontSize:9, color:"var(--text-lo)", letterSpacing:".18em" }}>NODES UNLOCKED</div>
              <div style={{ fontSize:18, fontWeight:700, marginTop:2 }}>14<span style={{ color:"var(--text-lo)", fontSize:11 }}> / 21</span></div>
            </div>
            <div style={{ position:"absolute", top:18, right:18, padding:"8px 12px", border:"1px solid var(--hl)", background:"rgba(10,14,24,.7)", borderRadius:6, backdropFilter:"blur(6px)" }}>
              <div className="mono" style={{ fontSize:9, color:"var(--c-gold)", letterSpacing:".18em" }}>SKILL POINTS</div>
              <div style={{ fontSize:18, fontWeight:700, marginTop:2, color:"var(--c-gold)" }}>3</div>
            </div>
          </div>

          {/* selection panel */}
          <aside style={{ borderLeft:"1px solid var(--hl)", background:"linear-gradient(180deg, rgba(10,14,24,.85), rgba(6,8,15,.85))", padding:22, overflow:"auto", position:"relative" }}>
            <SkillDetail node={node} branchColor={node.branch === "core" ? "var(--c-gold)" : branches[node.branch].color}/>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SkillDetail({ node, branchColor }) {
  const isLocked = node.state === "locked";
  const tierLabels = ["Initiate","Adept","Practitioner","Expert","Master","Ascendant"];
  const tier = node.level ?? 0;
  return (
    <div>
      <div className="eyebrow" style={{ color: branchColor }}>◆ NODE INSPECTION</div>
      <div style={{ marginTop:14, padding:14, border:`1px solid ${branchColor}55`, background:`${branchColor}0a`, borderRadius:10, position:"relative", overflow:"hidden" }}>
        <Brackets color={branchColor} inset={5}/>
        <div className="mono" style={{ fontSize:9, color:branchColor, letterSpacing:".22em" }}>{node.state.toUpperCase()}</div>
        <div style={{ fontSize:22, fontWeight:700, marginTop:6, color: isLocked ? "var(--text-md)" : "var(--text-hi)" }}>{node.label}</div>
        <div className="mono" style={{ fontSize:10, color:"var(--text-lo)", marginTop:4 }}>
          {node.branch === "code" ? "PATH OF SYSTEMS" : node.branch === "body" ? "PATH OF IRON" : node.branch === "sound" ? "PATH OF SOUND" : node.branch === "mind" ? "PATH OF MIND" : "CORE"}
        </div>
      </div>

      <div style={{ marginTop:18 }}>
        <div className="eyebrow">TIER PROGRESSION</div>
        <div style={{ marginTop:8, display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap:4 }}>
          {tierLabels.map((t,i) => (
            <div key={t} style={{ height:6, borderRadius:2, background: i < tier ? branchColor : "rgba(255,255,255,.06)", boxShadow: i < tier ? `0 0 6px ${branchColor}` : "none" }}/>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:10, color:"var(--text-lo)" }} className="mono">
          <span>{tierLabels[Math.max(0, tier-1)] || "—"}</span>
          <span style={{ color: branchColor }}>{tierLabels[tier-1] || "Locked"}</span>
        </div>
      </div>

      <div style={{ marginTop:18 }}>
        <div className="eyebrow">EFFECTS</div>
        <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:6 }}>
          {[
            ["+ 12% XP gain — Career quests", "var(--c-emerald)"],
            ["+ 0.2× momentum multiplier when 3+ deep-work blocks chain", "var(--c-gold)"],
            ["Unlock: Distributed Mind node", "var(--c-blue)"],
            isLocked && ["LOCKED · requires Architecture LV 4", "var(--c-crimson)"],
          ].filter(Boolean).map(([t,c]) => (
            <div key={t} style={{ display:"grid", gridTemplateColumns:"6px 1fr", gap:8, padding:"7px 10px", background:"rgba(255,255,255,.02)", border:"1px solid var(--hl)", borderRadius:6 }}>
              <span style={{ background:c, borderRadius:2 }}/>
              <span style={{ fontSize:11.5, color:"var(--text-md)" }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop:18 }}>
        <div className="eyebrow">EVOLUTION</div>
        <div style={{ marginTop:8, padding:12, border:"1px dashed var(--hl-strong)", borderRadius:8 }}>
          <div className="mono" style={{ fontSize:10, color:"var(--text-lo)", letterSpacing:".18em" }}>NEXT FORM</div>
          <div style={{ fontSize:13, color:"var(--text-hi)", marginTop:4, fontWeight:600 }}>Distributed Mind</div>
          <div style={{ fontSize:11, color:"var(--text-md)", marginTop:6, lineHeight:1.5 }}>
            Compounds Architecture mastery into systems thinking applied across all life domains.
          </div>
        </div>
      </div>

      <button disabled={isLocked} style={{
        all:"unset", display:"block", textAlign:"center", marginTop:18,
        width:"100%", padding:"12px", borderRadius:8, cursor: isLocked ? "not-allowed" : "pointer",
        background: isLocked ? "rgba(255,255,255,.04)" : `linear-gradient(135deg, ${branchColor}, ${branchColor}88)`,
        color: isLocked ? "var(--text-dim)" : "#06080f",
        fontWeight:700, letterSpacing:".05em", fontSize:12,
        border: isLocked ? "1px dashed var(--hl-strong)" : "none"
      }}>
        {isLocked ? "REQUIREMENTS NOT MET" : "INVEST SKILL POINT →"}
      </button>
    </div>
  );
}

Object.assign(window, { ScreenDomains, ScreenSkillTree });
