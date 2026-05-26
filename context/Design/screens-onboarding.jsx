/* screens-onboarding.jsx — cinematic first-run sequence */

function ScreenOnboardWelcome() {
  return (
    <div className="scr" style={{ display:"grid", placeItems:"center", padding:40 }}>
      <div className="scan-overlay"/>
      {/* large concentric glyph */}
      <div style={{ position:"absolute", inset:0, display:"grid", placeItems:"center", pointerEvents:"none" }}>
        <svg viewBox="0 0 600 600" width="640" height="640" style={{ opacity:.5 }}>
          <defs>
            <radialGradient id="hex-g">
              <stop offset="0%" stopColor="rgba(78,161,255,.3)"/>
              <stop offset="100%" stopColor="rgba(78,161,255,0)"/>
            </radialGradient>
          </defs>
          <circle cx="300" cy="300" r="280" fill="url(#hex-g)"/>
          {[260, 220, 180, 140, 100, 60].map((r,i) => (
            <polygon key={r}
              points={Array.from({length:6}).map((_,k) => {
                const a = -Math.PI/2 + k * Math.PI/3 + i*.05;
                return `${300 + Math.cos(a)*r},${300 + Math.sin(a)*r}`;
              }).join(" ")}
              fill="none" stroke={i%2 ? "rgba(176,124,255,.25)" : "rgba(78,161,255,.25)"} strokeWidth="1"
              style={{ filter: `drop-shadow(0 0 ${4+i*2}px rgba(78,161,255,.3))` }}/>
          ))}
          <circle cx="300" cy="300" r="6" fill="var(--c-blue-2)" style={{ filter:"drop-shadow(0 0 12px var(--c-blue))" }}/>
        </svg>
      </div>

      <div style={{ position:"relative", textAlign:"center", maxWidth:520 }}>
        <div className="mono" style={{ fontSize:11, color:"var(--c-blue-2)", letterSpacing:".4em" }}>ASCENDANT // v3.2</div>
        <h1 className="h-display" style={{ fontSize:64, margin:"24px 0 12px", lineHeight:.95 }}>
          Initialize<br/>
          <span style={{ background:"linear-gradient(135deg, var(--c-blue), var(--c-violet))", WebkitBackgroundClip:"text", color:"transparent" }}>your system.</span>
        </h1>
        <div style={{ fontSize:15, color:"var(--text-md)", lineHeight:1.55, maxWidth:420, margin:"0 auto" }}>
          A life progression operating system. Track real-world attributes, compound consistent habits, and level your domains over time.
        </div>
        <div style={{ marginTop:28, display:"flex", gap:10, justifyContent:"center" }}>
          <button style={{ all:"unset", cursor:"pointer", padding:"14px 28px", background:"linear-gradient(135deg, var(--c-blue), var(--c-violet))", color:"#06080f", fontWeight:700, letterSpacing:".05em", fontSize:13, borderRadius:8, boxShadow:"0 0 32px -8px var(--c-blue-glow)" }}>BEGIN INITIALIZATION →</button>
          <button style={{ all:"unset", cursor:"pointer", padding:"14px 22px", border:"1px solid var(--hl-strong)", color:"var(--text-md)", fontSize:13, borderRadius:8 }}>I have a save file</button>
        </div>
        <div className="mono" style={{ marginTop:40, fontSize:10, color:"var(--text-dim)", letterSpacing:".22em" }}>
          ◇ EST. CALIBRATION 8 MIN · 12 STEPS · NO SHORTCUTS
        </div>
      </div>

      {/* corner annotations */}
      <div style={{ position:"absolute", bottom:30, left:30, fontFamily:"var(--ff-mono)", fontSize:10, color:"var(--text-dim)", letterSpacing:".2em" }}>
        ◢ NODE-04 / OPERATOR<br/>
        BIO-LINK ESTABLISHED<br/>
        SYNC 100%
      </div>
      <div style={{ position:"absolute", bottom:30, right:30, fontFamily:"var(--ff-mono)", fontSize:10, color:"var(--text-dim)", textAlign:"right", letterSpacing:".2em" }}>
        ASCENDANT_SYS_V3.2_BUILD_8814<br/>
        © PRIVATE INSTANCE
      </div>
    </div>
  );
}

