Run **Stage 5 (SHIP)** — generate deployment artifacts, consolidate documentation, run regression suite, compile final GO/NO-GO package.

WORKFLOW: ship (stage)
Stage: 5 (SHIP)
Human gate: YES — final GO / GO-WITH-CONDITIONS / NO-GO decision at the end.
Prerequisite: every story done AND security verdict CLEAR (from `/verify`).

---

## Step 1: Infrastructure
```powershell
$env:CLAUDE_AGENT = 'devops'
$env:CLAUDE_STORY_ID = $null
```
Invoke `devops`.

Reads `context/tech-stack.html` and `context/docker.html`. Writes directly to repo:
- `Dockerfile` (multi-stage, non-root)
- Deployment manifests (K8s / ECS / Cloud Run / Docker Compose — per target)
- CI/CD pipeline file (`.github/workflows/`, `.gitlab-ci.yml`, etc.)
- Health checks + readiness probes

Non-negotiables enforced by `devops` (will refuse otherwise): non-root containers, no hardcoded secrets, no `:latest` tags, health checks on every service.

## Step 2: Documentation consolidation
```powershell
$env:CLAUDE_AGENT = 'doc-writer'
```
Invoke `doc-writer` with scope=final.

Reads existing `docs/` and all per-story `doc_summary.html` files. Surgical edits only — polish README, finalize ADRs, integrate runbooks, finalize `docs/stories/index.html`. Asks user once which decisions_log entries should become ADRs.

## Step 3: Regression gate — run full test suite
```powershell
$env:CLAUDE_AGENT = 'qa'
```
Invoke `qa` REGRESSION.

Reads `tests/regression/suite.json`. Runs every registered story's test suite with HTML reporters. Generates:
- `.claude/memory/test-reports/regression-backend.html` — aggregate backend HTML report
- `.claude/memory/test-reports/regression-frontend.html` — aggregate frontend/E2E HTML report
- `.claude/memory/test-reports/regression-results.json` — verdict: **PASS** | **FAIL**

**If FAIL**:
Present failing stories and test details to user. **STOP — do not proceed to delivery**. Every failing test must be fixed and `/run-tests {story_id}` re-run until passing, then re-run `qa REGRESSION`. Only proceed when verdict = PASS.

## Step 4: Compile delivery package
```powershell
$env:CLAUDE_AGENT = 'auditor'
```
Invoke `auditor` DELIVERY.

Prerequisites checked by auditor (will refuse otherwise):
- Every story done
- `security/findings.json` verdict: CLEAR
- Every story has `review.html`
- `test-reports/regression-results.json` verdict: **PASS**

Writes `.claude/memory/delivery.html` with executive summary, story-by-story status (with links to individual test reports), regression test summary, code quality, and recommendation: **APPROVE** | **APPROVE WITH CONDITIONS** | **REJECT**.

## HUMAN GATE — Final GO/NO-GO
Present `.claude/memory/delivery.html` to user. Also surface links to:
- `test-reports/regression-backend.html`
- `test-reports/regression-frontend.html`
- `bugs/registry.html`

Decision:
- **APPROVE** → log to `.claude/memory/decisions/DEC-final-{timestamp}.html`. Pipeline complete.
- **APPROVE WITH CONDITIONS** → each condition becomes a real backlog story; append to plan.json + tracker INIT-add.
- **REJECT** → log feedback to decisions/. Pipeline stops. Address blockers and re-run from the affected stage.

---

## Outputs
- Infrastructure files in repo
- Updated `docs/` (README, API reference, ADRs, runbooks, story index)
- `.claude/memory/test-reports/regression-backend.html`
- `.claude/memory/test-reports/regression-frontend.html`
- `.claude/memory/test-reports/regression-results.json`
- `.claude/memory/delivery.html`
- `.claude/memory/decisions/DEC-final-{timestamp}.html` (decision logged)

## Success Criteria
- [ ] Dockerfile present (non-root, pinned image)
- [ ] Deployment manifests written
- [ ] CI/CD pipeline file present
- [ ] `regression-results.json` verdict: PASS
- [ ] `delivery.html` complete with explicit recommendation
- [ ] Human decision recorded
