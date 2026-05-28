Run **Stage 2 (DESIGN)** end-to-end — architecture, internal reviewer gate, per-story contract extraction.

WORKFLOW: design (stage)
Stage: 2 (DESIGN — both DESIGN and EXTRACT modes of the `architect` agent, gated internally by `auditor` REVIEW)
Human gate: NO — reviewer gate and CONTRACT_GAP loops are internal.
Prerequisite: `.claude/memory/plan.json` must exist.

Optional input: `story_id` — if provided, only re-extracts contracts for that story (skips full DESIGN).

---

## Pre-step: tag the hook
```powershell
$env:CLAUDE_AGENT = 'architect'
$env:CLAUDE_STORY_ID = $null   # set to story_id only if /design is invoked with one for targeted re-extract
```

## Step 1: DESIGN (skip if invoked with story_id)
Invoke `architect` in DESIGN mode.

Inputs (read by the agent from memory):
- `.claude/memory/plan.json`
- `.claude/memory/decisions/` + `.claude/memory/patterns/`
- `context/tech-stack.html` + `context/constraints.html` + `context/project-brief.html`

Outputs:
- `.claude/memory/architecture/system-design.yaml`
- `docs/architecture/hld.html` — HLD with Mermaid architecture, ER, flow, and sequence diagrams
- `docs/architecture/diagrams/hld.drawio` — draw.io XML component diagram
- `docs/architecture/flows/{flow}.html` — per-business-flow Mermaid diagrams

## Step 2: Design REVIEW (internal gate)
Switch hook attribution:
```powershell
$env:CLAUDE_AGENT = 'auditor'
```

Invoke `auditor` in REVIEW mode with type=Design and the system-design.yaml.

- **FAIL** → return findings to `architect` (set `$env:CLAUDE_AGENT='architect'` again) for targeted revision. Repeat until PASS.
- **PASS** → `auditor` writes `.claude/memory/architecture/design_review.html` with verdict PASS.

## Step 3: EXTRACT (per-story contracts)
Switch back:
```powershell
$env:CLAUDE_AGENT = 'architect'
```

Invoke `architect` in EXTRACT mode with `story_ids = 'all'` (or just the one if invoked with a story_id arg).

`architect` runs the self-resolving loop:
1. For each story, extract minimal contracts → `.claude/memory/stories/{story_id}/contracts.json`.
2. If a CONTRACT_GAP appears, switch internally to DESIGN mode for targeted amendment.
3. Re-EXTRACT for affected stories.
4. Repeat until contract_gaps is empty.

---

## Outputs
- `.claude/memory/architecture/system-design.yaml` (reviewer PASS)
- `.claude/memory/architecture/design_review.html`
- `.claude/memory/stories/{id}/contracts.json` (one per story)
- `docs/architecture/hld.html`
- `docs/architecture/diagrams/hld.drawio`
- `docs/architecture/flows/*.html`

## Success Criteria
- [ ] All stories have a contracts.json
- [ ] No unresolved contract_gaps
- [ ] Design verdict: PASS
- [ ] All API contracts include error response schemas
- [ ] hld.html exists with Mermaid architecture, ER, flow, and sequence diagrams
- [ ] hld.drawio exists and is valid draw.io XML

Next step: `/build` to start implementation.