function ScreenOnboardClass() {
  const classes = [
    { id:"battle", name:"Battle Scholar", color:"var(--c-blue)",    glyph:"⚔", hue:"blue",   strs:["INT","DSC","STR"], desc:"Pairs deep study with physical training." },
    { id:"iron",   name:"Iron Monk",       color:"var(--c-crimson)", glyph:"⌖", hue:"crimson",strs:["STR","DSC","SPI"], desc:"Body as foundation. Discipline as religion." },
    { id:"shadow", name:"Shadow Builder",  color:"var(--c-violet)",  glyph:"◈", hue:"violet", strs:["INT","CRE","DSC"], desc:"Long, quiet arcs of creation in private.", selected:true },
    { id:"alch",   name:"Creative Alchemist",color:"var(--c-violet-2)",glyph:"✦",hue:"violet",strs:["CRE","FOC","INT"], desc:"Transmutes inputs into novel work." },
    { id:"arch",   name:"Systems Architect", color:"var(--c-cyan)",   glyph:"◇", hue:"blue",   strs:["INT","DSC","WL"],  desc:"Engineers leverage. Compounds outputs." },
    { id:"silent", name:"Silent Strategist", color:"var(--c-gold)",   glyph:"☉", hue:"gold",   strs:["INT","FOC","SO"],  desc:"Sees three steps ahead. Acts once." },
    { id:"prod",   name:"Producer",          color:"var(--c-emerald)",glyph:"◉", hue:"emerald",strs:["CRE","DSC","WL"],  desc:"Ships. Then ships again." },
    { id:"hybrid", name:"Hybrid Class",      color:"var(--text-md)",  glyph:"⊛", hue:"blue",   strs:["?","?","?"],       desc:"Define your own progression curve." },
  ];

  return (
    <div className="scr" style={{ padding:40, display:"flex", flexDirection:"column" }}>
      <OnboardChrome step={4}/>
      <div style={{ marginTop:30, display:"grid", gridTemplateColumns:"1fr 1fr", gap:40, alignItems:"start" }}>
        <div>
          <div className="eyebrow" style={{ color:"var(--c-blue-2)" }}>STEP 04 · CLASS SELECTION</div>
          <h1 className="h-display" style={{ fontSize:46, margin:"14px 0 16px", lineHeight:1 }}>Choose your<br/>archetype.</h1>
          <div style={{ fontSize:14, color:"var(--text-md)", lineHeight:1.6, maxWidth:440 }}>
            Your class shapes XP multipliers, default stat curves, and the keystone habits suggested for each life domain. You may evolve or branch later through the skill tree.
          </div>

          <div style={{ marginTop:24, padding:18, border:"1px solid rgba(176,124,255,.35)", background:"rgba(176,124,255,.05)", borderRadius:10, position:"relative" }}>
            <Brackets color="var(--c-violet-glow)" inset={6}/>
            <div className="mono" style={{ fontSize:10, color:"var(--c-violet-2)", letterSpacing:".22em" }}>CURRENT SELECTION</div>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginTop:10 }}>
              <Sigil size={60} hue="violet" glyph="◈"/>
              <div>
                <div style={{ fontSize:18, fontWeight:700 }}>Shadow Builder</div>
                <div className="mono" style={{ fontSize:10, color:"var(--text-lo)", letterSpacing:".15em", marginTop:2 }}>FAVORED · INT · CRE · DSC</div>
              </div>
            </div>
            <div style={{ marginTop:14, fontSize:13, color:"var(--text-md)", lineHeight:1.5 }}>
              Long, quiet arcs of creation in private. Gains compound while undisturbed. Best paired with strict input limits and a single keystone habit per domain.
            </div>
            <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {[["+25% XP", "Solo deep work"], ["+15% XP", "Music/Code"], ["-10% XP", "Networking"]].map(([m,n]) => (
                <div key={n} style={{ padding:"8px 10px", background:"rgba(0,0,0,.3)", borderRadius:6, border:"1px solid var(--hl)" }}>
                  <div className="mono" style={{ fontSize:11, color:"var(--c-violet-2)", fontWeight:700 }}>{m}</div>
                  <div style={{ fontSize:10.5, color:"var(--text-lo)", marginTop:2 }}>{n}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {classes.map(c => (
            <button key={c.id} style={{
              all:"unset", cursor:"pointer", padding:16,
              border:`1px solid ${c.selected ? c.color : "var(--hl)"}`,
              background: c.selected ? `linear-gradient(135deg, ${c.color}18, transparent)` : "rgba(255,255,255,.015)",
              borderRadius:10,
              position:"relative",
              boxShadow: c.selected ? `0 0 24px -8px ${c.color}` : "none"
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:8, background:`${c.color}15`, border:`1px solid ${c.color}55`, color:c.color, display:"grid", placeItems:"center", fontSize:16 }}>{c.glyph}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{c.name}</div>
                  <div className="mono" style={{ fontSize:9, color:"var(--text-lo)", letterSpacing:".18em", marginTop:2 }}>{c.strs.join(" · ")}</div>
                </div>
              </div>
              <div style={{ fontSize:11.5, color:"var(--text-md)", lineHeight:1.45, marginTop:10 }}>{c.desc}</div>
              {c.selected && <span style={{ position:"absolute", top:8, right:8, padding:"2px 6px", background:c.color, color:"#06080f", fontFamily:"var(--ff-mono)", fontSize:8, fontWeight:700, letterSpacing:".15em", borderRadius:3 }}>SELECTED</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop:"auto", display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:24 }}>
        <button style={{ all:"unset", cursor:"pointer", padding:"10px 16px", color:"var(--text-md)", fontSize:12 }}>← BACK · Life Domains</button>
        <button style={{ all:"unset", cursor:"pointer", padding:"12px 22px", background:"linear-gradient(135deg, var(--c-violet), var(--c-blue))", color:"#06080f", fontWeight:700, fontSize:12, letterSpacing:".05em", borderRadius:8, boxShadow:"0 0 24px -8px var(--c-violet-glow)" }}>CONFIRM CLASS → STEP 05</button>
      </div>
    </div>
  );
}

function ScreenOnboardOneThing() {
  const domains = [
    { name:"Fitness",     color:"var(--c-crimson)",  glyph:"⌖", one:"Train 4× / week — strength priority", set:true },
    { name:"Career",      color:"var(--c-blue)",     glyph:"◈", one:"Ship one feature daily — production-grade", set:true },
    { name:"Creativity",  color:"var(--c-violet)",   glyph:"✦", one:"Produce music — 45m / day", set:true, active:true },
    { name:"Learning",    color:"var(--c-cyan)",     glyph:"◐", one:"Read 20 marked pages / day", set:true },
    { name:"Relationships",color:"var(--c-gold)",     glyph:"◯", one:"One deep call / week", set:false },
    { name:"Spirituality",color:"var(--c-cyan)",     glyph:"☉", one:"Meditate 12m breath box", set:true },
    { name:"Finance",     color:"var(--c-emerald)",  glyph:"◇", one:"Net worth +1% / month · automated", set:true },
    { name:"Mental",      color:"var(--c-violet-2)", glyph:"◉", one:"Weekly review · Fridays 16:00", set:false },
  ];

  return (
    <div className="scr" style={{ padding:40, display:"flex", flexDirection:"column" }}>
      <OnboardChrome step={5}/>
      <div style={{ marginTop:26, display:"grid", gridTemplateColumns:"1.05fr 1fr", gap:40 }}>
        <div>
          <div className="eyebrow" style={{ color:"var(--c-gold)" }}>STEP 05 · KEYSTONE DEFINITION</div>
          <h1 className="h-display" style={{ fontSize:44, margin:"14px 0 16px", lineHeight:1 }}>
            Choose <span style={{ color:"var(--c-gold)" }}>one thing</span><br/>per domain.
          </h1>
          <div style={{ fontSize:14, color:"var(--text-md)", lineHeight:1.6, maxWidth:480 }}>
            From <i>The One Thing</i> — one keystone habit per domain that, when done consistently, makes everything else easier or unnecessary. Choose carefully; this is the load-bearing beam of your week.
          </div>

          <div style={{ marginTop:24, padding:18, border:"1px solid rgba(176,124,255,.35)", background:"rgba(176,124,255,.05)", borderRadius:10 }}>
            <div className="mono" style={{ fontSize:10, color:"var(--c-violet-2)", letterSpacing:".22em" }}>EDITING · CREATIVITY</div>
            <div style={{ fontSize:13, color:"var(--text-md)", marginTop:8 }}>What is the single habit that — when done consistently — disproportionately moves your Creativity domain forward?</div>
            <div style={{ marginTop:14, padding:"14px 16px", background:"rgba(0,0,0,.4)", border:"1px solid rgba(176,124,255,.3)", borderRadius:8 }}>
              <div className="mono" style={{ fontSize:10, color:"var(--c-violet-2)", letterSpacing:".18em" }}>KEYSTONE</div>
              <div style={{ fontSize:18, fontWeight:600, marginTop:6, color:"var(--text-hi)" }}>Produce music — 45m / day</div>
              <div className="mono" style={{ fontSize:10, color:"var(--text-lo)", marginTop:6 }}>cadence: daily · 06:00–06:45 default window</div>
            </div>
            <div style={{ marginTop:14 }}>
              <div className="eyebrow" style={{ marginBottom:8 }}>SUGGESTED · SHADOW BUILDER × CREATIVITY</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {["Sketch one sound design idea — 5m","Sample-dig session — 15m","Release one piece every 6 weeks"].map(s => (
                  <div key={s} style={{ display:"grid", gridTemplateColumns:"3px 1fr", gap:8, padding:"7px 10px", background:"rgba(255,255,255,.015)", border:"1px solid var(--hl)", borderRadius:6 }}>
                    <span style={{ background:"var(--c-violet)" }}/>
                    <span style={{ fontSize:11.5, color:"var(--text-md)" }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="eyebrow" style={{ color:"var(--text-lo)" }}>DOMAIN MAP · 6 / 8 KEYSTONES SET</div>
          <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
            {domains.map(d => (
              <div key={d.name} style={{ display:"grid", gridTemplateColumns:"32px 1fr auto", gap:12, padding:"12px 14px", border:`1px solid ${d.active ? d.color : "var(--hl)"}`, background: d.active ? `${d.color}10` : (d.set ? "rgba(255,255,255,.015)" : "rgba(255,90,110,.04)"), borderRadius:8, alignItems:"center" }}>
                <div style={{ width:32, height:32, borderRadius:8, background:`${d.color}1a`, border:`1px solid ${d.color}55`, color:d.color, display:"grid", placeItems:"center", fontSize:15 }}>{d.glyph}</div>
                <div>
                  <div style={{ fontSize:12.5, fontWeight:600, color:"var(--text-hi)" }}>{d.name}</div>
                  <div className="mono" style={{ fontSize:10.5, color: d.set ? "var(--text-md)" : "var(--c-crimson)", marginTop:2 }}>
                    {d.set ? d.one : "▢ keystone not set"}
                  </div>
                </div>
                {d.active ? <span className="mono" style={{ fontSize:9, color:d.color, letterSpacing:".18em" }}>EDITING</span>
                  : d.set ? <span className="mono" style={{ fontSize:9, color:"var(--c-emerald)", letterSpacing:".18em" }}>SET ✓</span>
                  : <span className="mono" style={{ fontSize:9, color:"var(--c-crimson)", letterSpacing:".18em" }}>PENDING</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop:"auto", display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:24 }}>
        <button style={{ all:"unset", cursor:"pointer", padding:"10px 16px", color:"var(--text-md)", fontSize:12 }}>← BACK · Class</button>
        <div style={{ display:"flex", gap:10 }}>
          <button style={{ all:"unset", cursor:"pointer", padding:"12px 18px", border:"1px solid var(--hl-strong)", color:"var(--text-md)", fontSize:12, borderRadius:8 }}>Skip remaining</button>
          <button style={{ all:"unset", cursor:"pointer", padding:"12px 22px", background:"linear-gradient(135deg, var(--c-gold), #fff0c0)", color:"#3a2a05", fontWeight:700, fontSize:12, letterSpacing:".05em", borderRadius:8, boxShadow:"0 0 24px -8px var(--c-gold-glow)" }}>NEXT KEYSTONE →</button>
        </div>
      </div>
    </div>
  );
}

function OnboardChrome({ step=4, total=12 }) {
  const labels = ["Welcome","Identity","Vows","Domains","Class","Keystone","Calibration","Stat Gen","Buffs","Sync","Channels","Ascend"];
  return (
    <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div className="mono" style={{ fontSize:10, color:"var(--text-lo)", letterSpacing:".22em" }}>ASCENDANT // INITIALIZATION</div>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        {labels.map((l,i) => (
          <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:i===step?24:8, height:3, borderRadius:2, background: i<step ? "var(--c-blue)" : i===step ? "var(--c-violet)" : "rgba(255,255,255,.1)", boxShadow: i<=step ? "0 0 6px currentColor" : "none", transition:"all .3s" }}/>
          </div>
        ))}
        <span className="mono" style={{ fontSize:10, color:"var(--text-md)", marginLeft:8 }}>{String(step).padStart(2,"0")} / {total}</span>
      </div>
    </header>
  );
}

Object.assign(window, { ScreenOnboardWelcome, ScreenOnboardClass, ScreenOnboardOneThing });
