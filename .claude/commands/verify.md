Run **Stage 4 (VERIFY)** — project-wide audit. Security scan across the full codebase; optional final REVIEW pass.

WORKFLOW: verify (stage)
Stage: 4 (VERIFY)
Human gate: NO (but BLOCKED security verdict requires user to resolve before `/ship`).
Prerequisite: every story status=done in `.claude/memory/kanban.json`.

Optional input: `story_id` — if provided, runs only qa RETEST + auditor REVIEW for that one story (not the project-wide scan).

---

## Path A: project-wide (no story_id)

### Step 1: Security scan
```powershell
$env:CLAUDE_AGENT = 'auditor'
$env:CLAUDE_STORY_ID = $null
```
Invoke `auditor` SECURITY.
- Reads full codebase + deployment config (if `/ship` has run) + `.claude/memory/security/findings.json`.
- Writes `.claude/memory/security/findings.json` with verdict: **BLOCKED** | **CLEAR**.

### Step 2: If BLOCKED
Present critical findings to user. STOP. Every critical finding must be resolved before `/ship`. After fixing, re-run `/verify` (or `/security-scan` for the security portion only).

### Step 3: Final REVIEW (optional sweep)
If invoked standalone (not after `/build` which already runs per-story REVIEW), invoke `auditor` REVIEW with type=Code across the full codebase as a final sweep. Writes per-affected-story `review.html`.

---

## Path B: per-story (with story_id)
```powershell
$env:CLAUDE_AGENT = 'qa'
$env:CLAUDE_STORY_ID = '{story_id}'
```
Invoke `qa` RETEST for the story → `.claude/memory/stories/{id}/test_results.json` + `bugs.json`.

```powershell
$env:CLAUDE_AGENT = 'auditor'
```
Invoke `auditor` REVIEW (type=Code) for the story → `.claude/memory/stories/{id}/review.html`.

---

## Success Criteria
- [ ] (Path A) `.claude/memory/security/findings.json` exists with verdict CLEAR or every critical finding resolved
- [ ] (Path B) `test_results.json` shows `has_critical_bugs: false` AND `review.html` verdict: PASS

Next step (Path A): `/ship` once verdict is CLEAR. (Path B): re-run `/build {story_id}` if bugs found.
