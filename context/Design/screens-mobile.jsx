/* screens-mobile.jsx — phone-frame views + cinematic level-up moment */

function PhoneFrame({ children, glow="var(--c-blue-glow)" }) {
  return (
    <div style={{
      width:380, height:780, position:"relative",
      borderRadius:48, padding:10,
      background:"linear-gradient(180deg, #1a2030, #0a0e18)",
      border:"1px solid rgba(255,255,255,.08)",
      boxShadow:`0 30px 60px -20px rgba(0,0,0,.7), 0 0 60px -10px ${glow}`
    }}>
      <div style={{ width:"100%", height:"100%", borderRadius:40, overflow:"hidden", position:"relative", background:"#05070d" }}>
        {/* notch */}
        <div style={{ position:"absolute", top:10, left:"50%", transform:"translateX(-50%)", width:110, height:28, background:"#000", borderRadius:18, zIndex:20 }}/>
        {/* status bar */}
        <div style={{ position:"absolute", top:14, left:24, right:24, display:"flex", justifyContent:"space-between", fontFamily:"var(--ff-mono)", fontSize:11, color:"var(--text-hi)", zIndex:19 }}>
          <span>07:42</span>
          <span style={{ display:"flex", gap:5 }}>
            <span>◔</span><span>⌅</span><span>▮▮▮</span>
          </span>
        </div>
        <div style={{ width:"100%", height:"100%" }}>{children}</div>
      </div>
    </div>
  );
}

function MobileHome() {
  return (
    <PhoneFrame>
      <div className="scr" style={{ paddingTop:50, padding:"50px 18px 18px", display:"flex", flexDirection:"column", gap:14, overflow:"auto" }}>
        {/* hero */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:8 }}>
          <Sigil size={54} hue="blue" glyph="K"/>
          <div style={{ flex:1 }}>
            <div className="eyebrow" style={{ color:"var(--c-blue-2)" }}>ARCHITECT · A-RANK</div>
            <div style={{ fontSize:18, fontWeight:700 }}>Kai Aldrich</div>
            <div className="mono" style={{ fontSize:10, color:"var(--text-lo)" }}>LV 24 · CYCLE 248 · STREAK 41</div>
          </div>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", top:-2, right:-2, width:8, height:8, borderRadius:8, background:"var(--c-crimson)", boxShadow:"0 0 6px var(--c-crimson)" }}/>
            <div style={{ width:34, height:34, borderRadius:10, background:"rgba(255,255,255,.05)", border:"1px solid var(--hl)", display:"grid", placeItems:"center", color:"var(--text-md)" }}>◉</div>
          </div>
        </div>

        {/* XP bar */}
        <div style={{ padding:"14px 16px", background:"linear-gradient(135deg, rgba(78,161,255,.1), rgba(176,124,255,.1))", border:"1px solid var(--hl-blue)", borderRadius:12, position:"relative", overflow:"hidden" }}>
          <Brackets color="var(--c-blue-glow)" inset={5} size={8}/>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--text-md)" }}>
            <span className="mono" style={{ letterSpacing:".15em", color:"var(--c-blue-2)" }}>XP TO LV 25</span>
            <span className="mono">14,820 / 18,000</span>
          </div>
          <div className="xpbar" style={{ height:10, marginTop:8 }}><i style={{ width:"82%" }}/></div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
            <Mini label="MOM" value="×1.6" color="var(--c-gold)"/>
            <Mini label="ENERGY" value="78%" color="var(--c-emerald)"/>
            <Mini label="FOCUS" value="HIGH" color="var(--c-violet)"/>
          </div>
        </div>

        {/* One Thing */}
        <div style={{ padding:"14px 16px", border:"1px solid rgba(245,196,81,.3)", background:"linear-gradient(135deg, rgba(245,196,81,.08), transparent)", borderRadius:12 }}>
          <div className="mono" style={{ fontSize:9, color:"var(--c-gold)", letterSpacing:".22em" }}>◆ THE ONE THING · TODAY</div>
          <div style={{ fontSize:15, fontWeight:600, marginTop:6, lineHeight:1.3 }}>Ship one production-grade feature</div>
          <div className="xpbar gd" style={{ height:4, marginTop:10 }}><i style={{ width:"68%" }}/></div>
        </div>

        {/* Quests */}
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8 }}>
            <span className="eyebrow">◇ TODAY · 3 / 6</span>
            <span className="mono" style={{ fontSize:10, color:"var(--c-emerald)" }}>+385 XP</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <MobileQuest done title="Deep work — 90m" reward="+180 · INT/DSC" rarity="epic"/>
            <MobileQuest done title="Train — strength" reward="+160 · STR" rarity="rare"/>
            <MobileQuest title="Produce music — 45m" reward="+170 · CRE" rarity="epic"/>
            <MobileQuest title="Meditation — 12m" reward="+60 · FOC" rarity="common"/>
            <MobileQuest title="Cold exposure" reward="+120 · DSC/REC" rarity="legendary"/>
          </div>
        </div>

        {/* Bottom nav */}
        <div style={{ marginTop:"auto" }}/>
        <div style={{ position:"sticky", bottom:8, padding:"10px 8px", background:"rgba(10,14,24,.92)", border:"1px solid var(--hl)", borderRadius:18, backdropFilter:"blur(12px)", display:"flex", justifyContent:"space-around" }}>
          {[["◈","System",true],["◇","Quests"],["✦","Skills"],["▦","Stats"],["◉","Oracle"]].map(([g,l,on]) => (
            <div key={l} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, color: on ? "var(--c-blue)" : "var(--text-lo)" }}>
              <span style={{ fontSize:17 }}>{g}</span>
              <span className="mono" style={{ fontSize:8.5, letterSpacing:".15em" }}>{l.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

function Mini({ label, value, color }) {
  return (
    <div style={{ display:"flex", flexDirection:"column" }}>
      <div className="mono" style={{ fontSize:8.5, color:"var(--text-lo)", letterSpacing:".18em" }}>{label}</div>
      <div className="mono" style={{ fontSize:13, color, fontWeight:700, marginTop:2 }}>{value}</div>
    </div>
  );
}

function MobileQuest({ done, title, reward, rarity }) {
  const rarityColor = { common:"var(--text-lo)", rare:"var(--c-blue)", epic:"var(--c-violet)", legendary:"var(--c-gold)" }[rarity];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"20px 1fr auto", gap:10, alignItems:"center", padding:"10px 12px", borderRadius:10, background: done ? "rgba(52,214,160,.05)" : "rgba(255,255,255,.015)", border:`1px solid ${done ? "rgba(52,214,160,.25)" : "var(--hl)"}` }}>
      <span className={`qbox ${done?"done":""}`}>
        {done && <svg viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>}
      </span>
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span className="mono" style={{ fontSize:8, color:rarityColor, padding:"1px 5px", border:`1px solid ${rarityColor}66`, borderRadius:3, letterSpacing:".15em" }}>{rarity.toUpperCase()}</span>
          <span style={{ fontSize:12.5, fontWeight:500, color: done ? "var(--text-lo)" : "var(--text-hi)", textDecoration: done ? "line-through" : "none" }}>{title}</span>
        </div>
        <div className="mono" style={{ fontSize:9.5, color:"var(--text-lo)", marginTop:3 }}>{reward}</div>
      </div>
      <span className="mono" style={{ fontSize:9, color:"var(--c-gold)" }}>×1.6</span>
    </div>
  );
}

