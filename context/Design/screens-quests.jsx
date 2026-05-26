/* screens-quests.jsx — Daily Quests detailed + Recovery */

function ScreenQuests() {
  const categories = [
    { tag:"MAIN", title:"Main Quests", color:"var(--c-gold)", quests: [
      { rarity:"epic", title:"Deep work block — ship feature increment", reward:"+180 XP", attrs:["INT","DSC"], multi:"×1.6", done:true,  time:"06:00–07:30", streak:41 },
      { rarity:"epic", title:"Train · strength session — push/pull", reward:"+160 XP", attrs:["STR","REC"], multi:"×1.4", done:true,  time:"08:00–08:45", streak:18 },
      { rarity:"epic", title:"Music production — 45m session", reward:"+170 XP", attrs:["CRE","DSC"], multi:"×1.4", done:false, time:"20:00–20:45", streak:9  },
    ]},
    { tag:"SIDE", title:"Side Quests", color:"var(--c-blue)", quests: [
      { rarity:"rare", title:"Meditation · breathwork 12m", reward:"+60 XP",  attrs:["FOC","SPI"], multi:"×1.2", done:false, time:"12:30", streak:23 },
      { rarity:"common", title:"Read · 20 marked pages",      reward:"+50 XP",  attrs:["INT"],       multi:"×1.2", done:false, time:"21:30", streak:31 },
      { rarity:"rare", title:"Journal · 3-line review",     reward:"+40 XP",  attrs:["SPI","FOC"], multi:"×1.2", done:false, time:"22:00", streak:14 },
    ]},
    { tag:"RECOVER", title:"Recovery Quests", color:"var(--c-emerald)", quests: [
      { rarity:"rare", title:"Walk · 25m outdoor / no audio", reward:"+45 XP", attrs:["REC"], multi:"×1.1", done:true, time:"13:30", streak:7 },
      { rarity:"rare", title:"Hydrate · 2.5L by 18:00",       reward:"+30 XP", attrs:["REC"], multi:"×1.0", done:false, time:"all-day", streak:5 },
    ]},
    { tag:"BONUS", title:"Bonus Challenges", color:"var(--c-violet)", quests: [
      { rarity:"legendary", title:"Cold exposure — 3m sub-12°C", reward:"+120 XP", attrs:["DSC","REC","STR"], multi:"×1.8", done:false, time:"opt.", streak:2 },
    ]},
  ];

  return (
    <div className="scr" style={{ display:"flex" }}>
      <SideNav active="quests"/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
        <TopBar title="Daily Quest Board" crumb="QUESTS · CYCLE 248" clock="07:42:18" energy={78}/>
        <div className="scrollY" style={{ flex:1, padding:"22px 26px", display:"grid", gridTemplateColumns:"1fr 320px", gap:18 }}>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {/* Day summary strip */}
            <section className="panel" style={{ padding:18, display:"grid", gridTemplateColumns:"auto 1fr auto auto auto", gap:18, alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <StatRing value={43} size={84} stroke={7} color="#f5c451" label="3/7" sub="QUESTS"/>
              </div>
              <div>
                <div className="eyebrow">WEDNESDAY · DAY 248</div>
                <div style={{ fontSize:22, fontWeight:600, marginTop:2 }}>Sharpen the keystone — ship before lunch.</div>
                <div style={{ display:"flex", gap:14, marginTop:6, color:"var(--text-md)", fontSize:12 }}>
                  <span>Total possible <b className="mono" style={{ color:"var(--c-blue-2)" }}>+925 XP</b></span>
                  <span>·</span>
                  <span>Earned <b className="mono" style={{ color:"var(--c-emerald)" }}>+385 XP</b></span>
                  <span>·</span>
                  <span>Streak <b className="mono" style={{ color:"var(--c-gold)" }}>41d</b></span>
                </div>
              </div>
              <PillStat label="ENERGY"   value="78%"  color="var(--c-emerald)"/>
              <PillStat label="FOCUS"    value="HIGH" color="var(--c-blue)"/>
              <PillStat label="MOMENTUM" value="×1.6" color="var(--c-gold)"/>
            </section>

            {categories.map(cat => (
              <section key={cat.tag} className="panel" style={{ padding:18 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ width:8, height:8, borderRadius:8, background: cat.color, boxShadow:`0 0 10px ${cat.color}` }}/>
                    <span className="mono" style={{ fontSize:10, letterSpacing:".22em", color:cat.color }}>{cat.tag}</span>
                    <span style={{ fontSize:14, fontWeight:600 }}>{cat.title}</span>
                  </div>
                  <span className="mono" style={{ fontSize:10, color:"var(--text-lo)" }}>
                    {cat.quests.filter(q=>q.done).length} / {cat.quests.length} COMPLETE
                  </span>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {cat.quests.map((q, i) => <QuestCard key={i} {...q} catColor={cat.color}/>)}
                </div>
              </section>
            ))}
          </div>

          {/* Side rail */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <CompletionPreview/>

            <section className="panel glow-emerald" style={{ padding:18 }}>
              <PanelHead eyebrow="◔ RECOVERY · BUFFS" title="Active Modifiers"/>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  ["Cold start", "+20% Focus until noon", "var(--c-blue)"],
                  ["Sleep 7h41m", "+12% Recovery", "var(--c-emerald)"],
                  ["Streak ×1.6", "+60% XP per quest", "var(--c-gold)"],
                ].map(([n,d,c]) => (
                  <div key={n} style={{ display:"grid", gridTemplateColumns:"6px 1fr", gap:10, padding:"8px 10px", background:"rgba(255,255,255,.02)", borderRadius:6, border:"1px solid var(--hl)" }}>
                    <span style={{ background:c, borderRadius:2, boxShadow:`0 0 6px ${c}` }}/>
                    <div>
                      <div style={{ fontSize:12, color:"var(--text-hi)", fontWeight:500 }}>{n}</div>
                      <div className="mono" style={{ fontSize:10, color:"var(--text-lo)" }}>{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel" style={{ padding:18 }}>
              <PanelHead eyebrow="↑ NEXT UNLOCK" title="22 more · LV 25"/>
              <div style={{ padding:"14px 12px", border:"1px dashed var(--hl-strong)", borderRadius:8, textAlign:"center" }}>
                <div className="mono" style={{ fontSize:10, color:"var(--c-gold)", letterSpacing:".18em" }}>LEGENDARY</div>
                <div style={{ fontSize:14, fontWeight:600, marginTop:4 }}>Architect's Vision</div>
                <div style={{ fontSize:11, color:"var(--text-lo)", marginTop:4 }}>+1 weekly One-Thing slot</div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function PillStat({ label, value, color }) {
  return (
    <div style={{ padding:"8px 14px", border:`1px solid ${color}44`, background:`${color}10`, borderRadius:8, minWidth:90 }}>
      <div className="mono" style={{ fontSize:9, color, letterSpacing:".18em" }}>{label}</div>
      <div style={{ fontSize:16, fontWeight:700, color:"var(--text-hi)", marginTop:2 }}>{value}</div>
    </div>
  );
}

function QuestCard({ rarity, title, reward, attrs, multi, done, time, streak, catColor }) {
  const [open, setOpen] = React.useState(done);
  React.useEffect(() => setOpen(done), [done]);
  const rarityColor = {
    common: "var(--text-lo)", rare: "var(--c-blue)",
    epic: "var(--c-violet)", legendary: "var(--c-gold)"
  }[rarity];
  return (
    <div onClick={() => setOpen(o => !o)} style={{
      display:"grid", gridTemplateColumns:"22px 1fr auto auto", gap:14, alignItems:"center",
      padding:"12px 14px",
      background: open ? "rgba(52,214,160,.04)" : "rgba(255,255,255,.015)",
      border:`1px solid ${open ? "rgba(52,214,160,.22)" : "var(--hl)"}`,
      borderRadius:10,
      cursor:"pointer", transition:"all .2s"
    }}>
      <span className={`qbox ${open ? "done" : ""}`}>
        {open && <svg viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </span>
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span className="mono" style={{ fontSize:9, color: rarityColor, letterSpacing:".18em", padding:"2px 6px", border:`1px solid ${rarityColor}66`, borderRadius:3 }}>{rarity.toUpperCase()}</span>
          <span style={{ fontSize:13.5, fontWeight:500, color: open ? "var(--text-lo)" : "var(--text-hi)", textDecoration: open ? "line-through" : "none" }}>{title}</span>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:6, alignItems:"center" }}>
          <span className="mono" style={{ fontSize:10, color:"var(--c-blue-2)" }}>{reward}</span>
          <span style={{ color:"var(--text-dim)" }}>·</span>
          {attrs.map(a => (
            <span key={a} className="mono" style={{ fontSize:9, color:"var(--text-md)", padding:"1px 5px", border:"1px solid var(--hl-strong)", borderRadius:3, letterSpacing:".12em" }}>{a}</span>
          ))}
          <span style={{ color:"var(--text-dim)" }}>·</span>
          <span className="mono" style={{ fontSize:10, color:"var(--text-lo)" }}>{time}</span>
        </div>
      </div>
      <div style={{ textAlign:"right" }}>
        <div className="mono" style={{ fontSize:12, color:"var(--c-gold)", fontWeight:600 }}>{multi}</div>
        <div className="mono" style={{ fontSize:9, color:"var(--text-dim)", letterSpacing:".1em" }}>{streak}d streak</div>
      </div>
      <Spark width={80} height={26} color={catColor} data={Array.from({length:14}, (_,i) => 4+Math.abs(Math.sin(i*.6))*8+i*.3)}/>
    </div>
  );
}

function CompletionPreview() {
  return (
    <section className="panel glow-gold" style={{ padding:0, overflow:"hidden", position:"relative" }}>
      <Brackets color="var(--c-gold-glow)" inset={6}/>
      <div style={{ padding:"20px 18px 16px", background:"radial-gradient(circle at 50% 0%, rgba(245,196,81,.18), transparent 60%)" }}>
        <div className="eyebrow" style={{ color:"var(--c-gold)" }}>◆ ON COMPLETION</div>
        <div style={{ fontSize:18, fontWeight:700, marginTop:8 }}>QUEST CLEARED</div>
        <div className="mono" style={{ fontSize:10, color:"var(--text-lo)", marginTop:2 }}>preview · cinematic overlay</div>

        <div style={{ marginTop:16, padding:14, background:"rgba(0,0,0,.4)", border:"1px solid rgba(245,196,81,.3)", borderRadius:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
            <span className="mono" style={{ fontSize:10, color:"var(--c-gold)", letterSpacing:".22em" }}>+180 XP</span>
            <span className="mono" style={{ fontSize:10, color:"var(--c-emerald)" }}>×1.6 BONUS</span>
          </div>
          <div style={{ fontSize:14, marginTop:8, color:"var(--text-hi)" }}>Deep work block</div>
          <div style={{ display:"flex", gap:8, marginTop:10, alignItems:"center" }}>
            <span style={{ flex:1, height:1, background:"linear-gradient(90deg, transparent, var(--c-gold), transparent)" }}/>
            <span className="mono" style={{ fontSize:9, color:"var(--c-gold)", letterSpacing:".18em" }}>LEVEL UP IMMINENT</span>
            <span style={{ flex:1, height:1, background:"linear-gradient(90deg, transparent, var(--c-gold), transparent)" }}/>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   RECOVERY SCREEN
   ───────────────────────────────────────────────────────────── */

function ScreenRecovery() {
  return (
    <div className="scr" style={{ display:"flex" }}>
      <SideNav active="recovery"/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
        <TopBar title="Recovery · Energy Matrix" crumb="VITALS" clock="07:42:18" energy={78}/>
        <div className="scrollY" style={{ flex:1, padding:"22px 26px", display:"grid", gridTemplateColumns:"1.3fr .9fr", gap:18 }}>

          {/* Energy core */}
          <section className="panel glow-emerald" style={{ padding:24, position:"relative", overflow:"hidden", display:"grid", gridTemplateColumns:"auto 1fr", gap:30, alignItems:"center" }}>
            <Brackets color="var(--c-emerald-glow)" inset={8}/>
            <div className="scan-overlay"/>
            <div style={{ position:"relative" }}>
              <EnergyCore value={78}/>
            </div>
            <div>
              <div className="eyebrow" style={{ color:"var(--c-emerald)" }}>VITAL CORE · NOMINAL</div>
              <div className="h-display" style={{ fontSize:42, marginTop:6 }}>Reserves at 78%</div>
              <div style={{ color:"var(--text-md)", fontSize:13, marginTop:8, maxWidth:420, lineHeight:1.55 }}>
                Above the burnout threshold. Sleep delta is positive (+0:24 vs baseline). One legendary quest available without recovery debt.
              </div>
              <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                <Vital label="SLEEP" value="7h41" delta="+0:24" color="var(--c-blue)"/>
                <Vital label="HRV" value="62ms" delta="+4" color="var(--c-emerald)"/>
                <Vital label="STRESS" value="LOW" delta="−12%" color="var(--c-gold)"/>
                <Vital label="LOAD" value="MOD" delta="3.2" color="var(--c-violet)"/>
              </div>
            </div>
          </section>

          {/* Burnout risk */}
          <section className="panel" style={{ padding:20 }}>
            <PanelHead eyebrow="⚠ BURNOUT RISK" title="14-day trajectory"
              right={<span className="mono" style={{ fontSize:10, color:"var(--c-emerald)" }}>LOW · 14%</span>}/>
            <BurnoutChart/>
            <div style={{ marginTop:14, padding:"10px 12px", background:"rgba(52,214,160,.06)", border:"1px solid rgba(52,214,160,.25)", borderRadius:8 }}>
              <div className="mono" style={{ fontSize:10, color:"var(--c-emerald)", letterSpacing:".18em" }}>ORACLE</div>
              <div style={{ fontSize:12, color:"var(--text-md)", marginTop:4, lineHeight:1.5 }}>
                Risk peaks on day 19 if sleep stays below 7h two nights in a row. Hard-cap deep-work to 90m on those days.
              </div>
            </div>
          </section>

          {/* Modifiers */}
          <section className="panel" style={{ padding:20 }}>
            <PanelHead eyebrow="◐ ACTIVE MODIFIERS" title="Buffs + Debuffs"/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[
                { type:"BUFF", color:"var(--c-emerald)", title:"Cold Start", sub:"+20% Focus · until 12:00", icon:"❅" },
                { type:"BUFF", color:"var(--c-blue)",    title:"Hydration Lock", sub:"+8% Recovery · all-day", icon:"◊" },
                { type:"BUFF", color:"var(--c-gold)",    title:"Streak Aura", sub:"×1.6 XP · 41d", icon:"✦" },
                { type:"DEBUFF", color:"var(--c-crimson)", title:"Caffeine Spike", sub:"−8% Sleep · tonight", icon:"⚠" },
                { type:"DEBUFF", color:"var(--c-violet)",  title:"Screen Saturation", sub:"−5% Focus · accumulating", icon:"▢" },
                { type:"DEBUFF", color:"var(--text-lo)",   title:"Social Atrophy", sub:"Social -1 · 12d inactive", icon:"○" },
              ].map(m => (
                <div key={m.title} style={{ padding:"10px 12px", background:`${m.color}0d`, border:`1px solid ${m.color}33`, borderRadius:8, display:"grid", gridTemplateColumns:"24px 1fr auto", gap:8, alignItems:"center" }}>
                  <span style={{ width:24, height:24, display:"grid", placeItems:"center", color:m.color, fontSize:13, border:`1px solid ${m.color}55`, borderRadius:6 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:"var(--text-hi)" }}>{m.title}</div>
                    <div className="mono" style={{ fontSize:10, color:"var(--text-lo)" }}>{m.sub}</div>
                  </div>
                  <span className="mono" style={{ fontSize:9, color:m.color, letterSpacing:".16em" }}>{m.type}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Recovery rituals */}
          <section className="panel" style={{ padding:20 }}>
            <PanelHead eyebrow="↻ REGEN RITUALS" title="Recovery actions"/>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                ["Sleep window 22:30 → 06:15", "+8% Recovery", "var(--c-blue)"],
                ["Sauna 20m", "+4% Recovery · −10% Stress", "var(--c-crimson)"],
                ["Walk no-audio 25m", "+3% Focus next session", "var(--c-emerald)"],
                ["Breath box 4×4", "+5% Focus · −Stress", "var(--c-violet)"],
              ].map(([n,r,c]) => (
                <div key={n} style={{ display:"grid", gridTemplateColumns:"1fr auto auto", gap:12, alignItems:"center", padding:"10px 12px", border:"1px solid var(--hl)", borderRadius:8, background:"rgba(255,255,255,.015)" }}>
                  <div>
                    <div style={{ fontSize:12.5, color:"var(--text-hi)" }}>{n}</div>
                    <div className="mono" style={{ fontSize:10, color:c, marginTop:2 }}>{r}</div>
                  </div>
                  <button style={{ all:"unset", cursor:"pointer", padding:"5px 10px", border:`1px solid ${c}66`, color:c, borderRadius:5, fontSize:10, letterSpacing:".05em" }}>QUEUE</button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Vital({ label, value, delta, color }) {
  return (
    <div style={{ padding:"10px 12px", border:"1px solid var(--hl)", borderRadius:8, background:"rgba(255,255,255,.02)" }}>
      <div className="mono" style={{ fontSize:9, color:"var(--text-lo)", letterSpacing:".18em" }}>{label}</div>
      <div style={{ fontSize:18, fontWeight:700, color:"var(--text-hi)", marginTop:4 }}>{value}</div>
      <div className="mono" style={{ fontSize:10, color, marginTop:2 }}>{delta}</div>
    </div>
  );
}

function EnergyCore({ value=78 }) {
  return (
    <div style={{ width:220, height:220, position:"relative" }}>
      <svg viewBox="0 0 200 200" width="220" height="220">
        <defs>
          <radialGradient id="core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34d6a0" stopOpacity=".7"/>
            <stop offset="60%" stopColor="#34d6a0" stopOpacity=".15"/>
            <stop offset="100%" stopColor="#34d6a0" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="78" fill="url(#core)"/>
        <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(52,214,160,.18)" strokeWidth="1" strokeDasharray="2 4"/>
        <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="6"/>
        <circle cx="100" cy="100" r="70" fill="none" stroke="#34d6a0" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${(value/100)*440} 440`} transform="rotate(-90 100 100)"
          style={{ filter:"drop-shadow(0 0 8px #34d6a0)" }}/>
        <circle cx="100" cy="100" r="48" fill="none" stroke="rgba(52,214,160,.3)" strokeWidth="1"/>
        <polygon points="100,60 132,82 132,118 100,140 68,118 68,82" fill="none" stroke="rgba(52,214,160,.5)" strokeWidth="1"/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <div className="mono" style={{ fontSize:10, color:"var(--c-emerald)", letterSpacing:".24em" }}>VITAL</div>
        <div style={{ fontSize:48, fontWeight:800, color:"var(--text-hi)", lineHeight:1, marginTop:4 }}>{value}<span style={{ fontSize:20, color:"var(--text-lo)" }}>%</span></div>
        <div className="mono" style={{ fontSize:10, color:"var(--text-lo)", marginTop:4 }}>OPTIMAL · 70-90</div>
      </div>
    </div>
  );
}

function BurnoutChart() {
  const W = 360, H = 100;
  const data = [12, 14, 13, 18, 22, 19, 16, 13, 14, 18, 24, 28, 26, 21];
  const max = 50;
  const pts = data.map((v,i) => [10 + i*(W-20)/(data.length-1), H - 14 - (v/max)*(H-30)]);
  const path = pts.map((p,i) => (i?"L":"M")+p.join(" ")).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
      {/* threshold bands */}
      <rect x="10" y={H-14-(50/max)*(H-30)} width={W-20} height={(20/max)*(H-30)} fill="rgba(255,90,110,.06)"/>
      <rect x="10" y={H-14-(30/max)*(H-30)} width={W-20} height={(10/max)*(H-30)} fill="rgba(245,196,81,.06)"/>
      <line x1="10" x2={W-10} y1={H-14-(30/max)*(H-30)} y2={H-14-(30/max)*(H-30)} stroke="rgba(245,196,81,.3)" strokeDasharray="2 4"/>
      <line x1="10" x2={W-10} y1={H-14-(40/max)*(H-30)} y2={H-14-(40/max)*(H-30)} stroke="rgba(255,90,110,.3)" strokeDasharray="2 4"/>
      <path d={`${path} L ${W-10} ${H-14} L 10 ${H-14} Z`} fill="rgba(52,214,160,.12)"/>
      <path d={path} fill="none" stroke="var(--c-emerald)" strokeWidth="1.8" style={{ filter:"drop-shadow(0 0 4px var(--c-emerald))" }}/>
      <text x={W-12} y={H-14-(40/max)*(H-30)-3} textAnchor="end" fontSize="9" fill="rgba(255,90,110,.7)" fontFamily="JetBrains Mono">RED ZONE</text>
      <text x={W-12} y={H-14-(30/max)*(H-30)-3} textAnchor="end" fontSize="9" fill="rgba(245,196,81,.7)" fontFamily="JetBrains Mono">CAUTION</text>
    </svg>
  );
}

Object.assign(window, { ScreenQuests, ScreenRecovery });
