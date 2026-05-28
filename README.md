# SDLC Agent Pipeline — Starter Template

A reusable, version-controlled scaffold for running Claude Code SDLC pipelines on any new project.

What you get in one clone:
- **9 specialized agents** and **13 commands** organized around a **5-stage lifecycle** (CLARIFY → DESIGN → BUILD → VERIFY → SHIP)
- **Per-agent harnesses** with hard tool enforcement (via Claude Code's `tools:` frontmatter) + declarative scope contracts
- **File-based memory** with domain-shared + per-story namespaces for context-optimized agent invocations
- **Automatic audit logging** of every file mutation + per-job token usage via `PostToolUse` and `Stop` hooks
- **Project context system** (`context/`) — 4 HTML template files to fill once per project
- **All generated code isolated** in `codebase/` — separate from docs, tests, and agent config
- **Rich documentation generation** — HLD with draw.io XML + Mermaid diagrams, full API reference with sequence diagrams, UI flow docs
- **Regression gate at `/ship`** — every story's passing tests are registered and re-run before delivery is compiled

---

## Quick start

### 1. Clone the template
```bash
git clone https://github.com/prateek-raj-aswal/claude-developemnt-template.git my-new-project
cd my-new-project

# Get a fresh git history
rm -rf .git
git init
git add .
git commit -m "chore: initial scaffold from agent template"
```

### 2. Fill in the project context (required before running any pipeline stage)

Edit these files — agents will refuse to proceed if the tech stack is ambiguous:

| File | Purpose | Required? |
|---|---|---|
| `context/tech-stack.html` | Backend/frontend framework, DB, test runners, deployment target | **Required** |
| `context/project-brief.html` | Goals, personas, scale, NFRs, out-of-scope | Strongly recommended |
| `context/docker.html` | Docker Desktop compose services, ports, health checks, E2E test setup | Required if using Docker |
| `context/constraints.html` | Hard technical/security/dependency constraints the architect must respect | Recommended |

All context files are pre-filled with placeholder tables — replace the `(placeholder)` rows with your project's specifics.

### 3. (Optional) Pre-seed patterns and decisions

Copy templates and fill them in BEFORE running `/clarify` so agents converge on your conventions:

```powershell
# Add a code pattern agents should prefer
Copy-Item templates/pattern-template.html .claude/memory/patterns/error-handling.html

# Record a decision already made
Copy-Item templates/decision-template.html .claude/memory/decisions/DEC-001-monorepo-layout.html
```

Edit the copies. Agents read them on the next invocation — no rebuild step.

### 4. Open the project in Claude Code

### 5. Run the pipeline

**Autonomous (3 human gates only):**
```
/full-pipeline
```

**Deliberate, stage by stage:**
```
/clarify "I want to build X"     # Stage 1 — alignment + plan + kanban init
/design                           # Stage 2 — architecture + HLD + contracts
/build                            # Stage 3 — TDD per story (up to 3 parallel)
/verify                           # Stage 4 — project-wide security scan
/ship                             # Stage 5 — infra + regression gate + final docs + GO/NO-GO
```

**Surgical (one story at a time):**
```
/build US-003
/run-tests US-003
/review-code US-003
```

Check status anytime:
```
/board     # full kanban
/next      # what's unblocked right now
```

---

## What's inside

```
.
├── codebase/                      ← ALL generated code lives here
│   ├── {backend source tree}       ← written by `backend` agent
│   ├── {frontend source tree}      ← written by `frontend` agent
│   ├── db/migrations/              ← versioned SQL migrations
│   ├── Dockerfile / Dockerfile.*   ← written by `devops`
│   ├── docker-compose.yml          ← written by `devops`
│   └── {CI/CD + manifests}         ← written by `devops`
│
├── docs/                          ← ALL documentation lives here (HTML)
│   ├── architecture/
│   │   ├── hld.html                ← HLD with embedded Mermaid diagrams
│   │   ├── diagrams/hld.drawio     ← draw.io XML — open in diagrams.net
│   │   └── flows/{flow}.html       ← per-business-flow Mermaid flowcharts
│   ├── api/{resource}.html         ← full API reference + sequence diagrams per endpoint
│   ├── ui/{feature}.html           ← navigation flow + user journey + component tree
│   ├── adr/ADR-{N}-{slug}.html     ← Architecture Decision Records
│   ├── runbooks/{feature}.html     ← operational runbooks
│   └── stories/index.html          ← persistent story registry (all stories, all time)
│
├── tests/
│   └── regression/
│       └── suite.json              ← registry of all approved regression tests
│
├── context/                       ← edit per project — durable across runs
│   ├── tech-stack.html             ← frameworks, test runners, deployment target (REQUIRED)
│   ├── project-brief.html          ← goals, personas, scale, NFRs
│   ├── docker.html                 ← Docker Desktop local dev setup
│   └── constraints.html            ← hard constraints the architect must respect
│
├── .claude/
│   ├── agents/         (9 .md)     ← agent definitions (must stay .md for Claude Code discovery)
│   ├── commands/      (13 .md)     ← slash command definitions
│   ├── harnesses/      (9 .yaml)   ← per-agent scope contracts
│   ├── hooks/
│   │   ├── log-event.ps1           ← PostToolUse: logs every Write/Edit/Bash
│   │   └── log-usage.ps1           ← Stop: logs per-job token usage + context %
│   ├── memory/                     ← runtime state (mostly gitignored)
│   │   ├── architecture/           ← system-design.yaml, design_review.html
│   │   ├── bugs/registry.html      ← aggregate bug log across all stories
│   │   ├── test-reports/           ← per-story + regression HTML test reports
│   │   ├── stories/{id}/           ← per-story artifacts (NEVER garbage-collected)
│   │   ├── decisions/              ← committed: decision records
│   │   └── patterns/               ← committed: code patterns
│   ├── settings.json               ← hook config + tool permissions (committed)
│   ├── settings.local.json         ← per-developer permissions (gitignored)
│   └── README.html                 ← FULL SYSTEM REFERENCE
│
├── CLAUDE.md                      ← project-wide behavioral guidelines
├── README.md                      ← this file
├── .gitignore
└── .gitattributes
```

---

## The 5-stage lifecycle at a glance

| Stage | Command | Primary agent(s) | Output |
|---|---|---|---|
| 1. **CLARIFY** | `/clarify` | `clarify` (INTERROGATE → PLAN) | `requirements.html` + `plan.json` + `kanban.json` |
| 2. **DESIGN** | `/design` | `architect` (DESIGN → EXTRACT), `auditor` REVIEW gate | `system-design.yaml` + `hld.html` + `hld.drawio` + per-flow diagrams + per-story `contracts.json` |
| 3. **BUILD** | `/build` | `backend`, `frontend`, `qa`, `auditor` REVIEW, `doc-writer` | code in `codebase/` + HTML test reports + bug registry + story index + API/UI docs with diagrams |
| 4. **VERIFY** | `/verify` | `auditor` SECURITY | `security/findings.json` (BLOCKED / CLEAR) |
| 5. **SHIP** | `/ship` | `devops`, `doc-writer` (final), `qa` REGRESSION gate, `auditor` DELIVERY | infra in `codebase/` + regression HTML reports + `delivery.html` + human GO/NO-GO |

Cross-cutting at every stage: **`tracker`** — story state + dependency-aware scheduling.

For full architectural diagrams, per-agent reference, per-command reference, harness format, memory layout, and decision matrix → see **[`.claude/README.html`](./.claude/README.html)**.

---

## What each stage produces (detail)

### Stage 2 — DESIGN: HLD + Diagrams

After `/design` completes, `docs/architecture/` contains:

- **`hld.html`** — self-contained HTML (Mermaid CDN included) with:
  - System architecture graph (all components, protocols, data flows)
  - ER diagram (all tables, relationships)
  - Business flow flowcharts (one per major user journey)
  - Sequence diagram for every API endpoint (all hops: client → gateway → service → DB → async)
  - Deployment topology diagram
- **`diagrams/hld.drawio`** — draw.io XML component diagram with colour-coded swimlanes (services=blue, databases=red, cache=yellow, queues=purple, external=dashed). Open in [diagrams.net](https://app.diagrams.net) or the Draw.io VSCode extension.
- **`flows/{flow}.html`** — one file per business flow from the plan, with a detailed Mermaid flowchart including all decision branches and error paths.

### Stage 3 — BUILD: Per-story docs with diagrams

After each story completes, `doc-writer` produces:

- **`docs/api/{resource}.html`** — full field-level API reference. For every endpoint:
  - Request body table (field, type, required/optional, format/constraints, example)
  - Response tables for every status code (201, 400, 401, 403, 409, 422, 500)
  - Error code table listing every named validation rule and its trigger condition
  - **Mermaid sequence diagram** showing the full request path through the system
- **`docs/ui/{feature}.html`** — for every UI story:
  - Mermaid navigation flow (`flowchart LR`)
  - Mermaid user journey flowchart with decision points and error branches
  - Mermaid component tree
- **`docs/stories/index.html`** — append-only registry of every completed story with links to test reports and API docs

### Stage 3 — BUILD: Test reports and bug registry

After each `qa RETEST`:

- **`.claude/memory/test-reports/{story_id}-backend.html`** — HTML backend test report (Gradle surefire / pytest-html / jest-html-reporters)
- **`.claude/memory/test-reports/{story_id}-frontend.html`** — HTML frontend/E2E report (Playwright built-in HTML reporter / Cypress Mochawesome)
- **`.claude/memory/bugs/registry.html`** — persistent HTML bug registry, one row per bug across all stories. Status updates from `open` → `resolved` as bugs are fixed.

### Stage 5 — SHIP: Regression gate

Before `auditor DELIVERY` runs, `/ship` invokes **`qa REGRESSION`** which:
1. Reads `tests/regression/suite.json` (populated by `qa REGISTER` after each story completes)
2. Runs every registered story's test suite with HTML reporters
3. Generates aggregate reports: `regression-backend.html` + `regression-frontend.html`
4. Emits `regression-results.json` with verdict: **PASS** | **FAIL**

`auditor DELIVERY` refuses with `REGRESSION_BLOCKED` if verdict ≠ PASS. A single failing test blocks delivery.

---

## Per-project setup checklist

After cloning, walk through this list once:

- [ ] Fill `context/tech-stack.html` — every placeholder row
- [ ] Fill `context/project-brief.html` — at minimum: overview, goals, scale, out-of-scope
- [ ] Fill `context/docker.html` — compose service names, ports, health check URLs
- [ ] Fill `context/constraints.html` — hard technical/security constraints
- [ ] (Optional) Customize `CLAUDE.md` with project-specific behavioral rules
- [ ] (Optional) Pre-seed `.claude/memory/patterns/` with patterns agents should prefer
- [ ] (Optional) Pre-seed `.claude/memory/decisions/` with any decisions already made
- [ ] Reset git history: `rm -rf .git && git init`
- [ ] Open Claude Code in this directory and confirm slash commands appear (type `/`)
- [ ] Run `/clarify "your idea"` to kick off

---

## Verifying the setup

### Confirm the event hook is firing
```powershell
# Make any edit that triggers Write/Edit/Bash
# Then check:
Get-Content .claude/memory/events.jsonl -Tail 5
```
You should see JSONL lines with `"agent"`, `"tool"`, and `"path"` fields. If `agent` is `"UNKNOWN"`, check that `$env:CLAUDE_AGENT` is being set by command files.

### Confirm token usage logging
```powershell
Get-Content .claude/memory/events.jsonl |
  ForEach-Object { $_ | ConvertFrom-Json } |
  Where-Object   { $_.event -eq 'job_complete' } |
  Select-Object  ts, agent, @{n='total';e={$_.tokens.total}}, @{n='ctx%';e={$_.tokens.context_pct}} |
  Format-Table
```
Each completed agent turn logs `context` (total input tokens), `output` (tokens generated), `total`, `cache_read` (cheap cached tokens), and `context_pct` (context / total × 100 — typically 90–97 % for large agents).

---

## Commands reference

| Command | What it does |
|---|---|
| `/full-pipeline` | Run all 5 stages autonomously with 3 explicit human gates |
| `/execute-story {id}` | Per-story TDD loop (max 5 iters → human escalation) + REGISTER passing tests into regression suite |
| `/clarify [idea?]` | Stage 1 — INTERROGATE + PLAN; resolves ambiguity, generates backlog, inits kanban |
| `/design [story_id?]` | Stage 2 — architecture + HLD html + draw.io diagram + flow diagrams + per-story contracts |
| `/build [story_id?]` | Stage 3 — run `/execute-story` for ready stories (up to 3 parallel) |
| `/verify [story_id?]` | Stage 4 — project-wide security scan; or per-story retest + review |
| `/ship` | Stage 5 — devops + doc consolidation + regression gate + delivery package + GO/NO-GO |
| `/board` | Show full kanban state |
| `/next` | Show stories with all dependencies done (ready to execute); detects DEADLOCK |
| `/align` | Re-interrogate requirements without re-planning |
| `/run-tests {id}` | Re-execute tests for one story; generates HTML reports + updates bug registry |
| `/review-code {id} [type]` | Re-review code, tests, or design for one story |
| `/security-scan` | Re-run project-wide STRIDE + OWASP security scan |

---

## Agents reference

| Agent | Role | Modes |
|---|---|---|
| `tracker` | Story state + dependency-aware scheduling | INIT, MOVE, STATUS, NEXT |
| `clarify` | Stage 1 — adversarial alignment + delivery planning | INTERROGATE, PLAN |
| `architect` | Stage 2 — system design + HLD + draw.io + Mermaid diagrams + per-story contracts | DESIGN, EXTRACT |
| `backend` | Stage 3 — backend code in `codebase/` + SQL migrations + unit tests; runs tests via Bash | single |
| `frontend` | Stage 3 — UI components in `codebase/`; Playwright smoke test via Bash for browser verification | single |
| `qa` | TDD driver — write tests, execute with HTML reporters, register to regression suite, run full regression | PLAN, RETEST, REGISTER, REGRESSION |
| `auditor` | Code/Test/Design review + STRIDE+OWASP scan + final GO/NO-GO package | REVIEW, SECURITY, DELIVERY |
| `devops` | Stage 5 — Dockerfile + manifests + CI/CD + health checks in `codebase/`; reads `context/docker.html` | single |
| `doc-writer` | Per-story API + UI docs with Mermaid diagrams; persistent story index; ADRs on user selection | scope: story / final |

### Browser testing (qa + frontend)

Browser access is provided by **Playwright / Cypress via the `Bash` tool** — they download and manage their own Chromium/Firefox binaries and run headlessly. `WebFetch` is used only for HTTP health checks ("is the server up?"). The actual DOM interaction, JavaScript execution, and assertions happen inside a real browser process controlled by the test runner CLI.

---

## Audit logs

Two hooks write to `.claude/memory/events.jsonl`:

### Tool events (`log-event.ps1` — `PostToolUse`)
```jsonl
{"ts":"...","agent":"backend","story_id":"US-003","tool":"Write","path":"codebase/src/...","ok":true}
{"ts":"...","agent":"qa","story_id":"US-003","tool":"Bash","command":"npx playwright test ...","ok":true}
```

### Job completions (`log-usage.ps1` — `Stop`)
```jsonl
{
  "ts": "...", "event": "job_complete", "agent": "backend", "story_id": "US-003",
  "tokens": {
    "context": 42150, "output": 2840, "total": 44990,
    "input_new": 18200, "cache_new": 5400, "cache_read": 18550,
    "context_pct": 93.7
  }
}
```

Token fields: `context` = everything sent in (input + cache writes + cache reads), `output` = tokens generated, `context_pct` = context / total × 100. `cache_read` is served at ~0.1× price — high cache_read = efficient.

Query examples:
```powershell
# Token usage by agent
Get-Content .claude/memory/events.jsonl |
  ForEach-Object { $_ | ConvertFrom-Json } |
  Where-Object   { $_.event -eq 'job_complete' } |
  Group-Object   { $_.agent } |
  ForEach-Object { [PSCustomObject]@{ Agent=$_.Name; Jobs=$_.Group.Count;
    TotalTok=($_.Group | Measure-Object {$_.tokens.total} -Sum).Sum;
    AvgCtx=[Math]::Round(($_.Group | Measure-Object {$_.tokens.context_pct} -Average).Average,1) } } |
  Format-Table

# All bugs across the project
# Open .claude/memory/bugs/registry.html in a browser
```

---

## Versioning your project's curated knowledge

Memory subdirectories that **are** committed:
- **`.claude/memory/decisions/`** — decision records (become ADRs in `docs/adr/` when doc-writer runs)
- **`.claude/memory/patterns/`** — code patterns agents should prefer

Everything else under `.claude/memory/` is gitignored — regenerated per pipeline run.

---

## File format conventions

| File type | Format | Why |
|---|---|---|
| Agent definitions | `.md` | Required by Claude Code for agent discovery |
| Slash commands | `.md` | Required by Claude Code for command discovery |
| `CLAUDE.md` | `.md` | Required by Claude Code |
| Harnesses | `.yaml` | Machine-readable scope contracts |
| Memory + docs + context | `.html` | Supports embedded images, videos, diagrams (Mermaid), and rich tables |
| draw.io diagrams | `.drawio` | Native format for diagrams.net / Draw.io extension |
| Kanban + contracts + test results | `.json` | Machine-readable agent-to-agent handoffs |
| Migrations | `.sql` | Versioned UP + DOWN blocks |
| Audit log | `.jsonl` | Append-only, streamable |

---

## Updating the template

When the upstream template gets improvements, pull them into your project:

```bash
git remote add template https://github.com/prateek-raj-aswal/claude-developemnt-template.git
git fetch template
git merge template/v1.0.0 --allow-unrelated-histories -- .claude/
```

Resolve conflicts as you would any merge. Your `context/`, `codebase/`, and `docs/` are untouched.

---

## License

Add your license here (e.g., MIT, Apache-2.0). The template ships without one — adopt one before publishing.