function MobileStats() {
  return (
    <PhoneFrame glow="var(--c-violet-glow)">
      <div className="scr" style={{ padding:"50px 18px 18px", overflow:"auto" }}>
        <div className="eyebrow" style={{ color:"var(--c-violet-2)" }}>◈ STAT MATRIX</div>
        <h2 className="h-display" style={{ fontSize:24, margin:"6px 0 14px" }}>Core Attributes</h2>

        {/* radar */}
        <div style={{ display:"grid", placeItems:"center", padding:"4px 0 14px" }}>
          <svg viewBox="0 0 240 240" width="240" height="240">
            {[.25,.5,.75,1].map(r => (
              <polygon key={r} points={Array.from({length:9}).map((_,i) => {
                const a = -Math.PI/2 + i * 2*Math.PI/9;
                return `${120 + Math.cos(a)*100*r},${120 + Math.sin(a)*100*r}`;
              }).join(" ")} fill="none" stroke="rgba(255,255,255,.06)"/>
            ))}
            {[0.7, 0.85, 0.95, 0.78, 0.55, 0.4, 0.6, 0.5, 0.35].map((_,i,arr) => {
              const a = -Math.PI/2 + i * 2*Math.PI/9;
              return <line key={i} x1="120" y1="120" x2={120 + Math.cos(a)*100} y2={120 + Math.sin(a)*100} stroke="rgba(255,255,255,.04)"/>
            })}
            <polygon points={[0.65, 0.82, 0.94, 0.74, 0.48, 0.32, 0.58, 0.42, 0.28].map((v,i) => {
              const a = -Math.PI/2 + i * 2*Math.PI/9;
              return `${120 + Math.cos(a)*100*v},${120 + Math.sin(a)*100*v}`;
            }).join(" ")} fill="rgba(176,124,255,.2)" stroke="var(--c-violet)" strokeWidth="1.5" style={{ filter:"drop-shadow(0 0 6px var(--c-violet))" }}/>
            {["STR","INT","DSC","FOC","CRE","SO","REC","WL","SPI"].map((l,i) => {
              const a = -Math.PI/2 + i * 2*Math.PI/9;
              const x = 120 + Math.cos(a)*118, y = 120 + Math.sin(a)*118;
              return <text key={l} x={x} y={y} textAnchor="middle" alignmentBaseline="middle" fontSize="9" fill="rgba(255,255,255,.7)" fontFamily="JetBrains Mono" letterSpacing=".1em">{l}</text>;
            })}
          </svg>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <AttrBar icon="ST" name="STRENGTH" level={22} xp={64} delta="+18" color="var(--c-crimson)"/>
          <AttrBar icon="IN" name="INTELLIGENCE" level={28} xp={82} delta="+24" color="var(--c-blue)"/>
          <AttrBar icon="DS" name="DISCIPLINE" level={31} xp={91} delta="+12" color="var(--c-gold)"/>
          <AttrBar icon="FO" name="FOCUS" level={26} xp={71} delta="+9" color="var(--c-violet)"/>
          <AttrBar icon="CR" name="CREATIVITY" level={19} xp={43} delta="+22" color="var(--c-violet-2)"/>
          <AttrBar icon="SO" name="SOCIAL" level={14} xp={28} delta="-3" trend="down" color="var(--c-cyan)"/>
        </div>
      </div>
    </PhoneFrame>
  );
}

