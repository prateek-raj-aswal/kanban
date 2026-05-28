Run the per-story TDD workflow for a single user story.

WORKFLOW: execute-story (per-story workflow, called by `/build` per story)
Human gate: ONLY on TDD 5-iteration escalation.

Required input: `story_id`.

---

## Pre-step: tag the hook
```powershell
$env:CLAUDE_STORY_ID = '{story_id}'
```

## Step 1: Move to in_progress
```powershell
$env:CLAUDE_AGENT = 'tracker'
```
Invoke `tracker` MOVE `{ story_id, from: 'todo', to: 'in_progress' }`.

## Step 2: Write tests first (TDD red)
```powershell
$env:CLAUDE_AGENT = 'qa'
```
Invoke `qa` PLAN with story_id.
Writes test files to repo + `.claude/memory/stories/{id}/test_plan.yaml`.

## Step 3: Initial implementation (parallel)
Invoke `backend` and `frontend` in parallel:
```powershell
$env:CLAUDE_AGENT = 'backend'    # for the backend call
# (set 'frontend' in its parallel context)
```
- `backend` reads contracts + test_plan, writes code + db/migrations + unit tests, runs unit tests via Bash, writes `build_log.json`.
- `frontend` reads contracts (api + ui), writes UI components + routing, verifies pages via WebFetch.

## Step 4: TDD loop (max 5 iterations)
Exit condition: `has_critical_bugs == false` AND all AC met AND no contract drift.

Each iteration:
1. `$env:CLAUDE_AGENT='qa'`; invoke `qa` RETEST → writes `test_results.json` + `bugs.json` + HTML reports + appends to `bugs/registry.html`.
2. If no critical bugs and AC met: proceed to Step 5.
3. `$env:CLAUDE_AGENT='auditor'`; invoke `auditor` REVIEW (type=Code) → writes `review.html`.
4. If REVIEW returns critical issues OR bugs exist:
   - `$env:CLAUDE_AGENT='backend'`; invoke `backend` to fix backend bugs/issues.
   - `$env:CLAUDE_AGENT='frontend'`; invoke `frontend` to fix frontend bugs.
5. Regression guard: no previously passing test may break.

**If 5 iterations elapse without exit**:
- `$env:CLAUDE_AGENT='auditor'`; invoke `auditor` REVIEW for failure analysis.
- **HUMAN ESCALATION** — present the situation to the user (current bugs, attempted fixes, suspected root cause). STOP. Do not mark story done until user resolves.

## Step 5: Final REVIEW
```powershell
$env:CLAUDE_AGENT = 'auditor'
```
Invoke `auditor` REVIEW once more on final code → final `review.html` verdict.

## Step 6: Move to done
```powershell
$env:CLAUDE_AGENT = 'tracker'
```
Invoke `tracker` MOVE `{ story_id, from: 'in_progress', to: 'done' }`.

## Step 7: Register passing tests into regression suite
```powershell
$env:CLAUDE_AGENT = 'qa'
```
Invoke `qa` REGISTER with story_id.

Reads `test_plan.yaml` + `test_results.json` (must show `has_critical_bugs: false`). Appends this story's test files and run commands to `tests/regression/suite.json`. These tests will run as part of the regression gate at `/ship`.

## Step 8: Incremental docs
```powershell
$env:CLAUDE_AGENT = 'doc-writer'
```
Invoke `doc-writer` with scope=story.

Writes/updates:
- `docs/api/{resource}.html` — full field-level API schema with all error codes
- `docs/README.html` — surgical update
- `docs/stories/index.html` — appends one row for this story (persistent)
- `.claude/memory/stories/{id}/doc_summary.html`

Asks user which new decisions_log entries should become ADRs.

---

## Success Criteria
- [ ] `test_results.json` shows `has_critical_bugs: false`
- [ ] All acceptance criteria met
- [ ] `review.html` verdict: PASS
- [ ] `test-reports/{story_id}-backend.html` generated
- [ ] `test-reports/{story_id}-frontend.html` generated (if frontend tests exist)
- [ ] `bugs/registry.html` updated
- [ ] `tests/regression/suite.json` updated with this story's tests
- [ ] kanban shows story status: done
- [ ] `docs/stories/index.html` has a row for this story
- [ ] `doc_summary.html` written
