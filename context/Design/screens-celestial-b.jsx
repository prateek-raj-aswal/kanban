/* screens-celestial-b.jsx
   Celestial & Seasonal Environment — Part B
   ─ Lunar Codex · all 8 phases + calendar + constellations
   ─ Season Atlas · spring/summer/autumn/winter worlds
   ─ World Library · selectable background environments
*/

/* ════════════════════════════════════════════════════════
   3 — LUNAR CODEX
   ════════════════════════════════════════════════════════ */

function ScreenLunarCodex() {
  const phases = [
    { name:"New",            illum:0,    waxing:true,  day:"15.MAY", c:"#3a4060" },
    { name:"Waxing Crescent",illum:0.18, waxing:true,  day:"19.MAY", c:"#6a7295" },
    { name:"First Quarter",  illum:0.5,  waxing:true,  day:"23.MAY", c:"#9aa5c4" },
    { name:"Waxing Gibbous", illum:0.85, waxing:true,  day:"26.MAY", c:"#cdd2e6", current:true },
    { name:"Full",           illum:1,    waxing:true,  day:"31.MAY", c:"#ffffff" },
    { name:"Waning Gibbous", illum:0.78, waxing:false, day:"05.JUN", c:"#cdd2e6" },
    { name:"Last Quarter",   illum:0.5,  waxing:false, day:"08.JUN", c:"#9aa5c4" },
    { name:"Waning Crescent",illum:0.18, waxing:false, day:"12.JUN", c:"#6a7295" }
  ];

  return (
    <div className="scr" style={{ display:"flex" }}>
      {/* night-sky atmospheric layer */}
      <div style={{ position:"absolute", inset:0, zIndex:0,
        background:
          "radial-gradient(50% 50% at 70% 30%, rgba(205,210,230,.07), transparent 60%)," +
          "radial-gradient(60% 50% at 20% 80%, rgba(78,90,140,.10), transparent 60%)"
      }}/>
      <svg style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none" }} width="100%" height="100%">
        {Array.from({length:90}).map((_, i) => {
          const x = (i*71)%100, y = (i*43)%100;
          const r = (i%7===0) ? 1.6 : 0.7;
          const op = ((i*13)%70)/100 + 0.1;
          return <circle key={i} cx={`${x}%`} cy={`${y}%`} r={r} fill="#fff" opacity={op}/>;
        })}
      </svg>

      <div style={{ position:"relative", zIndex:1, display:"flex", width:"100%" }}>
        <SideNav active="dashboard"/>
        <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
          <TopBar title="Lunar Codex · Phase Calendar" crumb="ENVIRONMENT / LUNAR" clock="20:14:08" energy={62}/>

          <div className="scrollY" style={{ flex:1, padding:"22px 26px", display:"grid", gridTemplateColumns:"1fr", gap:18 }}>

            {/* HERO: CURRENT PHASE */}
            <section className="panel" style={{ padding:24, position:"relative", overflow:"hidden",
              background:"linear-gradient(180deg, rgba(20,24,40,.55) 0%, rgba(10,12,22,.85) 100%)",
              boxShadow:"inset 0 1px 0 rgba(255,255,255,.04), 0 0 0 1px rgba(205,210,230,.18), 0 0 32px -10px rgba(205,210,230,.3)"
            }}>
              <Brackets color="rgba(205,210,230,.4)" inset={8}/>
              <div className="scan-overlay" style={{ background:"linear-gradient(180deg, transparent 0%, rgba(205,210,230,.04) 50%, transparent 100%)", animationDuration:"12s" }}/>

              <div style={{ display:"grid", gridTemplateColumns:"auto 1fr auto", gap:32, alignItems:"center", position:"relative" }}>
                <div style={{ position:"relative" }}>
                  <MoonGlyph size={220} illum={0.85} waxing/>
                  <div style={{ position:"absolute", inset:-30, borderRadius:"50%", border:"1px dashed rgba(205,210,230,.18)" }}/>
                  <div style={{ position:"absolute", inset:-60, borderRadius:"50%", border:"1px dashed rgba(205,210,230,.08)" }}/>
                </div>

                <div>
                  <div className="mono" style={{ fontSize:11, color:"rgba(205,210,230,.7)", letterSpacing:".32em" }}>◯ ◯ ◯ &nbsp;&nbsp; LUNAR CODEX &nbsp;&nbsp; ◯ ◯ ◯</div>
                  <h1 className="h-display" style={{ fontSize:54, margin:"10px 0 4px", color:"#e8edf7", letterSpacing:"-.02em" }}>Waxing Gibbous</h1>
                  <div style={{ fontSize:14, color:"var(--text-md)", letterSpacing:".02em" }}>
                    26.MAY.2026 · Lunation age 11d 6h · 85% illuminated · Rising toward fullness
                  </div>

                  <div style={{ marginTop:18, display:"flex", gap:12, alignItems:"center" }}>
                    <div style={{ padding:"8px 14px", border:"1px solid rgba(205,210,230,.3)", borderRadius:8, background:"rgba(205,210,230,.05)" }}>
                      <span className="mono" style={{ fontSize:10, color:"rgba(205,210,230,.85)", letterSpacing:".22em" }}>NEXT FULL · 31.MAY · 4d 6h</span>
                    </div>
                    <div style={{ padding:"8px 14px", border:"1px solid rgba(91,231,224,.3)", borderRadius:8, background:"rgba(91,231,224,.05)" }}>
                      <span className="mono" style={{ fontSize:10, color:"#5be7e0", letterSpacing:".22em" }}>RESONANCE +8%</span>
                    </div>
                  </div>

                  <div style={{ marginTop:18, padding:"14px 16px", background:"rgba(205,210,230,.04)", border:"1px solid rgba(205,210,230,.12)", borderRadius:10 }}>
                    <div className="mono" style={{ fontSize:9, color:"rgba(205,210,230,.7)", letterSpacing:".22em", marginBottom:5 }}>SYSTEM NOTICE</div>
                    <div style={{ fontSize:13, color:"var(--text-md)", lineHeight:1.5 }}>
                      The gibbous window favors momentum-building. Discipline streaks compound 8% faster during the rise to full. Schedule heavy lifts inside this corridor.
                    </div>
                  </div>
                </div>

                {/* phase wheel */}
                <div style={{ position:"relative", width:220, height:220 }}>
                  <svg viewBox="0 0 220 220" width="220" height="220">
                    <defs>
                      <radialGradient id="phase-wheel-bg" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(205,210,230,.15)"/>
                        <stop offset="100%" stopColor="transparent"/>
                      </radialGradient>
                    </defs>
                    <circle cx="110" cy="110" r="100" fill="url(#phase-wheel-bg)"/>
                    <circle cx="110" cy="110" r="95" fill="none" stroke="rgba(205,210,230,.2)" strokeWidth="1"/>
                    <circle cx="110" cy="110" r="70" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="1" strokeDasharray="2 4"/>
                    {/* tick segments per phase */}
                    {phases.map((p, i) => {
                      const a = (i/8)*Math.PI*2 - Math.PI/2;
                      const x = 110 + Math.cos(a)*82;
                      const y = 110 + Math.sin(a)*82;
                      const isCur = p.current;
                      const er = 8;
                      // shadow offset: positive (waxing) covers left side; negative covers right
                      const shadowCx = p.waxing ? -er*(1 - p.illum*2) : er*(1 - p.illum*2);
                      return (
                        <g key={i} transform={`translate(${x} ${y})`}>
                          {/* base lit disc */}
                          <circle r={er} fill="#cdd2e6" opacity={p.illum === 0 ? 0.2 : 0.9}/>
                          {/* shadow ellipse */}
                          {p.illum > 0 && p.illum < 1 && (
                            <ellipse cx={shadowCx} rx={er} ry={er} fill="#0b0d18" opacity=".9" style={{ clipPath: `inset(0 ${p.waxing ? 50 : 0}% 0 ${p.waxing ? 0 : 50}% round 50%)` }}/>
                          )}
                          {p.illum === 0 && <circle r={er} fill="#1a1c28"/>}
                          {/* outline */}
                          <circle r={er} fill="none" stroke="rgba(205,210,230,.4)" strokeWidth=".8"/>
                          {isCur && <circle r={er+5} fill="none" stroke="rgba(91,231,224,.8)" strokeWidth="1.5" style={{ filter:"drop-shadow(0 0 6px #5be7e0)" }}/>}
                        </g>
                      );
                    })}
                    <text x="110" y="106" textAnchor="middle" style={{ fontFamily:"var(--ff-mono)", fontSize:9, fill:"rgba(205,210,230,.65)", letterSpacing:".24em" }}>LUNATION</text>
                    <text x="110" y="124" textAnchor="middle" style={{ fontFamily:"var(--ff-ui)", fontSize:18, fontWeight:700, fill:"#e8edf7" }}>11.4d</text>
                  </svg>
                </div>
              </div>
            </section>

            {/* ALL 8 PHASES GRID */}
            <section className="panel" style={{ padding:18, position:"relative" }}>
              <PanelHead eyebrow="◯ EIGHT PHASES · 29.5 DAY CYCLE" title="The full lunation"
                right={<span className="mono" style={{ fontSize:10, color:"var(--text-lo)" }}>SYNODIC MONTH</span>}/>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:10 }}>
                {phases.map((p, i) => (
                  <div key={i} style={{
                    padding:"16px 12px 12px",
                    border: `1px solid ${p.current ? "rgba(91,231,224,.4)" : "var(--hl)"}`,
                    background: p.current ? "linear-gradient(180deg, rgba(91,231,224,.08), transparent)" : "rgba(255,255,255,.015)",
                    borderRadius:10, position:"relative", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center"
                  }}>
                    {p.current && <Brackets color="rgba(91,231,224,.5)" inset={4}/>}
                    <MoonGlyph size={56} illum={p.illum} waxing={p.waxing} dim={!p.current}/>
                    <div style={{ fontSize:11, fontWeight:600, marginTop:10, color: p.current ? "#5be7e0" : "var(--text-hi)" }}>{p.name}</div>
                    <div className="mono" style={{ fontSize:9, color:"var(--text-dim)", marginTop:3, letterSpacing:".14em" }}>{p.day}</div>
                    <div className="mono" style={{ fontSize:9, color: p.current ? "#5be7e0" : "var(--text-lo)", marginTop:6, letterSpacing:".18em" }}>
                      {p.current ? "● NOW" : `${Math.round(p.illum*100)}%`}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CONSTELLATIONS + EFFECTS */}
            <div style={{ display:"grid", gridTemplateColumns:"1.1fr .9fr", gap:18 }}>

              {/* CONSTELLATION MASTERY */}
              <section className="panel" style={{ padding:18, position:"relative" }}>
                <PanelHead eyebrow="✦ CONSTELLATION UNLOCKS" title="Stars earned through mastery"
                  right={<span className="mono" style={{ fontSize:10, color:"var(--c-cyan)" }}>3 OF 12 UNLOCKED</span>}/>

                <div style={{ position:"relative", marginTop:6, height:280, borderRadius:10, overflow:"hidden",
                  background:"radial-gradient(60% 50% at 50% 50%, rgba(10,14,30,.6), rgba(2,3,8,.95))",
                  border:"1px solid var(--hl)"
                }}>
                  <svg viewBox="0 0 540 280" width="100%" height="100%" style={{ display:"block" }}>
                    {/* background stars */}
                    {Array.from({length:60}).map((_, i) => (
                      <circle key={i} cx={(i*53)%540} cy={(i*37)%280} r={(i%5===0)?1.4:0.7} fill="#fff" opacity={((i*11)%50)/100 + 0.1}/>
                    ))}

                    {/* "The Forge" — unlocked */}
                    <g>
                      {[
                        [60,80],[110,60],[140,100],[180,75],[210,120],[160,140],[100,130]
                      ].map((p, i, arr) => (
                        <g key={i}>
                          <circle cx={p[0]} cy={p[1]} r="3.5" fill="#5be7e0" style={{ filter:"drop-shadow(0 0 6px #5be7e0)" }}/>
                          {i < arr.length-1 && <line x1={p[0]} y1={p[1]} x2={arr[i+1][0]} y2={arr[i+1][1]} stroke="rgba(91,231,224,.5)" strokeWidth="1"/>}
                        </g>
                      ))}
                      <text x="135" y="170" textAnchor="middle" style={{ fontFamily:"var(--ff-mono)", fontSize:10, fill:"#5be7e0", letterSpacing:".22em" }}>THE FORGE</text>
                      <text x="135" y="184" textAnchor="middle" style={{ fontFamily:"var(--ff-mono)", fontSize:8, fill:"rgba(91,231,224,.6)", letterSpacing:".14em" }}>STR · DSC · 90d</text>
                    </g>

                    {/* "The Reader" — unlocked */}
                    <g>
                      {[
                        [290,60],[340,80],[380,55],[420,90],[370,120],[320,110]
                      ].map((p, i, arr) => (
                        <g key={i}>
                          <circle cx={p[0]} cy={p[1]} r="3.5" fill="#4ea1ff" style={{ filter:"drop-shadow(0 0 6px #4ea1ff)" }}/>
                          {i < arr.length-1 && <line x1={p[0]} y1={p[1]} x2={arr[i+1][0]} y2={arr[i+1][1]} stroke="rgba(78,161,255,.5)" strokeWidth="1"/>}
                        </g>
                      ))}
                      <text x="355" y="148" textAnchor="middle" style={{ fontFamily:"var(--ff-mono)", fontSize:10, fill:"#4ea1ff", letterSpacing:".22em" }}>THE READER</text>
                      <text x="355" y="162" textAnchor="middle" style={{ fontFamily:"var(--ff-mono)", fontSize:8, fill:"rgba(78,161,255,.6)", letterSpacing:".14em" }}>INT · 120d</text>
                    </g>

                    {/* "The Builder" — locked, faint */}
                    <g opacity=".35">
                      {[
                        [80,200],[120,220],[160,210],[200,235],[150,250]
                      ].map((p, i, arr) => (
                        <g key={i}>
                          <circle cx={p[0]} cy={p[1]} r="2.5" fill="rgba(245,196,81,.5)"/>
                          {i < arr.length-1 && <line x1={p[0]} y1={p[1]} x2={arr[i+1][0]} y2={arr[i+1][1]} stroke="rgba(245,196,81,.25)" strokeWidth="1" strokeDasharray="2 3"/>}
                        </g>
                      ))}
                      <text x="140" y="270" textAnchor="middle" style={{ fontFamily:"var(--ff-mono)", fontSize:9, fill:"rgba(245,196,81,.5)", letterSpacing:".18em" }}>🔒 THE BUILDER</text>
                    </g>

                    {/* "The Resonant" — locked */}
                    <g opacity=".35">
                      {[
                        [340,200],[390,215],[430,200],[460,230],[410,250],[370,240]
                      ].map((p, i, arr) => (
                        <g key={i}>
                          <circle cx={p[0]} cy={p[1]} r="2.5" fill="rgba(176,124,255,.5)"/>
                          {i < arr.length-1 && <line x1={p[0]} y1={p[1]} x2={arr[i+1][0]} y2={arr[i+1][1]} stroke="rgba(176,124,255,.25)" strokeWidth="1" strokeDasharray="2 3"/>}
                        </g>
                      ))}
                      <text x="400" y="268" textAnchor="middle" style={{ fontFamily:"var(--ff-mono)", fontSize:9, fill:"rgba(176,124,255,.5)", letterSpacing:".18em" }}>🔒 THE RESONANT</text>
                    </g>
                  </svg>
                </div>

                <div style={{ marginTop:10, display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, fontSize:10, fontFamily:"var(--ff-mono)" }}>
                  <div style={{ color:"var(--c-cyan)" }}>◉ FORGE · S02 D87</div>
                  <div style={{ color:"var(--c-blue)" }}>◉ READER · S03 D14</div>
                  <div style={{ color:"var(--text-dim)" }}>🔒 BUILDER · 84%</div>
                  <div style={{ color:"var(--text-dim)" }}>🔒 RESONANT · 62%</div>
                </div>
              </section>

              {/* LUNAR EFFECTS BY PHASE */}
              <section className="panel" style={{ padding:18 }}>
                <PanelHead eyebrow="◐ LUNAR EFFECTS · ACTIVE" title="What the moon is doing to your system"/>
                <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                  {[
                    { phase:"Waxing Gibbous", effect:"+8% momentum during night work",  c:"#5be7e0", live:true },
                    { phase:"Full Moon · 4d", effect:"+12% night glow · dramatic lighting", c:"#ffffff", live:false },
                    { phase:"Full Moon · 4d", effect:"Discipline streak resonance peak",   c:"#cdd2e6", live:false },
                    { phase:"New Moon · 19d", effect:"Introspection · deeper shadows",     c:"#3a4060", live:false }
                  ].map((e, i) => (
                    <div key={i} style={{ padding:"11px 12px", border:`1px solid ${e.c}33`, background: e.live ? `${e.c}10` : "rgba(255,255,255,.015)", borderRadius:8 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span className="mono" style={{ fontSize:9, color:e.c, letterSpacing:".22em" }}>{e.live ? "● LIVE" : "◯ UPCOMING"}</span>
                        <span className="mono" style={{ fontSize:9, color:"var(--text-dim)", letterSpacing:".14em" }}>{e.phase.toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize:12, color: e.live ? "var(--text-hi)" : "var(--text-md)", marginTop:5 }}>{e.effect}</div>
                    </div>
                  ))}
                </div>

                <div className="divider" style={{ margin:"14px 0 10px" }}/>
                <div className="mono" style={{ fontSize:10, color:"var(--text-lo)", letterSpacing:".18em" }}>
                  NIGHT GLOW · <span style={{ color:"var(--c-cyan)" }}>+8%</span> ·  AURA TINT · <span style={{ color:"var(--c-cyan)" }}>SILVER LIFT</span>
                </div>
              </section>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   4 — SEASON ATLAS
   ════════════════════════════════════════════════════════ */

function SeasonCard({ season, label, dates, accent, palette, particles, ritual, message, active=false }) {
  return (
    <div style={{
      position:"relative", borderRadius:14, overflow:"hidden",
      background: palette.bg,
      border: `1px solid ${active ? accent+"55" : palette.border}`,
      boxShadow: active ? `0 0 0 1px ${accent}33, 0 0 30px -10px ${accent}88` : "none",
      height: 460, display:"flex", flexDirection:"column"
    }}>
      <Brackets color={accent+"55"} inset={6}/>

      {/* season scene */}
      <div style={{ height:160, position:"relative", overflow:"hidden", borderBottom:`1px solid ${palette.border}` }}>
        <SkyScene width={320} height={160} time={palette.time} season={season} sunPos={.5} moonPos={.5}/>
        {/* season particle overlay */}
        <svg style={{ position:"absolute", inset:0 }} width="100%" height="100%">
          {Array.from({length:particles.count}).map((_, i) => {
            const x = (i*53)%100, y = (i*37)%100;
            if (particles.shape === "leaf")
              return <rect key={i} x={`${x}%`} y={`${y}%`} width="3" height="5" fill={particles.color} opacity={.4 + (i%5)/10} transform={`rotate(${i*47},${x*3.2},${y*1.6})`}/>;
            if (particles.shape === "snow")
              return <circle key={i} cx={`${x}%`} cy={`${y}%`} r="1.6" fill={particles.color} opacity={.4 + (i%5)/10}/>;
            if (particles.shape === "petal")
              return <ellipse key={i} cx={`${x}%`} cy={`${y}%`} rx="1.6" ry="2.6" fill={particles.color} opacity={.4 + (i%5)/10}/>;
            return <circle key={i} cx={`${x}%`} cy={`${y}%`} r="1.2" fill={particles.color} opacity={.4 + (i%5)/10}/>;
          })}
        </svg>
      </div>

      {/* content */}
      <div style={{ flex:1, padding:16, display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div className="mono" style={{ fontSize:9, color:accent, letterSpacing:".26em" }}>✿ {label.toUpperCase()}</div>
            <div style={{ fontSize:22, fontWeight:700, marginTop:5, color:palette.text, letterSpacing:"-.01em" }}>{label}</div>
            <div className="mono" style={{ fontSize:9, color:palette.subtext, marginTop:3, letterSpacing:".18em" }}>{dates}</div>
          </div>
          {active && (
            <span className="mono" style={{ padding:"3px 8px", border:`1px solid ${accent}55`, background:`${accent}10`, borderRadius:3, fontSize:9, color:accent, letterSpacing:".22em" }}>● LIVE</span>
          )}
        </div>

        <div style={{ fontSize:11, color:palette.subtext, lineHeight:1.5 }}>{message}</div>

        <div style={{ marginTop:"auto" }}>
          <div className="mono" style={{ fontSize:8, color:palette.subtext, letterSpacing:".22em", marginBottom:6 }}>ATMOSPHERIC EFFECTS</div>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            {palette.features.map((f, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:7, fontSize:10, color:palette.subtext, fontFamily:"var(--ff-mono)", letterSpacing:".06em" }}>
                <span style={{ width:4, height:4, borderRadius:4, background:accent, boxShadow:`0 0 4px ${accent}` }}/>
                {f}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding:"9px 11px", border:`1px solid ${accent}33`, background:palette.cardBg, borderRadius:8 }}>
          <div className="mono" style={{ fontSize:8, color:palette.subtext, letterSpacing:".22em" }}>SEASONAL RITUAL</div>
          <div style={{ fontSize:11, fontWeight:500, color:palette.text, marginTop:3 }}>{ritual}</div>
        </div>
      </div>
    </div>
  );
}

function ScreenSeasonAtlas() {
  return (
    <div className="scr" style={{ display:"flex" }}>
      <SideNav active="dashboard"/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
        <TopBar title="Season Atlas · Four Worlds" crumb="ENVIRONMENT / SEASON" clock="20:14:08" energy={62}/>

        <div className="scrollY" style={{ flex:1, padding:"22px 26px", display:"grid", gridTemplateColumns:"1fr", gap:18 }}>

          {/* INTRO */}
          <section className="panel" style={{ padding:18 }}>
            <PanelHead
              eyebrow="◇ SEASONAL ATMOSPHERE"
              title="The same OS, four climates."
              right={<StateChip label="CURRENT · SPRING · D41" state="growing"/>}/>
            <div style={{ fontSize:12, color:"var(--text-md)", maxWidth:780, lineHeight:1.55 }}>
              The system adopts the season around you. Color temperature, particle behaviour, ambient sound, and ritual prompts all shift. Spring blooms, summer burns, autumn reflects, winter quiets. Subtle. Not theatrical.
            </div>
          </section>

          {/* 4 SEASONS */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
            <SeasonCard
              season="spring"
              label="Spring"
              dates="20.MAR — 20.JUN"
              accent="#7ad99a"
              active
              particles={{ count:24, shape:"petal", color:"#c4e8a0" }}
              ritual="Plant a 90-day arc"
              message="Renewal. Subtle bloom particles drift across the HUD. Soft greens infuse the palette."
              palette={{
                bg:"linear-gradient(180deg, #0e1410, #08100a)",
                border:"rgba(122,217,154,.22)",
                text:"#fff",
                subtext:"#a8c8a8",
                cardBg:"rgba(122,217,154,.06)",
                time:"morning",
                features:["SOFT GREENS · +6%", "BLOOM PARTICLES · SUBTLE", "MORNING BIRDSONG · AMBIENT", "RENEWAL AURA TINT"]
              }}
            />
            <SeasonCard
              season="summer"
              label="Summer"
              dates="21.JUN — 21.SEP"
              accent="#f5c451"
              particles={{ count:14, shape:"glow", color:"#fff0c0" }}
              ritual="Peak intensity protocol"
              message="Vibrant energy. Stronger glow. Brighter contrast. The HUD feels open and active."
              palette={{
                bg:"linear-gradient(180deg, #14120a, #0c0a06)",
                border:"rgba(245,196,81,.22)",
                text:"#fff",
                subtext:"#e0c890",
                cardBg:"rgba(245,196,81,.06)",
                time:"noon",
                features:["VIBRANT GOLD GLOW · +10%", "BRIGHTER LIGHTING", "STRONGER MOTION", "ACTIVE PARTICLES"]
              }}
            />
            <SeasonCard
              season="autumn"
              label="Autumn"
              dates="22.SEP — 20.DEC"
              accent="#e08a4a"
              particles={{ count:28, shape:"leaf", color:"#e08a4a" }}
              ritual="Review · what stays · what falls"
              message="Reflective mood. Amber gradients. Falling leaf particles. Calm cinematic transitions."
              palette={{
                bg:"linear-gradient(180deg, #14100a, #0c0806)",
                border:"rgba(224,138,74,.22)",
                text:"#fff",
                subtext:"#d8a888",
                cardBg:"rgba(224,138,74,.06)",
                time:"evening",
                features:["AMBER · ORANGE GRADIENTS", "FALLING LEAVES · SUBTLE", "REFLECTIVE EVENING TONE", "SLOWER TRANSITIONS"]
              }}
            />
            <SeasonCard
              season="winter"
              label="Winter"
              dates="21.DEC — 19.MAR"
              accent="#7cc4ff"
              particles={{ count:32, shape:"snow", color:"#cce4f5" }}
              ritual="Sleep lock · monk mode"
              message="Cold blue tones. Minimal clean atmosphere. Snow particles. Serene ambient."
              palette={{
                bg:"linear-gradient(180deg, #08101a, #050810)",
                border:"rgba(124,196,255,.22)",
                text:"#fff",
                subtext:"#a0bcd8",
                cardBg:"rgba(124,196,255,.06)",
                time:"night",
                features:["COLD BLUE TONES", "FROST PARTICLES · DRIFT", "MINIMAL CLEAN ATMOSPHERE", "SERENE AMBIENT TRACK"]
              }}
            />
          </div>

          {/* SEASONAL ARC TIMELINE */}
          <section className="panel" style={{ padding:18 }}>
            <PanelHead eyebrow="◐ ANNUAL ARC · 2026" title="Your year as a season cycle"
              right={<span className="mono" style={{ fontSize:10, color:"var(--text-lo)" }}>SOLAR ORBIT · 365.25d</span>}/>
            <svg viewBox="0 0 1100 90" width="100%" height="90" style={{ display:"block" }}>
              <defs>
                <linearGradient id="season-band" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="#7cc4ff"/>
                  <stop offset="22%"  stopColor="#7ad99a"/>
                  <stop offset="50%"  stopColor="#f5c451"/>
                  <stop offset="74%"  stopColor="#e08a4a"/>
                  <stop offset="100%" stopColor="#7cc4ff"/>
                </linearGradient>
              </defs>
              <rect x="20" y="30" width="1060" height="22" rx="11" fill="url(#season-band)" opacity=".75"/>

              {/* season tick markers */}
              {[
                { t:0,    l:"20.MAR · EQUINOX", c:"#7ad99a", a:"start" },
                { t:.25,  l:"21.JUN · SOLSTICE", c:"#f5c451", a:"middle" },
                { t:.5,   l:"22.SEP · EQUINOX", c:"#e08a4a", a:"middle" },
                { t:.75,  l:"21.DEC · SOLSTICE", c:"#7cc4ff", a:"middle" },
                { t:1,    l:"20.MAR.27", c:"#7ad99a", a:"end" }
              ].map((m, i) => {
                const x = 20 + m.t*1060;
                return (
                  <g key={i}>
                    <line x1={x} y1="20" x2={x} y2="62" stroke={m.c} strokeOpacity=".7" strokeDasharray="2 3"/>
                    <text x={x} y={i%2===0?16:80} textAnchor={m.a === "start" ? "start" : m.a === "end" ? "end" : "middle"} style={{ fontFamily:"var(--ff-mono)", fontSize:9, fill:m.c, letterSpacing:".18em" }}>{m.l}</text>
                  </g>
                );
              })}

              {/* current moment */}
              {(() => {
                // May 26 ≈ day 145 of solar year; spring started Mar 20 ≈ day 79
                // through annual band: 145/365 ≈ 0.397
                const t = (145/365);
                const x = 20 + t*1060;
                return (
                  <g>
                    <line x1={x} y1="22" x2={x} y2="60" stroke="#fff" strokeWidth="2"/>
                    <circle cx={x} cy="22" r="5" fill="#fff" style={{ filter:"drop-shadow(0 0 8px #fff)" }}/>
                  </g>
                );
              })()}
            </svg>
            <div className="mono" style={{ fontSize:10, color:"var(--text-lo)", marginTop:8 }}>
              Currently 41 days into Spring · 51 days until Summer · 270 days until Winter arrives.
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   5 — WORLD LIBRARY · selectable background environments
   ════════════════════════════════════════════════════════ */

function WorldCard({ id, name, rankNeeded, current=false, locked=false, accent, palette, scene }) {
  return (
    <div style={{
      position:"relative", borderRadius:14, overflow:"hidden",
      background: palette.bg,
      border: `1px solid ${current ? accent+"55" : locked ? "var(--hl)" : palette.border}`,
      boxShadow: current ? `0 0 0 1px ${accent}33, 0 0 26px -10px ${accent}aa` : "none",
      opacity: locked ? 0.55 : 1,
      height: 320, display:"flex", flexDirection:"column"
    }}>
      <Brackets color={(current ? accent : palette.border)+"66"} inset={6}/>

      {/* scene */}
      <div style={{ height:170, position:"relative", overflow:"hidden", borderBottom:`1px solid ${palette.border}` }}>
        {scene}
        <div style={{ position:"absolute", left:12, top:10, display:"flex", gap:6 }}>
          <span className="mono" style={{ padding:"3px 7px", borderRadius:3, background:"rgba(0,0,0,.5)", border:`1px solid ${accent}66`, fontSize:9, color:accent, letterSpacing:".18em" }}>
            {id}
          </span>
          {current && <span className="mono" style={{ padding:"3px 7px", borderRadius:3, background:"rgba(0,0,0,.5)", border:`1px solid ${accent}66`, fontSize:9, color:accent, letterSpacing:".18em" }}>● ACTIVE</span>}
          {locked && <span className="mono" style={{ padding:"3px 7px", borderRadius:3, background:"rgba(0,0,0,.5)", border:"1px solid rgba(255,255,255,.2)", fontSize:9, color:"rgba(255,255,255,.6)", letterSpacing:".18em" }}>🔒 LOCKED</span>}
        </div>
      </div>

      <div style={{ padding:14, flex:1, display:"flex", flexDirection:"column" }}>
        <div style={{ fontSize:17, fontWeight:700, color: locked ? "var(--text-md)" : "var(--text-hi)" }}>{name}</div>
        <div className="mono" style={{ fontSize:9, color:"var(--text-dim)", marginTop:4, letterSpacing:".14em" }}>
          {locked ? `UNLOCK · ${rankNeeded}` : `RANK · ${rankNeeded}`}
        </div>
        <div style={{ flex:1 }}/>
        <div className="mono" style={{ fontSize:9, color: current ? accent : "var(--text-lo)", letterSpacing:".18em", marginTop:8 }}>
          {current ? "◉ ACTIVE WORLD" : locked ? "○ ASCEND TO UNLOCK" : "→ TAP TO ACTIVATE"}
        </div>
      </div>
    </div>
  );
}

function ScreenWorldLibrary() {
  return (
    <div className="scr" style={{ display:"flex" }}>
      <SideNav active="dashboard"/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
        <TopBar title="World Library · Background Environments" crumb="ENVIRONMENT / WORLDS" clock="20:14:08" energy={62}/>

        <div className="scrollY" style={{ flex:1, padding:"22px 26px", display:"grid", gridTemplateColumns:"1fr", gap:18 }}>

          {/* INTRO */}
          <section className="panel" style={{ padding:18 }}>
            <PanelHead
              eyebrow="◯ WORLD STATE"
              title="Where your dashboard lives."
              right={<span className="mono" style={{ fontSize:10, color:"var(--c-blue-2)" }}>3 / 6 UNLOCKED · A-RANK</span>}/>
            <div style={{ fontSize:12, color:"var(--text-md)", maxWidth:780, lineHeight:1.55 }}>
              Background environments unlock as you ascend. Each world shifts the ambient — color temperature, particle density, music bed. Higher ranks open quieter, more cinematic spaces.
            </div>
          </section>

          {/* 6 WORLDS */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
            <WorldCard
              id="01"
              name="Neon Skyline"
              rankNeeded="C · default"
              accent="#7cc4ff"
              palette={{
                bg:"linear-gradient(180deg, #0a1320, #06080f)",
                border:"rgba(124,196,255,.22)"
              }}
              scene={
                <SkyScene width={320} height={170} time="night" season="spring" sunPos={1.1} moonPos={.6}/>
              }
            />
            <WorldCard
              id="02"
              name="Mountain Temple"
              rankNeeded="B · 50d streak"
              accent="#7ad99a"
              palette={{
                bg:"linear-gradient(180deg, #0a140f, #06100a)",
                border:"rgba(122,217,154,.22)"
              }}
              scene={
                <svg viewBox="0 0 320 170" width="100%" height="100%" style={{ display:"block" }}>
                  <defs>
                    <linearGradient id="temple-sky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3a4a6e"/>
                      <stop offset="60%" stopColor="#7a8aa0"/>
                      <stop offset="100%" stopColor="#a8c0a8"/>
                    </linearGradient>
                  </defs>
                  <rect width="320" height="170" fill="url(#temple-sky)"/>
                  <circle cx="240" cy="40" r="28" fill="#fff3c0" opacity=".8" style={{ filter:"drop-shadow(0 0 14px #fff3c0)" }}/>
                  {/* mountains */}
                  <path d="M 0 170 L 0 120 L 70 60 L 120 90 L 180 40 L 240 80 L 320 50 L 320 170 Z" fill="rgba(40,55,60,.85)"/>
                  <path d="M 0 170 L 0 140 L 60 100 L 130 130 L 200 100 L 280 130 L 320 110 L 320 170 Z" fill="rgba(20,30,30,.9)"/>
                  {/* temple silhouette */}
                  <g transform="translate(140 100)">
                    <path d="M 0 0 L 30 -20 L 60 0 L 60 50 L 0 50 Z" fill="#0a0a0a"/>
                    <rect x="22" y="20" width="16" height="30" fill="#e08a4a" opacity=".6"/>
                  </g>
                </svg>
              }
            />
            <WorldCard
              id="03"
              name="Cyberpunk Observatory"
              rankNeeded="A · 100d streak"
              current
              accent="#b07cff"
              palette={{
                bg:"linear-gradient(180deg, #100a1a, #08060e)",
                border:"rgba(176,124,255,.32)"
              }}
              scene={
                <svg viewBox="0 0 320 170" width="100%" height="100%" style={{ display:"block" }}>
                  <defs>
                    <linearGradient id="obs-sky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0a0820"/>
                      <stop offset="60%" stopColor="#2a1a4a"/>
                      <stop offset="100%" stopColor="#1a0d2e"/>
                    </linearGradient>
                  </defs>
                  <rect width="320" height="170" fill="url(#obs-sky)"/>
                  {Array.from({length:40}).map((_, i) => (
                    <circle key={i} cx={(i*51)%320} cy={(i*37)%140} r={(i%6===0)?1.6:0.7} fill="#fff" opacity={((i*11)%50)/100 + 0.2}/>
                  ))}
                  {/* big planet */}
                  <circle cx="60" cy="50" r="22" fill="#b07cff" opacity=".7" style={{ filter:"drop-shadow(0 0 10px #b07cff)" }}/>
                  <ellipse cx="60" cy="50" rx="34" ry="6" fill="none" stroke="#b07cff" strokeOpacity=".55" strokeWidth="1.2"/>
                  {/* observatory dome */}
                  <g transform="translate(180 100)">
                    <path d="M 0 50 L 20 10 Q 50 -10 80 10 L 100 50 Z" fill="rgba(40,30,70,.9)"/>
                    <path d="M 20 10 Q 50 -10 80 10" fill="none" stroke="#b07cff" strokeWidth="1.2" opacity=".7"/>
                    <line x1="50" y1="-5" x2="80" y2="-30" stroke="#b07cff" strokeWidth="1.5" opacity=".8" style={{ filter:"drop-shadow(0 0 6px #b07cff)" }}/>
                    <rect x="0" y="50" width="100" height="20" fill="rgba(20,15,40,.95)"/>
                  </g>
                </svg>
              }
            />
            <WorldCard
              id="04"
              name="Floating Sanctuary"
              rankNeeded="S · 200d streak"
              locked
              accent="#5be7e0"
              palette={{
                bg:"linear-gradient(180deg, #061218, #04080c)",
                border:"rgba(91,231,224,.22)"
              }}
              scene={
                <svg viewBox="0 0 320 170" width="100%" height="100%" style={{ display:"block" }}>
                  <defs>
                    <linearGradient id="sanct-sky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0a2a3a"/>
                      <stop offset="100%" stopColor="#1a4a5a"/>
                    </linearGradient>
                  </defs>
                  <rect width="320" height="170" fill="url(#sanct-sky)"/>
                  {/* floating islands */}
                  <g transform="translate(40 60)">
                    <ellipse cx="40" cy="35" rx="44" ry="10" fill="rgba(10,15,20,.8)"/>
                    <path d="M 0 35 L 0 28 Q 40 18 80 28 L 80 35 Z" fill="#1a3a4a"/>
                    <path d="M 30 18 L 40 0 L 50 18 Z" fill="#0a1a25"/>
                  </g>
                  <g transform="translate(180 30)">
                    <ellipse cx="50" cy="40" rx="54" ry="12" fill="rgba(10,15,20,.8)"/>
                    <path d="M 0 40 L 0 32 Q 50 20 100 32 L 100 40 Z" fill="#1a3a4a"/>
                    <path d="M 40 18 L 50 -2 L 60 18 Z" fill="#0a1a25"/>
                    <circle cx="50" cy="14" r="2" fill="#5be7e0" style={{ filter:"drop-shadow(0 0 4px #5be7e0)" }}/>
                  </g>
                  <circle cx="270" cy="30" r="14" fill="#5be7e0" opacity=".4" style={{ filter:"drop-shadow(0 0 12px #5be7e0)" }}/>
                </svg>
              }
            />
            <WorldCard
              id="05"
              name="Digital Cosmos"
              rankNeeded="S+ · 300d streak"
              locked
              accent="#4ea1ff"
              palette={{
                bg:"linear-gradient(180deg, #02040a, #010207)",
                border:"rgba(78,161,255,.22)"
              }}
              scene={
                <svg viewBox="0 0 320 170" width="100%" height="100%" style={{ display:"block" }}>
                  <rect width="320" height="170" fill="#020410"/>
                  {/* grid floor */}
                  <g opacity=".3">
                    {Array.from({length:6}).map((_,i) => (
                      <line key={i} x1="0" y1={120 + i*8} x2="320" y2={120 + i*8} stroke="#4ea1ff" strokeWidth=".5"/>
                    ))}
                    {Array.from({length:12}).map((_,i) => (
                      <line key={i} x1={i*30 - 30} y1="170" x2={160} y2="120" stroke="#4ea1ff" strokeWidth=".5"/>
                    ))}
                  </g>
                  {/* cosmic nebula */}
                  <circle cx="160" cy="60" r="40" fill="#4ea1ff" opacity=".15"/>
                  <circle cx="160" cy="60" r="20" fill="#b07cff" opacity=".3"/>
                  <circle cx="160" cy="60" r="6" fill="#fff" style={{ filter:"drop-shadow(0 0 12px #fff)" }}/>
                  {/* particle stream */}
                  {Array.from({length:80}).map((_, i) => (
                    <circle key={i} cx={(i*47)%320} cy={(i*31)%100 + 10} r={(i%5===0)?1.4:0.7} fill="#fff" opacity={((i*9)%50)/100 + 0.2}/>
                  ))}
                </svg>
              }
            />
            <WorldCard
              id="06"
              name="Celestial Command"
              rankNeeded="LEGENDARY · 365d"
              locked
              accent="#f5c451"
              palette={{
                bg:"linear-gradient(180deg, #14100a, #08060a)",
                border:"rgba(245,196,81,.22)"
              }}
              scene={
                <svg viewBox="0 0 320 170" width="100%" height="100%" style={{ display:"block" }}>
                  <defs>
                    <radialGradient id="leg-bg" cx="50%" cy="60%" r="60%">
                      <stop offset="0%" stopColor="#3a2810" stopOpacity=".8"/>
                      <stop offset="100%" stopColor="#0a0608"/>
                    </radialGradient>
                  </defs>
                  <rect width="320" height="170" fill="url(#leg-bg)"/>
                  {/* command spire */}
                  <g transform="translate(160 0)">
                    <path d="M -3 170 L -3 30 L 0 0 L 3 30 L 3 170 Z" fill="#3a2810"/>
                    <circle cx="0" cy="20" r="6" fill="#f5c451" style={{ filter:"drop-shadow(0 0 14px #f5c451)" }}/>
                    {[40,70,100,130].map((y,i) => (
                      <rect key={i} x="-20" y={y} width="40" height="3" fill="#f5c451" opacity=".4"/>
                    ))}
                  </g>
                  {/* halo rings */}
                  {[40, 70, 100].map((r, i) => (
                    <circle key={i} cx="160" cy="20" r={r} fill="none" stroke="#f5c451" strokeOpacity=".15" strokeWidth="1"/>
                  ))}
                  {/* stars */}
                  {Array.from({length:50}).map((_, i) => (
                    <circle key={i} cx={(i*61)%320} cy={(i*43)%150} r={(i%5===0)?1.4:0.7} fill="#fff0c0" opacity={((i*9)%50)/100 + 0.15}/>
                  ))}
                </svg>
              }
            />
          </div>

          {/* ENVIRONMENTAL PROGRESSION */}
          <section className="panel" style={{ padding:18 }}>
            <PanelHead eyebrow="↗ ENVIRONMENTAL PROGRESSION" title="How the world unlocks alongside you"
              right={<span className="mono" style={{ fontSize:10, color:"var(--c-gold)" }}>RANK A · LV 24</span>}/>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:6 }}>
              {[
                { tier:"BEGINNER",   sub:"Minimal HUD · dim", lv:"LV 1-9",   done:true },
                { tier:"C-RANK",     sub:"Neon Skyline",      lv:"LV 10-19", done:true },
                { tier:"B-RANK",     sub:"Mountain Temple",   lv:"LV 20-29", done:true },
                { tier:"A-RANK",     sub:"Cyber Observatory", lv:"LV 30-49", active:true },
                { tier:"S-RANK",     sub:"Floating Sanctuary",lv:"LV 50-79", future:true },
                { tier:"LEGENDARY",  sub:"Celestial Command", lv:"LV 80+",   future:true }
              ].map((t, i) => (
                <div key={i} style={{
                  padding:"11px 11px 10px",
                  border: `1px solid ${t.active ? "var(--c-violet)" : "var(--hl)"}`,
                  background: t.active ? "rgba(176,124,255,.06)" : t.done ? "rgba(52,214,160,.04)" : "rgba(255,255,255,.015)",
                  borderRadius:8,
                  opacity: t.future ? 0.5 : 1
                }}>
                  <div className="mono" style={{ fontSize:9, color: t.active ? "var(--c-violet-2)" : t.done ? "var(--c-emerald)" : "var(--text-lo)", letterSpacing:".22em" }}>
                    {t.done ? "◉" : t.active ? "●" : "○"} {t.tier}
                  </div>
                  <div style={{ fontSize:11, color: t.active ? "var(--text-hi)" : "var(--text-md)", marginTop:5, fontWeight:500 }}>{t.sub}</div>
                  <div className="mono" style={{ fontSize:9, color:"var(--text-dim)", marginTop:3, letterSpacing:".12em" }}>{t.lv}</div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenLunarCodex, ScreenSeasonAtlas, ScreenWorldLibrary, SeasonCard, WorldCard });
