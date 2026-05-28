Run **Stage 1 (CLARIFY)** end-to-end — alignment interrogation, then convert ALIGNED requirements into a delivery plan + initialized kanban.

WORKFLOW: clarify (stage)
Stage: 1 (CLARIFY — both INTERROGATE and PLAN)
Human gate: YES (resolve open questions between INTERROGATE and PLAN).

Required input: raw idea (if `.claude/memory/requirements.html` does not yet exist).

---

## Pre-step: tag the hook
```powershell
$env:CLAUDE_AGENT = 'clarify'
$env:CLAUDE_STORY_ID = $null
```

## Step 1: INTERROGATE (skip if requirements.html already ALIGNED)
If `.claude/memory/requirements.html` is missing OR its verdict ≠ ALIGNED:
- Invoke `clarify` in INTERROGATE mode (this is exactly what `/align` does).
- **HUMAN GATE**: present Assumptions + Open Questions; collect answers; do not proceed until verdict = ALIGNED.

## Step 2: PLAN
Invoke `clarify` in PLAN mode.

`clarify` will first ask the user:
> "Will these stories be executed by **agents**, **humans**, or **both**?"
Answer before proceeding — story sizing depends on it.

`clarify` then:
- Writes `.claude/memory/plan.json` (PRD + vertical phases + stories with GIVEN/WHEN/THEN AC + dependencies).
- Invokes the `tracker` agent INIT command with the story list → `tracker` writes `.claude/memory/kanban.json`.

Inside the `tracker` invocation, the hook sees `tracker` as the calling agent (the orchestrator preamble below resets CLAUDE_AGENT for the nested call):
```powershell
$env:CLAUDE_AGENT = 'tracker'
# tracker writes kanban.json
$env:CLAUDE_AGENT = 'clarify'   # restore
```

## Step 3: Surface ready stories
Set `$env:CLAUDE_AGENT='tracker'`; invoke `tracker` NEXT with the story list → returns initial ready stories.

---

## Outputs
- `.claude/memory/requirements.html` — verdict: ALIGNED
- `.claude/memory/plan.json` — PRD + phases + stories
- `.claude/memory/kanban.json` — all stories in "todo"
- Initial ready-story list (in chat output)

## Success Criteria
- [ ] Execution mode confirmed (agent / human / both)
- [ ] Every phase is a vertical slice (no "DB phase" / "API phase")
- [ ] Every story has GIVEN/WHEN/THEN AC and dependencies
- [ ] Kanban initialized with all stories in "todo"
- [ ] Initial ready stories identified

Next step: `/design` to produce system architecture.
