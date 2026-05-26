/* screens-dashboard.jsx — main HUD + life domains */

function ScreenDashboard() {
  const [energy, setEnergy] = React.useState(78);
  const [quests, setQuests] = React.useState([
    { id:1, tag:"MAIN", title:"Deep work block — 90m focused coding", reward:"+180 XP · INT · DSC", multi:"×1.6", rarity:"epic", done:true  },
    { id:2, tag:"MAIN", title:"Train — Pushups, pull, kettlebell flow", reward:"+140 XP · STR · REC", multi:"×1.4", rarity:"rare", done:true  },
    { id:3, tag:"MAIN", title:"Produce — 45m music session", reward:"+160 XP · CRE", multi:"×1.4", rarity:"epic", done:false },
    { id:4, tag:"SIDE", title:"Meditation — 12m breathwork", reward:"+40 XP · FOC · SPI", multi:"×1.2", rarity:"common", done:false },
    { id:5, tag:"SIDE", title:"Read — 20 pages, marked", reward:"+60 XP · INT", multi:"×1.2", rarity:"common", done:false },
    { id:6, tag:"BONUS", title:"Cold exposure — 3m", reward:"+90 XP · DSC · REC", multi:"×1.8", rarity:"legendary", done:false },
  ]);
  const toggle = (id) => setQuests(qs => qs.map(q => q.id === id ? { ...q, done: !q.done } : q));
  const completed = quests.filter(q => q.done).length;

  return (
    <div className="scr" style={{ display:"flex" }}>
      <SideNav active="dashboard"/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
        <TopBar title="Operator · Kai Aldrich" crumb="DASHBOARD" clock="07:42:18" energy={energy}/>
        <div className="scrollY" style={{ flex:1, padding:"22px 26px", display:"grid", gridTemplateColumns:"1.05fr .95fr .85fr", gap:18, gridAutoRows:"min-content" }}>

          {/* ── HERO IDENTITY ─────────────────────────────────────── */}
          <section className="panel glow-blue" style={{ gridColumn:"1 / span 2", padding:22, position:"relative", overflow:"hidden" }}>
            <Brackets color="var(--c-blue-glow)" inset={8}/>
            <div className="scan-overlay"/>
            <div style={{ display:"grid", gridTemplateColumns:"auto 1fr auto", gap:24, alignItems:"center", position:"relative" }}>
              <div style={{ position:"relative" }}>
                <Sigil size={108} hue="blue" glyph="K"/>
                <span style={{ position:"absolute", bottom:-6, left:"50%", transform:"translateX(-50%)", padding:"3px 10px", background:"linear-gradient(135deg, var(--c-gold), #fff0c0)", color:"#3a2a05", fontFamily:"var(--ff-mono)", fontSize:10, fontWeight:700, letterSpacing:".18em", borderRadius:3, boxShadow:"0 0 14px var(--c-gold-glow)" }}>LV 24</span>
              </div>
              <div>
                <div className="eyebrow" style={{ color:"var(--c-blue-2)" }}>SYSTEMS ARCHITECT · A-RANK</div>
                <h1 className="h-display" style={{ fontSize:38, margin:"6px 0 4px" }}>Kai Aldrich</h1>
                <div style={{ display:"flex", gap:14, alignItems:"center", color:"var(--text-md)", fontSize:13 }}>
                  <span>Cycle 248</span><span style={{ color:"var(--text-dim)" }}>·</span>
                  <span>Streak <b style={{ color:"var(--c-gold)" }}>41 days</b></span>
                  <span style={{ color:"var(--text-dim)" }}>·</span>
                  <span>Momentum <b style={{ color:"var(--c-emerald)" }}>×1.6</b></span>
                </div>
                <div style={{ marginTop:14, maxWidth:380 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--text-lo)", marginBottom:5 }}>
                    <span className="mono">XP TO LV 25</span>
                    <span className="mono">14,820 / 18,000</span>
                  </div>
                  <div className="xpbar" style={{ height:8 }}><i style={{ width:"82%" }}/></div>
                </div>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <StatRing value={82} size={96} stroke={7} color="#4ea1ff" label="82%" sub="XP NEXT"/>
                <StatRing value={energy} size={96} stroke={7} color="#34d6a0" label={`${energy}`} sub="ENERGY"/>
                <StatRing value={64} size={96} stroke={7} color="#b07cff" label="×1.6" sub="MOMENTUM"/>
              </div>
            </div>

            {/* buffs / debuffs */}
            <div style={{ marginTop:18, display:"flex", gap:8, flexWrap:"wrap", position:"relative" }}>
              {[
                ["BUFF", "Cold start · +20% Focus until 12:00", "var(--c-blue)"],
                ["BUFF", "Sleep 7h41m · +12% Recovery", "var(--c-emerald)"],
                ["BUFF", "Streak ×1.6 multiplier", "var(--c-gold)"],
                ["DEBUFF", "Caffeine spike · -8% Sleep tonight", "var(--c-crimson)"],
              ].map(([t, txt, col]) => (
                <div key={txt} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px", border:`1px solid ${col}44`, background:`${col}10`, borderRadius:6 }}>
                  <span style={{ width:6, height:6, borderRadius:6, background:col, boxShadow:`0 0 8px ${col}`, animation:"glow-pulse 2.4s infinite" }}/>
                  <span className="mono" style={{ fontSize:9, color:col, letterSpacing:".16em" }}>{t}</span>
                  <span style={{ fontSize:11, color:"var(--text-md)" }}>{txt}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── ONE THING ─────────────────────────────────────────── */}
          <section className="panel glow-gold" style={{ padding:20, position:"relative", overflow:"hidden" }}>
            <Brackets color="var(--c-gold-glow)" inset={8}/>
            <div className="eyebrow" style={{ color:"var(--c-gold)" }}>◆ THE ONE THING</div>
            <div style={{ fontSize:13, color:"var(--text-lo)", marginTop:6 }}>By doing this, everything else becomes easier or unnecessary.</div>
            <div style={{ marginTop:14, padding:"14px 14px 12px", background:"linear-gradient(135deg, rgba(245,196,81,.08), rgba(245,196,81,0))", border:"1px solid rgba(245,196,81,.25)", borderRadius:10 }}>
              <div className="mono" style={{ fontSize:10, color:"var(--c-gold)", letterSpacing:".18em" }}>KEYSTONE · CAREER</div>
              <div style={{ fontSize:17, fontWeight:600, marginTop:6, lineHeight:1.3 }}>Ship one production-quality feature every weekday.</div>
              <div style={{ display:"flex", gap:14, marginTop:12, alignItems:"center" }}>
                <div style={{ flex:1 }}>
                  <div className="xpbar gd" style={{ height:5 }}><i style={{ width:"68%" }}/></div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"var(--text-lo)", marginTop:4 }} className="mono">
                    <span>17 / 25 weekly</span><span>68%</span>
                  </div>
                </div>
                <button style={{ all:"unset", cursor:"pointer", padding:"6px 12px", border:"1px solid var(--c-gold)", color:"var(--c-gold)", borderRadius:6, fontSize:11, fontWeight:600, letterSpacing:".05em" }}>FOCUS →</button>
              </div>
            </div>
          </section>

          {/* ── CORE ATTRIBUTES ───────────────────────────────────── */}
          <section className="panel" style={{ padding:20, gridColumn:"1 / span 2" }}>
            <PanelHead eyebrow="◈ CORE ATTRIBUTES" title="Stat Matrix"
              right={<span className="mono" style={{ fontSize:10, color:"var(--text-lo)" }}>9 / 9 ACTIVE</span>}/>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:8 }}>
              <AttrBar icon="ST" name="STRENGTH"    level={22} xp={64} delta="+18" color="var(--c-crimson)"/>
              <AttrBar icon="IN" name="INTELLIGENCE" level={28} xp={82} delta="+24" color="var(--c-blue)"/>
              <AttrBar icon="DS" name="DISCIPLINE"   level={31} xp={91} delta="+12" color="var(--c-gold)"/>
              <AttrBar icon="FO" name="FOCUS"        level={26} xp={71} delta="+9"  color="var(--c-violet)"/>
              <AttrBar icon="CR" name="CREATIVITY"   level={19} xp={43} delta="+22" color="var(--c-violet-2)"/>
              <AttrBar icon="SO" name="SOCIAL"       level={14} xp={28} delta="-3"  color="var(--c-cyan)" trend="down"/>
              <AttrBar icon="RE" name="RECOVERY"     level={20} xp={55} delta="+6"  color="var(--c-emerald)"/>
              <AttrBar icon="WL" name="WEALTH"       level={17} xp={36} delta="+4"  color="var(--c-gold)"/>
              <AttrBar icon="SP" name="SPIRITUAL"    level={12} xp={22} delta="—1"  decay color="var(--c-cyan)"/>
            </div>
          </section>

          {/* ── TODAY'S QUESTS ────────────────────────────────────── */}
          <section className="panel" style={{ padding:20, gridRow:"3 / span 2" }}>
            <PanelHead eyebrow="◇ DAILY QUESTS" title={`Today · ${completed} / ${quests.length}`}
              right={<span className="mono" style={{ fontSize:10, color:"var(--c-emerald)" }}>STREAK 41</span>}/>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {quests.map(q => <QuestRow key={q.id} {...q} onToggle={() => toggle(q.id)}/>)}
            </div>
          </section>

          {/* ── WEEKLY GROWTH ─────────────────────────────────────── */}
          <section className="panel" style={{ padding:20, gridColumn:"1 / span 2" }}>
            <PanelHead eyebrow="▦ WEEKLY GROWTH" title="Cumulative XP · last 14 days"
              right={
                <div style={{ display:"flex", gap:14 }}>
                  {[["INT","var(--c-blue)"],["DSC","var(--c-gold)"],["STR","var(--c-crimson)"],["CRE","var(--c-violet)"]].map(([n,c]) => (
                    <div key={n} style={{ display:"flex", alignItems:"center", gap:6, fontSize:10 }} className="mono">
                      <span style={{ width:8, height:2, background:c, boxShadow:`0 0 6px ${c}` }}/>{n}
                    </div>
                  ))}
                </div>
              }/>
            <GrowthChart/>
          </section>

          {/* ── INSIGHTS ──────────────────────────────────────────── */}
          <section className="panel glow-violet" style={{ padding:20, gridColumn:"3", gridRow:"4" }}>
            <Brackets color="var(--c-violet-glow)" inset={8}/>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <div style={{ width:24, height:24, borderRadius:6, background:"linear-gradient(135deg, var(--c-violet), var(--c-blue))", display:"grid", placeItems:"center", fontSize:11, fontWeight:700, color:"#06080f" }}>◉</div>
              <div className="eyebrow" style={{ color:"var(--c-violet-2)" }}>ORACLE · SYS-INSIGHT</div>
            </div>
            <div style={{ fontSize:13, lineHeight:1.5, color:"var(--text-md)" }}>
              Your <b style={{ color:"var(--c-violet-2)" }}>Focus stat</b> drops 24% on days following sub-7h sleep. Three of your last five missed quests followed a late session. Hard cap screens after 22:30 to recover momentum.
            </div>
            <div style={{ display:"flex", gap:8, marginTop:14 }}>
              <button style={{ flex:1, all:"unset", textAlign:"center", cursor:"pointer", padding:"8px", border:"1px solid var(--c-violet)", color:"var(--c-violet-2)", borderRadius:6, fontSize:11, fontWeight:600 }}>APPLY RULE</button>
              <button style={{ all:"unset", cursor:"pointer", padding:"8px 12px", border:"1px solid var(--hl-strong)", color:"var(--text-md)", borderRadius:6, fontSize:11 }}>Dismiss</button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function GrowthChart() {
  // multi-series area chart in SVG
  const W = 720, H = 180, P = 30;
  const days = 14;
  const series = [
    { color: "var(--c-blue)",    vals: [12,18,24,22,30,38,34,42,50,58,55,62,70,82] },
    { color: "var(--c-gold)",    vals: [10,14,18,22,24,30,32,38,40,46,50,55,60,68] },
    { color: "var(--c-crimson)", vals: [ 6,10,14,12,18,22,26,28,32,36,40,42,48,55] },
    { color: "var(--c-violet)",  vals: [ 4, 8,10,14,18,20,24,28,30,34,38,42,46,52] },
  ];
  const max = 90;
  const xy = (i, v) => [P + (i/(days-1))*(W-P*2), H-P - (v/max)*(H-P*2)];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:180, display:"block" }}>
      {/* grid */}
      {[0,.25,.5,.75,1].map((t,i) => (
        <line key={i} x1={P} x2={W-P} y1={H-P - t*(H-P*2)} y2={H-P - t*(H-P*2)} stroke="rgba(255,255,255,.05)"/>
      ))}
      {Array.from({length:days}).map((_,i) => (
        <line key={i} x1={P + i*(W-P*2)/(days-1)} x2={P + i*(W-P*2)/(days-1)} y1={H-P} y2={H-P+4} stroke="rgba(255,255,255,.12)"/>
      ))}
      {/* series */}
      {series.map((s,si) => {
        const pts = s.vals.map((v,i) => xy(i,v));
        const path = pts.map((p,i) => (i?"L":"M")+p.join(" ")).join(" ");
        const area = path + ` L ${W-P} ${H-P} L ${P} ${H-P} Z`;
        return (
          <g key={si}>
            <path d={area} fill={s.color} opacity=".08"/>
            <path d={path} fill="none" stroke={s.color} strokeWidth="1.8" style={{ filter:`drop-shadow(0 0 6px ${s.color})` }}/>
            <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill={s.color}/>
          </g>
        );
      })}
      {/* x labels */}
      {["−14","−12","−10","−8","−6","−4","−2","NOW"].map((l,i,a) => (
        <text key={l} x={P + i*(W-P*2)/(a.length-1)} y={H-8} textAnchor="middle" fill="rgba(255,255,255,.35)" fontSize="9" fontFamily="JetBrains Mono">{l}</text>
      ))}
    </svg>
  );
}

Object.assign(window, { ScreenDashboard });
