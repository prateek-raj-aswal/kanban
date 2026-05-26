# SDLC Agent Pipeline — Starter Template

A reusable, version-controlled scaffold for running Claude Code SDLC pipelines on any new project.

What you get in one clone:
- **9 specialized agents** and **13 commands** organized around a **5-stage lifecycle** (CLARIFY → DESIGN → BUILD → VERIFY → SHIP)
- **Per-agent harnesses** with hard tool enforcement (via Claude Code's `tools:` frontmatter) + declarative scope contracts
- **File-based memory** with domain-shared + per-story namespaces for context-optimized agent invocations
- **Automatic audit logging** of every file mutation via a `PostToolUse` hook
- **Project context system** (`context/`) for tech stack + constraints — edit per project, durable across runs
- **Templates** for decisions and patterns to curate before kicking off the pipeline

---

## Quick start

### 1. Clone the template
```bash
git clone <this-repo-url> my-new-project
cd my-new-project

# Optional: get a fresh git history
rm -rf .git
git init
git add .
git commit -m "chore: initial scaffold from agent template"
```

### 2. Fill in the project context
Edit these two files — agents refuse to run if tech stack is ambiguous:

- **`context/tech-stack.md`** — backend, frontend, DB, test frameworks, deployment target
- **`context/constraints.md`** — SLA targets, compliance, scale, deadlines, explicit non-goals (recommended)

### 3. (Optional) Pre-seed patterns and decisions
Copy templates and fill them in BEFORE running `/clarify` so the agents converge on your conventions:

```powershell
Copy-Item templates/pattern-template.md .claude/memory/patterns/error-handling.md
Copy-Item templates/decision-template.md .claude/memory/decisions/DEC-001-monorepo-layout.md
```

Edit the copies. Agents will read them on the next invocation — no rebuild step.

### 4. Open the project in Claude Code

### 5. Run the pipeline

**Autonomous (3 human gates only):**
```
/full-pipeline
```

**Or deliberate, stage by stage:**
```
/clarify "I want to build X"     # Stage 1 — alignment + plan + kanban init
/design                           # Stage 2 — architecture + per-story contracts
/build                            # Stage 3 — TDD per story (up to 3 parallel)
/verify                           # Stage 4 — project-wide security scan
/ship                             # Stage 5 — infra + final docs + GO/NO-GO
```

**Or surgical (one story at a time):**
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
├── .claude/                       ← Claude Code configuration root
│   ├── agents/         (9 files)   ← active agents
│   ├── commands/      (13 files)   ← active slash commands
│   ├── harnesses/      (9 files)   ← per-agent scope contracts (YAML)
│   ├── hooks/                      ← PostToolUse hook for audit logging
│   ├── memory/                     ← runtime state (mostly gitignored)
│   │   ├── decisions/              ← committed: ADR-worthy decisions
│   │   ├── patterns/               ← committed: code patterns
│   │   └── (everything else)       ← gitignored: regenerated per run
│   ├── settings.json               ← hook config (committed)
│   ├── settings.local.json         ← per-developer permissions (gitignored)
│   └── README.md                   ← FULL SYSTEM REFERENCE — read for deep understanding
├── context/                       ← project-specific config — edit per project
│   ├── tech-stack.md               ← framework + language + DB + deployment choices
│   ├── constraints.md              ← SLA, compliance, scale, deadlines, non-goals
│   └── README.md
├── templates/                     ← copy-and-fill templates
│   ├── decision-template.md
│   ├── pattern-template.md
│   └── README.md
├── db/migrations/                 ← output: SQL migrations (written by `backend`)
├── docs/                          ← output: README, API docs, ADRs, runbooks (written by `doc-writer`)
├── CLAUDE.md                      ← project-wide behavioral guidelines for Claude
├── README.md                      ← this file
├── .gitignore
└── .gitattributes
```

---

## The 5-stage lifecycle at a glance

| Stage | Command | Primary agent(s) | Output |
|---|---|---|---|
| 1. CLARIFY | `/clarify` | `clarify` (INTERROGATE → PLAN) | `requirements.md` + `plan.json` + `kanban.json` |
| 2. DESIGN | `/design` | `architect` (DESIGN → EXTRACT), `auditor` REVIEW gate | `system-design.yaml` + per-story `contracts.json` |
| 3. BUILD | `/build` | `backend`, `frontend`, `qa`, `auditor` REVIEW, `doc-writer` | repo code + migrations + tests + per-story `review.md` + `doc_summary.md` |
| 4. VERIFY | `/verify` | `auditor` SECURITY | `security/findings.json` (BLOCKED / CLEAR) |
| 5. SHIP | `/ship` | `devops`, `doc-writer` (final), `auditor` DELIVERY | infra files + final docs + `delivery.md` + human GO/NO-GO |

Cross-cutting at every stage: **`tracker`** — story state + dependency-aware scheduling.

For full architectural diagrams, per-agent reference, per-command reference, harness format, memory layout, and decision matrix → see **[`.claude/README.md`](./.claude/README.md)**.

---

## Per-project setup checklist

After cloning, walk through this list once:

- [ ] Edit `context/tech-stack.md` — fill every `(...)` placeholder
- [ ] Edit `context/constraints.md` — at minimum, set SLA, scale, regulatory, and out-of-scope sections
- [ ] (Optional) Customize `CLAUDE.md` with project-specific behavioral rules
- [ ] (Optional) Pre-seed `.claude/memory/patterns/` with patterns you want agents to prefer
- [ ] (Optional) Pre-seed `.claude/memory/decisions/` with any decisions already made
- [ ] Reset git history if starting fresh: `rm -rf .git && git init`
- [ ] Open Claude Code in this directory and confirm slash commands appear (type `/`)
- [ ] Run `/clarify "your idea"` to kick off

---

## Verifying the setup

After cloning, confirm the hook is wired correctly:

```powershell
# Make any small edit that triggers a Write/Edit tool
# Then check the log:
Get-Content .claude/memory/events.jsonl -Tail 5
```

You should see at least one JSONL line per mutation. If the file doesn't exist or `agent` is `UNKNOWN`, the hook isn't firing — check `.claude/settings.json` and that `pwsh.exe` / `powershell.exe` is on PATH.

---

## Commands reference (one-line summary)

| Command | What it does |
|---|---|
| `/full-pipeline` | Run all 5 stages autonomously with 3 explicit human gates |
| `/execute-story {id}` | Per-story TDD loop (max 5 iterations → human escalation) |
| `/clarify [idea?]` | Stage 1 — INTERROGATE + PLAN (resolves ambiguity, generates backlog, inits kanban) |
| `/design [story_id?]` | Stage 2 — full architecture + per-story contracts (reviewer-gated internally) |
| `/build [story_id?]` | Stage 3 — run `/execute-story` for ready stories (3 parallel) |
| `/verify [story_id?]` | Stage 4 — project-wide security scan (or per-story retest+review) |
| `/ship` | Stage 5 — devops + final docs + delivery package + GO/NO-GO |
| `/board` | Show kanban state |
| `/next` | Show stories with all dependencies done (ready to execute) |
| `/align` | Re-interrogate requirements without re-planning |
| `/run-tests {id}` | Re-execute tests for one story |
| `/review-code {id} [type]` | Re-review code or tests for one story |
| `/security-scan` | Re-run project-wide security scan |

For full details (when to use, sequence, args), see **[`.claude/README.md`](./.claude/README.md) §4**.

---

## Agents reference (one-line summary)

| Agent | Role |
|---|---|
| `tracker` | Story state + dependency-aware scheduling (INIT, MOVE, STATUS, NEXT) |
| `clarify` | Stage 1 — adversarial alignment (INTERROGATE) + delivery planning (PLAN) |
| `architect` | Stage 2 — system design (DESIGN) + per-story contract extraction (EXTRACT) |
| `backend` | Stage 3 — backend code + DB migrations + unit tests; runs tests via Bash |
| `frontend` | Stage 3 — UI components + routing + API integration |
| `qa` | TDD driver — write tests (PLAN) + execute and report (RETEST) |
| `auditor` | Code/Test/Design review (REVIEW) + STRIDE+OWASP scan (SECURITY) + GO/NO-GO package (DELIVERY) |
| `devops` | Stage 5 — Dockerfile + manifests + CI/CD + health checks (non-root, no hardcoded secrets, no `:latest`) |
| `doc-writer` | Per-story incremental docs + final consolidation; ADRs only on user selection |

For full details (modes, inputs/outputs, hard rules, when to use), see **[`.claude/README.md`](./.claude/README.md) §3**.

---

## Versioning your project's curated knowledge

Two memory subdirectories ARE committed to git:
- **`.claude/memory/decisions/`** — architectural / product decisions worth keeping (these become ADRs in `docs/adr/` when `doc-writer` runs)
- **`.claude/memory/patterns/`** — code patterns you want agents to prefer

Everything else under `.claude/memory/` (`kanban.json`, `requirements.md`, `plan.json`, `architecture/`, `stories/`, `security/`, `events.jsonl`) is gitignored — regenerated per pipeline run.

---

## Updating the template

When the template upstream gets improvements, pull them into your project:

```bash
# Add the template as a remote if you haven't
git remote add template <template-repo-url>

# Fetch latest
git fetch template

# Merge only the .claude/ subtree (avoid clobbering context/)
git merge template/main --allow-unrelated-histories -- .claude/
```

Resolve conflicts as you would any merge. Your `context/` and your project code are untouched.

---

## License

Add your license here (e.g., MIT, Apache-2.0). The template ships without one — adopt one before publishing.
