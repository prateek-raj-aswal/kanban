/* app.jsx — design canvas composition */

function App() {
  const tweakDefaults = /*EDITMODE-BEGIN*/{
    "accent": "blue",
    "showGrain": true,
    "showScanlines": true,
    "displayFont": "Space Grotesk"
  }/*EDITMODE-END*/;
  const [t, setTweak] = useTweaks(tweakDefaults);

  // apply accent dynamically
  React.useEffect(() => {
    const root = document.documentElement;
    const accents = {
      blue:    ["#4ea1ff", "#b07cff"],
      violet:  ["#b07cff", "#4ea1ff"],
      emerald: ["#34d6a0", "#5be7e0"],
      crimson: ["#ff5a6e", "#f5c451"],
      gold:    ["#f5c451", "#ff5a6e"]
    };
    const [a,b] = accents[t.accent] || accents.blue;
    root.style.setProperty("--c-blue", a);
    root.style.setProperty("--c-violet", b);
  }, [t.accent]);

  React.useEffect(() => {
    document.body.classList.toggle("no-grain", !t.showGrain);
    document.body.classList.toggle("no-scan", !t.showScanlines);
  }, [t.showGrain, t.showScanlines]);

  return (
    <>
      <DesignCanvas title="Ascendant · Life Progression System" defaultZoom={.45}>

        <DCSection id="onboarding" title="01 · Onboarding" subtitle="Cinematic first-run · 12 calibration steps">
          <DCArtboard id="welcome" label="Welcome · Initialize" width={1440} height={900} data-screen-label="01 Welcome">
            <ScreenOnboardWelcome/>
          </DCArtboard>
          <DCArtboard id="class" label="Class Selection · Step 04" width={1440} height={900} data-screen-label="02 Class">
            <ScreenOnboardClass/>
          </DCArtboard>
          <DCArtboard id="onething" label="One Thing · Step 05" width={1440} height={900} data-screen-label="03 Keystone">
            <ScreenOnboardOneThing/>
          </DCArtboard>
        </DCSection>

        <DCSection id="core" title="02 · Core HUD" subtitle="Main system dashboard · daily quests · stat matrix">
          <DCArtboard id="dash" label="Dashboard · System HUD" width={1440} height={900} data-screen-label="04 Dashboard">
            <ScreenDashboard/>
          </DCArtboard>
          <DCArtboard id="quests" label="Daily Quests · Full Board" width={1440} height={900} data-screen-label="05 Quests">
            <ScreenQuests/>
          </DCArtboard>
        </DCSection>

        <DCSection id="progression" title="03 · Progression" subtitle="Life domains · skill tree · ascension paths">
          <DCArtboard id="domains" label="Life Domains · 8 Pillars" width={1440} height={900} data-screen-label="06 Domains">
            <ScreenDomains/>
          </DCArtboard>
          <DCArtboard id="tree" label="Skill Tree · Ascension Map" width={1440} height={900} data-screen-label="07 Skill Tree">
            <ScreenSkillTree/>
          </DCArtboard>
          <DCArtboard id="levelup" label="Level Up · Cinematic Moment" width={1440} height={900} data-screen-label="08 Level Up">
            <ScreenLevelUp/>
          </DCArtboard>
        </DCSection>

        <DCSection id="intelligence" title="04 · Intelligence" subtitle="Life analytics engine · Oracle AI coach · recovery">
          <DCArtboard id="analytics" label="Analytics · Life Intelligence" width={1440} height={900} data-screen-label="09 Analytics">
            <ScreenAnalytics/>
          </DCArtboard>
          <DCArtboard id="oracle" label="Oracle · AI Coach" width={1440} height={900} data-screen-label="10 Oracle">
            <ScreenOracle/>
          </DCArtboard>
          <DCArtboard id="recovery" label="Recovery · Energy Matrix" width={1440} height={900} data-screen-label="11 Recovery">
            <ScreenRecovery/>
          </DCArtboard>
        </DCSection>

        <DCSection id="mobile" title="05 · Mobile" subtitle="Companion app · Home, Stats, Oracle">
          <DCArtboard id="phones" label="Mobile · Companion (3-up)" width={1280} height={900} data-screen-label="12 Mobile">
            <ScreenMobile/>
          </DCArtboard>
        </DCSection>

        <DCSection id="evolution" title="06 · Evolution Engine" subtitle="System presence · narrative · forecasting · simulation">
          <DCArtboard id="states" label="System States · Reactive Skin (4-up)" width={1440} height={900} data-screen-label="13 States">
            <ScreenSystemStates/>
          </DCArtboard>
          <DCArtboard id="sync" label="System Sync · Internal Resonance" width={1440} height={900} data-screen-label="14 Sync">
            <ScreenSystemSync/>
          </DCArtboard>
          <DCArtboard id="network" label="Skill Network · Synergy Engine" width={1440} height={900} data-screen-label="15 Network">
            <ScreenSkillNetwork/>
          </DCArtboard>
          <DCArtboard id="identity" label="Identity Drift · Class Evolution" width={1440} height={900} data-screen-label="16 Identity">
            <ScreenIdentityDrift/>
          </DCArtboard>
          <DCArtboard id="shadow" label="Shadow · Entropy Index" width={1440} height={900} data-screen-label="17 Shadow">
            <ScreenShadowIndex/>
          </DCArtboard>
          <DCArtboard id="arc" label="Narrative Arc · Season 03" width={1440} height={900} data-screen-label="18 Arc">
            <ScreenNarrativeArc/>
          </DCArtboard>
          <DCArtboard id="forecast" label="Forecast · System Projection" width={1440} height={900} data-screen-label="19 Forecast">
            <ScreenForecast/>
          </DCArtboard>
          <DCArtboard id="sim" label="Life Build · Future Simulator" width={1440} height={900} data-screen-label="20 Sim">
            <ScreenLifeSim/>
          </DCArtboard>
        </DCSection>

        <DCSection id="celestial" title="07 · Celestial Environment" subtitle="Real-time sky · moon · seasons · living worlds">
          <DCArtboard id="atrium" label="Celestial Atrium · World State" width={1440} height={900} data-screen-label="21 Atrium">
            <ScreenCelestialAtrium/>
          </DCArtboard>
          <DCArtboard id="daycycle" label="Day Cycle · 5 States" width={1440} height={900} data-screen-label="22 Day Cycle">
            <ScreenDayCycle/>
          </DCArtboard>
          <DCArtboard id="lunar" label="Lunar Codex · Phase Calendar" width={1440} height={900} data-screen-label="23 Lunar">
            <ScreenLunarCodex/>
          </DCArtboard>
          <DCArtboard id="seasons" label="Season Atlas · Four Worlds" width={1440} height={900} data-screen-label="24 Seasons">
            <ScreenSeasonAtlas/>
          </DCArtboard>
          <DCArtboard id="worlds" label="World Library · Environments" width={1440} height={900} data-screen-label="25 Worlds">
            <ScreenWorldLibrary/>
          </DCArtboard>
        </DCSection>

      </DesignCanvas>

      <TweaksPanel title="System Calibration">
        <TweakSection label="Accent · Color core">
          <AccentSwatches value={t.accent} onChange={v => setTweak("accent", v)}/>
        </TweakSection>
        <TweakSection label="Cinematic FX">
          <TweakToggle label="Grain · CRT grid"  value={t.showGrain}     onChange={v => setTweak("showGrain", v)}/>
          <TweakToggle label="Scanlines · sweep" value={t.showScanlines} onChange={v => setTweak("showScanlines", v)}/>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

// AccentSwatches: hex palette pickers that store a name string
function AccentSwatches({ value, onChange }) {
  const options = [
    ["blue",    ["#4ea1ff","#b07cff"]],
    ["violet",  ["#b07cff","#4ea1ff"]],
    ["emerald", ["#34d6a0","#5be7e0"]],
    ["crimson", ["#ff5a6e","#f5c451"]],
    ["gold",    ["#f5c451","#ff5a6e"]],
  ];
  return (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap", padding:"4px 0 8px" }}>
      {options.map(([name, pair]) => {
        const sel = name === value;
        return (
          <button key={name} onClick={() => onChange(name)} title={name} style={{
            all:"unset", cursor:"pointer", width:36, height:36, borderRadius:8, position:"relative",
            background:`linear-gradient(135deg, ${pair[0]}, ${pair[1]})`,
            boxShadow: sel ? `0 0 0 2px #fff, 0 0 18px -4px ${pair[0]}` : "0 0 0 1px rgba(255,255,255,.18)"
          }}>
            {sel && <span style={{ position:"absolute", inset:0, display:"grid", placeItems:"center", color:"#06080f", fontSize:13, fontWeight:800 }}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
