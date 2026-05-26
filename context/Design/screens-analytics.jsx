/* screens-analytics.jsx — Analytics dashboard + Oracle AI coach */

function ScreenAnalytics() {
  return (
    <div className="scr" style={{ display:"flex" }}>
      <SideNav active="analytics"/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
        <TopBar title="Life Intelligence Engine" crumb="ANALYTICS · 90D"/>
        <div className="scrollY" style={{ flex:1, padding:"22px 26px", display:"grid", gridTemplateColumns:"repeat(12, 1fr)", gap:14, gridAutoRows:"min-content" }}>

          {/* KPIs */}
          {[
            { label:"TOTAL XP · 90D", value:"187,420", delta:"+24%", color:"var(--c-blue)",   spark:[10,12,11,14,16,18,17,20,24,28,30,34,38,42] },
            { label:"CONSISTENCY",    value:"86%",     delta:"+6pt",  color:"var(--c-emerald)", spark:[70,72,68,75,78,80,82,79,83,85,84,86,86,86] },
            { label:"AVG MOMENTUM",   value:"×1.42",   delta:"+0.18", color:"var(--c-gold)",    spark:[1.1,1.15,1.2,1.18,1.22,1.28,1.3,1.32,1.36,1.38,1.4,1.42,1.42,1.42] },
            { label:"DECAY EVENTS",   value:"12",      delta:"−9",    color:"var(--c-crimson)", spark:[5,6,4,3,2,3,2,1,2,1,1,0,1,0], invert:true },
          ].map(k => (
            <div key={k.label} className="panel" style={{ padding:16, gridColumn:"span 3", position:"relative" }}>
              <div className="mono" style={{ fontSize:9, color:"var(--text-lo)", letterSpacing:".18em" }}>{k.label}</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:8, marginTop:8 }}>
                <div style={{ fontSize:26, fontWeight:700, color:"var(--text-hi)" }}>{k.value}</div>
                <div className="mono" style={{ fontSize:11, color:k.color }}>{k.delta}</div>
              </div>
              <div style={{ marginTop:8 }}><Spark width={250} height={36} color={k.color} data={k.spark}/></div>
            </div>
          ))}

          {/* Consistency heatmap */}
          <section className="panel" style={{ padding:20, gridColumn:"span 8" }}>
            <PanelHead eyebrow="▦ CONSISTENCY MATRIX" title="Habit completion · last 24 weeks"
              right={<span className="mono" style={{ fontSize:10, color:"var(--text-lo)" }}>365 cells · 86% completion</span>}/>
            <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
              <div style={{ display:"grid", gridTemplateRows:"repeat(7, 9px)", gap:2, fontSize:9, color:"var(--text-dim)", paddingTop:2 }} className="mono">
                {["S","M","T","W","T","F","S"].map((d,i) => <div key={i}>{i%2?d:""}</div>)}
              </div>
              <Heatmap weeks={26} color="var(--c-emerald)"/>
              <div style={{ marginLeft:"auto", display:"flex", flexDirection:"column", gap:6, fontSize:10 }} className="mono">
                <div style={{ color:"var(--text-lo)" }}>LEGEND</div>
                {[[".25", "var(--c-emerald)", "rare"], [".5","var(--c-emerald)","light"],[".75","var(--c-emerald)","steady"],["1","var(--c-emerald)","streak"]].map(([o,c,l]) => (
                  <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ width:9, height:9, background:c, opacity: parseFloat(o), borderRadius:2 }}/>{l}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Burnout risk */}
          <section className="panel" style={{ padding:20, gridColumn:"span 4" }}>
            <PanelHead eyebrow="⚠ BURNOUT RISK" title="14% · low"/>
            <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:14, alignItems:"center" }}>
              <StatRing value={14} size={94} stroke={7} color="#34d6a0" label="14%" sub="RISK"/>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {[
                  ["Sleep delta",      "+0:24 baseline", "var(--c-emerald)"],
                  ["Training load",    "moderate · 3.2", "var(--c-gold)"],
                  ["Deep work hours",  "11.5 / 14 cap",  "var(--c-blue)"],
                  ["Stress markers",   "low (HRV 62ms)", "var(--c-emerald)"],
                ].map(([n,v,c]) => (
                  <div key={n} style={{ display:"grid", gridTemplateColumns:"3px 1fr auto", gap:8, fontSize:11, color:"var(--text-md)", alignItems:"center" }}>
                    <span style={{ background:c, height:14, borderRadius:2 }}/>
                    <span>{n}</span>
                    <span className="mono" style={{ color:c, fontSize:10 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stat decay vis */}
          <section className="panel" style={{ padding:20, gridColumn:"span 7" }}>
            <PanelHead eyebrow="↓ STAT DECAY MAP" title="Attributes drifting in last 14d"/>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:10 }}>
              {[
                { name:"SOCIAL",     v:-12, reason:"12d since deep call", c:"var(--c-crimson)" },
                { name:"SPIRITUAL",  v:-4,  reason:"2 sessions missed",   c:"var(--c-crimson)" },
                { name:"WEALTH",     v:-2,  reason:"Discretionary +23%",  c:"var(--c-gold)" },
                { name:"RECOVERY",   v:+6,  reason:"Sleep stabilized",    c:"var(--c-emerald)" },
                { name:"STRENGTH",   v:+18, reason:"5-week training",     c:"var(--c-emerald)" },
                { name:"INTELLIGENCE", v:+24, reason:"Reading streak 31d",c:"var(--c-emerald)" },
              ].map(s => (
                <div key={s.name} style={{ padding:"10px 12px", border:"1px solid var(--hl)", borderRadius:8, background:"rgba(255,255,255,.015)", display:"grid", gridTemplateColumns:"1fr auto", gap:6 }}>
                  <div>
                    <div style={{ fontSize:11, color:"var(--text-md)" }}>{s.name}</div>
                    <div className="mono" style={{ fontSize:10, color:"var(--text-dim)", marginTop:2 }}>{s.reason}</div>
                  </div>
                  <div className="mono" style={{ fontSize:14, fontWeight:700, color:s.c, alignSelf:"center" }}>{s.v > 0 ? "+" : ""}{s.v}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Productivity heatmap by hour */}
          <section className="panel" style={{ padding:20, gridColumn:"span 5" }}>
            <PanelHead eyebrow="◷ PEAK HOUR MAP" title="When you do your best work"/>
            <HourHeatmap/>
          </section>

          {/* Insights stream */}
          <section className="panel glow-violet" style={{ padding:20, gridColumn:"span 12" }}>
            <Brackets color="var(--c-violet-glow)" inset={8}/>
            <PanelHead eyebrow="◉ ORACLE · CORRELATIONS" title="AI-generated insights · last 90 days"
              right={<span className="mono" style={{ fontSize:10, color:"var(--c-violet-2)" }}>9 ACTIVE THREADS</span>}/>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
              {[
                { tag:"PATTERN", w:"94%", title:"Focus drops 24% after <7h sleep", body:"Last 14 missed quests: 11 followed a short-sleep night.", c:"var(--c-blue)" },
                { tag:"LOOP",    w:"88%", title:"Music sessions raise Discipline", body:"Days with music production show +18% same-day quest completion.", c:"var(--c-violet)" },
                { tag:"RISK",    w:"71%", title:"Social atrophy compounding", body:"12 days no deep call → predicted Career stall in 21d.", c:"var(--c-crimson)" },
                { tag:"BOOST",   w:"82%", title:"Cold-start protocol holds", body:"+20% morning Focus on 9 of last 11 cold starts.", c:"var(--c-emerald)" },
                { tag:"DECAY",   w:"66%", title:"Math drills cooling", body:"6d no review · projected -1 INT tier in 11d.", c:"var(--c-gold)" },
                { tag:"FORECAST",w:"79%", title:"Level 25 expected in 6 days", body:"At current pace · ~3,180 XP/day required.", c:"var(--c-cyan)" },
              ].map(ins => (
                <div key={ins.title} style={{ padding:14, border:`1px solid ${ins.c}33`, background:`${ins.c}08`, borderRadius:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span className="mono" style={{ fontSize:9, color:ins.c, letterSpacing:".22em" }}>◆ {ins.tag}</span>
                    <span className="mono" style={{ fontSize:9, color:"var(--text-lo)" }}>conf {ins.w}</span>
                  </div>
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--text-hi)", marginTop:8, lineHeight:1.35 }}>{ins.title}</div>
                  <div style={{ fontSize:11.5, color:"var(--text-md)", marginTop:6, lineHeight:1.5 }}>{ins.body}</div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function HourHeatmap() {
  // 7 days × 12 2hr windows
  const data = [];
  for (let d=0; d<7; d++) for (let h=0; h<12; h++) {
    const morningBias = h >= 3 && h <= 5 ? .9 : h >= 9 && h <= 11 ? .55 : .25;
    const noise = Math.random() * .4;
    data.push(Math.min(1, morningBias + noise));
  }
  const days = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"30px repeat(12, 1fr)", gap:3, alignItems:"center" }}>
        <div/>
        {Array.from({length:12}).map((_,h) => (
          <div key={h} className="mono" style={{ fontSize:8, color:"var(--text-dim)", textAlign:"center" }}>{(h*2).toString().padStart(2,"0")}</div>
        ))}
        {days.map((d,row) => (
          <React.Fragment key={d}>
            <div className="mono" style={{ fontSize:9, color:"var(--text-lo)", letterSpacing:".1em" }}>{d}</div>
            {Array.from({length:12}).map((_,h) => {
              const v = data[row*12 + h];
              return <div key={h} style={{ aspectRatio:"1", background:`rgba(78,161,255,${.08 + v*.7})`, borderRadius:3, boxShadow: v > .8 ? "0 0 6px rgba(78,161,255,.6)" : "none" }}/>;
            })}
          </React.Fragment>
        ))}
      </div>
      <div style={{ marginTop:12, display:"flex", justifyContent:"space-between", fontSize:10, color:"var(--text-lo)" }} className="mono">
        <span>PEAK · 06:00–09:00 (Tue/Wed/Thu)</span>
        <span style={{ color:"var(--c-blue)" }}>↑ shift focus blocks → AM</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ORACLE · AI COACH
   ───────────────────────────────────────────────────────────── */

function ScreenOracle() {
  const messages = [
    { who:"oracle", time:"07:38", body:"Cycle 248 initialized. Sleep delta +0:24. Focus window opens in 22 minutes — recommend deep-work as first quest.", chips:["Apply", "Snooze"] },
    { who:"user",   time:"07:39", body:"What's blocking my Career S → SS rank?" },
    { who:"oracle", time:"07:39", body:"Three threads detected:", list:[
      "Shipping cadence inconsistent on Tue/Thu (52% completion)",
      "Email backlog reaching 142 unread — accumulating debt",
      "No teaching/writing output in 18d — feedback loop missing"
    ], chips:["Build plan", "Show data", "Dismiss"] },
    { who:"user",   time:"07:41", body:"Build a 14-day plan." },
    { who:"oracle", time:"07:41", typing:true, body:"Generating progression model · simulating decay curves · 78%…" },
  ];

  return (
    <div className="scr" style={{ display:"flex" }}>
      <SideNav active="coach"/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
        <TopBar title="Oracle · Operator AI" crumb="COACH · CHANNEL OPEN"/>
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"260px 1fr 320px", gap:0, overflow:"hidden" }}>

          {/* threads */}
          <aside style={{ borderRight:"1px solid var(--hl)", background:"rgba(10,14,24,.5)", padding:"16px 14px", overflow:"auto" }}>
            <div className="eyebrow" style={{ marginBottom:10 }}>◉ ACTIVE THREADS</div>
            {[
              ["Today's plan",          "12m", true,  "var(--c-blue)"],
              ["Career S → SS strategy","1h",  true,  "var(--c-gold)"],
              ["Burnout watch · day 19","3h",  false, "var(--c-crimson)"],
              ["Music release roadmap", "1d",  false, "var(--c-violet)"],
              ["Sleep protocol tuning", "2d",  false, "var(--c-emerald)"],
              ["Reading queue prune",   "5d",  false, "var(--c-cyan)"],
            ].map(([n,t,active,c]) => (
              <div key={n} style={{ display:"grid", gridTemplateColumns:"6px 1fr auto", gap:8, padding:"10px 10px", borderRadius:6, marginBottom:4, background: active ? "rgba(78,161,255,.08)" : "transparent", border: active ? "1px solid var(--hl-blue)" : "1px solid transparent", cursor:"pointer" }}>
                <span style={{ background:c, borderRadius:2, animation: active ? "glow-pulse 2.4s infinite" : "none" }}/>
                <div>
                  <div style={{ fontSize:12, color:active?"var(--text-hi)":"var(--text-md)", fontWeight: active ? 600:400 }}>{n}</div>
                  <div className="mono" style={{ fontSize:9, color:"var(--text-dim)", marginTop:2 }}>{t} ago</div>
                </div>
                {active && <span style={{ width:5, height:5, borderRadius:5, background:c, alignSelf:"center", boxShadow:`0 0 6px ${c}` }}/>}
              </div>
            ))}

            <div className="eyebrow" style={{ marginTop:22, marginBottom:10 }}>⚠ SYSTEM ALERTS</div>
            {[
              ["Caffeine post-15:00 risk", "var(--c-crimson)"],
              ["Social atrophy debuff",    "var(--c-crimson)"],
              ["Math drills cold 6d",      "var(--c-gold)"],
            ].map(([n,c]) => (
              <div key={n} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px", fontSize:11, color:"var(--text-md)" }}>
                <span style={{ width:6, height:6, borderRadius:6, background:c, boxShadow:`0 0 6px ${c}` }}/>{n}
              </div>
            ))}
          </aside>

          {/* conversation */}
          <main style={{ display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>
            <div style={{ flex:1, overflow:"auto", padding:"22px 28px", display:"flex", flexDirection:"column", gap:14 }}>
              {messages.map((m,i) => <OracleMessage key={i} m={m}/>)}
            </div>
            <div style={{ padding:"14px 22px 22px", borderTop:"1px solid var(--hl)", background:"linear-gradient(180deg, rgba(10,14,24,.6), rgba(6,8,15,.9))" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:10, alignItems:"center", padding:"10px 14px", border:"1px solid var(--hl-strong)", borderRadius:10, background:"rgba(0,0,0,.4)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span className="mono" style={{ fontSize:10, color:"var(--c-violet-2)", letterSpacing:".18em" }}>›</span>
                  <span style={{ fontSize:13, color:"var(--text-md)" }}>Ask Oracle anything about your progression…</span>
                </div>
                <button style={{ all:"unset", cursor:"pointer", padding:"6px 12px", background:"linear-gradient(135deg, var(--c-violet), var(--c-blue))", color:"#06080f", fontWeight:700, fontSize:11, letterSpacing:".05em", borderRadius:6 }}>TRANSMIT</button>
              </div>
              <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
                {["What's my weakest link?","Plan next 14 days","Why am I losing momentum?","Show decay forecast","Tune sleep protocol"].map(s => (
                  <button key={s} style={{ all:"unset", cursor:"pointer", padding:"5px 10px", fontSize:11, color:"var(--text-md)", border:"1px solid var(--hl-strong)", borderRadius:99 }}>{s}</button>
                ))}
              </div>
            </div>
          </main>

          {/* context rail */}
          <aside style={{ borderLeft:"1px solid var(--hl)", background:"rgba(6,8,15,.5)", padding:18, overflow:"auto" }}>
            <div className="eyebrow" style={{ color:"var(--c-violet-2)" }}>◆ CONTEXT SCAN</div>
            <div style={{ marginTop:12, padding:14, border:"1px solid var(--hl-blue)", borderRadius:10, background:"rgba(78,161,255,.06)" }}>
              <Sigil size={48} hue="violet" glyph="◉"/>
              <div style={{ marginTop:10, fontSize:13, fontWeight:600 }}>Oracle · v3.2</div>
              <div className="mono" style={{ fontSize:10, color:"var(--text-lo)" }}>connection: stable · 14ms</div>
            </div>

            <div style={{ marginTop:18 }}>
              <div className="eyebrow">PATTERNS DETECTED · 7D</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:10 }}>
                {["Morning focus +24% vs PM","Music → next-day Discipline","Walks lower stress next 6h","Cold start raises FOC peak"].map(p => (
                  <div key={p} style={{ display:"grid", gridTemplateColumns:"3px 1fr", gap:8, padding:"7px 10px", border:"1px solid var(--hl)", borderRadius:6, background:"rgba(255,255,255,.015)" }}>
                    <span style={{ background:"var(--c-violet)", borderRadius:2 }}/>
                    <span style={{ fontSize:11, color:"var(--text-md)" }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop:18 }}>
              <div className="eyebrow">ORACLE ACCURACY</div>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:10 }}>
                <StatRing value={84} size={80} stroke={6} color="#b07cff" label="84%" sub="HITS"/>
                <div style={{ fontSize:11, color:"var(--text-md)", lineHeight:1.5 }}>
                  Last 30 predictions · 25 hits, 4 partial, 1 miss. Confidence model: v3.2-tuned.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function OracleMessage({ m }) {
  const isOracle = m.who === "oracle";
  return (
    <div style={{ display:"flex", flexDirection: isOracle ? "row" : "row-reverse", gap:12, alignItems:"flex-start" }}>
      {isOracle && (
        <div style={{ flexShrink:0, width:34, height:34, borderRadius:10, background:"linear-gradient(135deg, var(--c-violet), var(--c-blue))", display:"grid", placeItems:"center", color:"#06080f", fontWeight:700, boxShadow:"0 0 18px -4px var(--c-violet-glow)" }}>◉</div>
      )}
      <div style={{ maxWidth:560, position:"relative" }}>
        <div className="mono" style={{ fontSize:9, color:"var(--text-dim)", letterSpacing:".18em", marginBottom:4, textAlign: isOracle ? "left" : "right" }}>
          {isOracle ? "ORACLE" : "OPERATOR"} · {m.time}
        </div>
        <div style={{
          padding:"12px 14px",
          background: isOracle ? "rgba(176,124,255,.06)" : "rgba(78,161,255,.06)",
          border:`1px solid ${isOracle ? "rgba(176,124,255,.22)" : "rgba(78,161,255,.22)"}`,
          borderRadius:10,
          fontSize:13, lineHeight:1.55, color:"var(--text-hi)"
        }}>
          {m.body}
          {m.list && (
            <ul style={{ margin:"10px 0 0 0", padding:"0 0 0 16px", color:"var(--text-md)", fontSize:12.5 }}>
              {m.list.map((l,i) => <li key={i} style={{ marginBottom:4 }}>{l}</li>)}
            </ul>
          )}
          {m.typing && (
            <div style={{ marginTop:6, display:"flex", gap:4 }}>
              {[0,1,2].map(i => <span key={i} style={{ width:5, height:5, borderRadius:5, background:"var(--c-violet)", animation:`glow-pulse 1.2s infinite ${i*.15}s` }}/>)}
            </div>
          )}
        </div>
        {m.chips && (
          <div style={{ display:"flex", gap:6, marginTop:8 }}>
            {m.chips.map(c => (
              <button key={c} style={{ all:"unset", cursor:"pointer", padding:"4px 10px", fontSize:10.5, color:"var(--c-violet-2)", border:"1px solid rgba(176,124,255,.4)", borderRadius:99, letterSpacing:".03em" }}>{c}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ScreenAnalytics, ScreenOracle });