function MobileOracle() {
  return (
    <PhoneFrame glow="var(--c-violet-glow)">
      <div className="scr" style={{ padding:"50px 18px 18px", display:"flex", flexDirection:"column", overflow:"hidden", height:"100%" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg, var(--c-violet), var(--c-blue))", display:"grid", placeItems:"center", color:"#06080f", fontWeight:700, boxShadow:"0 0 16px -4px var(--c-violet-glow)" }}>◉</div>
          <div>
            <div style={{ fontSize:14, fontWeight:600 }}>Oracle</div>
            <div className="mono" style={{ fontSize:9, color:"var(--c-emerald)", letterSpacing:".18em" }}>● ONLINE · 14MS</div>
          </div>
        </div>

        <div style={{ flex:1, marginTop:14, display:"flex", flexDirection:"column", gap:10, overflow:"auto" }}>
          <OracleMessage m={{ who:"oracle", time:"07:38", body:"Sleep delta +0:24. Focus window opens in 22 minutes — recommend deep-work as first quest.", chips:["Apply", "Snooze"] }}/>
          <OracleMessage m={{ who:"user", time:"07:39", body:"What's blocking my Career S → SS rank?" }}/>
          <OracleMessage m={{ who:"oracle", time:"07:39", body:"Shipping cadence inconsistent on Tue/Thu. Email backlog 142 unread. No teaching output in 18d.", chips:["Build plan","Show data"] }}/>
        </div>

        <div style={{ marginTop:10, padding:"10px 14px", border:"1px solid var(--hl-strong)", borderRadius:12, background:"rgba(0,0,0,.4)", display:"flex", alignItems:"center", gap:10 }}>
          <span className="mono" style={{ color:"var(--c-violet-2)" }}>›</span>
          <span style={{ flex:1, fontSize:12, color:"var(--text-md)" }}>Ask Oracle…</span>
          <span style={{ width:26, height:26, borderRadius:8, background:"linear-gradient(135deg, var(--c-violet), var(--c-blue))", display:"grid", placeItems:"center", color:"#06080f", fontSize:11 }}>▲</span>
        </div>
      </div>
    </PhoneFrame>
  );
}

/* ─────────────────────────────────────────────────────────────
   LEVEL-UP CINEMATIC OVERLAY
   ───────────────────────────────────────────────────────────── */

function ScreenLevelUp() {
  return (
    <div className="scr" style={{ display:"grid", placeItems:"center", overflow:"hidden" }}>
      {/* radial rays */}
      <div style={{ position:"absolute", inset:0, background:`
        radial-gradient(circle at 50% 50%, rgba(245,196,81,.25), transparent 50%),
        conic-gradient(from 0deg at 50% 50%, rgba(245,196,81,.12) 0deg, transparent 30deg, rgba(245,196,81,.12) 60deg, transparent 90deg, rgba(245,196,81,.12) 120deg, transparent 150deg, rgba(245,196,81,.12) 180deg, transparent 210deg, rgba(245,196,81,.12) 240deg, transparent 270deg, rgba(245,196,81,.12) 300deg, transparent 330deg)
      `, pointerEvents:"none" }}/>

      {/* center stage */}
      <div style={{ position:"relative", textAlign:"center", zIndex:2 }}>
        <div className="mono" style={{ fontSize:11, color:"var(--c-gold)", letterSpacing:".5em" }}>◆ MILESTONE ◆</div>

        <div style={{ marginTop:14, position:"relative", display:"inline-block" }}>
          <svg width="280" height="280" style={{ display:"block" }}>
            <defs>
              <radialGradient id="lvl-glow"><stop offset="0%" stopColor="rgba(245,196,81,.5)"/><stop offset="100%" stopColor="rgba(245,196,81,0)"/></radialGradient>
            </defs>
            <circle cx="140" cy="140" r="130" fill="url(#lvl-glow)"/>
            <polygon points={Array.from({length:6}).map((_,i) => { const a = -Math.PI/2 + i*Math.PI/3; return `${140+Math.cos(a)*110},${140+Math.sin(a)*110}` }).join(" ")} fill="none" stroke="var(--c-gold)" strokeWidth="2" style={{ filter:"drop-shadow(0 0 12px var(--c-gold))" }}/>
            <polygon points={Array.from({length:6}).map((_,i) => { const a = -Math.PI/2 + i*Math.PI/3 + Math.PI/6; return `${140+Math.cos(a)*85},${140+Math.sin(a)*85}` }).join(" ")} fill="none" stroke="rgba(245,196,81,.5)" strokeWidth="1"/>
            <polygon points={Array.from({length:6}).map((_,i) => { const a = -Math.PI/2 + i*Math.PI/3; return `${140+Math.cos(a)*60},${140+Math.sin(a)*60}` }).join(" ")} fill="rgba(245,196,81,.1)" stroke="var(--c-gold)" strokeWidth="1.5"/>
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
            <div className="mono" style={{ fontSize:14, color:"var(--c-gold)", letterSpacing:".4em" }}>LEVEL</div>
            <div style={{ fontSize:88, fontWeight:900, color:"var(--c-gold)", textShadow:"0 0 30px var(--c-gold)", lineHeight:1, marginTop:2 }}>25</div>
          </div>
        </div>

        <h1 className="h-display" style={{ fontSize:42, margin:"22px 0 8px", color:"#fff0c0", textShadow:"0 0 20px var(--c-gold-glow)" }}>RANK ASCENDED</h1>
        <div className="mono" style={{ fontSize:13, color:"var(--text-md)", letterSpacing:".18em" }}>A-RANK · SYSTEMS ARCHITECT</div>

        <div style={{ marginTop:30, display:"flex", gap:14, justifyContent:"center" }}>
          {[
            ["+1", "Skill Point"],
            ["+5%", "Global XP"],
            ["UNLOCK", "Architect's Vision"]
          ].map(([v,l]) => (
            <div key={l} style={{ padding:"12px 18px", border:"1px solid rgba(245,196,81,.4)", background:"rgba(245,196,81,.06)", borderRadius:10, minWidth:130 }}>
              <div className="mono" style={{ fontSize:16, color:"var(--c-gold)", fontWeight:700 }}>{v}</div>
              <div style={{ fontSize:11, color:"var(--text-md)", marginTop:4 }}>{l}</div>
            </div>
          ))}
        </div>

        <button style={{ marginTop:36, all:"unset", cursor:"pointer", padding:"14px 30px", background:"linear-gradient(135deg, var(--c-gold), #fff0c0)", color:"#3a2a05", fontWeight:800, letterSpacing:".15em", fontSize:13, borderRadius:8, boxShadow:"0 0 40px -8px var(--c-gold)" }}>CONTINUE →</button>
      </div>

      {/* corner ticks */}
      <div style={{ position:"absolute", top:30, left:30, fontFamily:"var(--ff-mono)", fontSize:10, color:"var(--c-gold)", letterSpacing:".22em", opacity:.7 }}>
        ◢ EVENT-LVL-025<br/>CYCLE 248 · 22:47:11<br/>WITNESSED ✓
      </div>
      <div style={{ position:"absolute", top:30, right:30, fontFamily:"var(--ff-mono)", fontSize:10, color:"var(--c-gold)", letterSpacing:".22em", opacity:.7, textAlign:"right" }}>
        XP TOTAL 187,420<br/>NEXT TIER · LV 30<br/>STREAK 41
      </div>
    </div>
  );
}

/* Combined mobile presentation: three phones side-by-side */
function ScreenMobile() {
  return (
    <div style={{ width:"100%", height:"100%", background:"radial-gradient(circle at 50% 30%, rgba(78,161,255,.08), transparent 60%), #06080f", padding:"30px 20px", display:"flex", alignItems:"center", justifyContent:"center", gap:30, overflow:"auto" }}>
      <MobileHome/>
      <MobileStats/>
      <MobileOracle/>
    </div>
  );
}

Object.assign(window, { ScreenMobile, ScreenLevelUp, MobileHome, MobileStats, MobileOracle });
