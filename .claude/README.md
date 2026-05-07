# .claude — Sub-Agents & Skills Reference

This directory contains Claude Code native sub-agents and slash command skills for the Antigravity SDLC pipeline.

- **`agents/`** — 15 specialized sub-agents with bounded system prompts
- **`commands/`** — 5 workflow skills invocable as `/command-name`

All agents embed the 4 Karpathy operating rules (from `CLAUDE.md`):
> Think (ask before guessing) · Simplify (minimum output) · Scope (bounded context) · Verify (explicit success criteria)

---

## Sub-Agents

### Core — Primary Builders (5)

| Agent | File | Purpose | Key Constraint |
|---|---|---|---|
| `grill-me` | `agents/grill-me.md` | Adversarial alignment — surfaces ambiguity before any planning | Emits ALIGNED / NEEDS_CLARIFICATION / REJECT. No PRD, no plan, ever. |
| `planner` | `agents/planner.md` | Full backlog upfront: PRD + all phases + all stories | Asks execution mode first (agent / human / both) — story sizing depends on it. Vertical slices only. |
| `architect` | `agents/architect.md` | Full system design in one pass: interfaces, API contracts, DB schema, events | Output MUST be reviewed by `reviewer` before `artifact-parser` or `doc-writer` consume it. Targeted amendment only on CONTRACT_GAP. |
| `backend` | `agents/backend.md` | Backend implementation per parsed contracts; runs unit tests via Bash | Reads `context/tech-stack.md` for framework. Returns `CONTRACT_INCOMPLETE` if inputs are missing. Never creates new APIs. |
| `frontend` | `agents/frontend.md` | UI implementation per parsed contracts; always includes routing | Reads `context/tech-stack.md`, defaults to Next.js. State management only if required by tech-stack or story. No invented endpoints. |

### Orchestration — Flow Control & Tracking (3)

| Agent | File | Purpose | Key Constraint |
|---|---|---|---|
| `phase-orchestrator` | `agents/phase-orchestrator.md` | Dynamic per-iteration: returns only stories ready to execute right now | A story is ready only when ALL its dependencies have kanban status "done". Detects DEADLOCK. No static full plan. |
| `kanban` | `agents/kanban.md` | Story tracking — persists board to `runs/kanban.json` | State machine: todo → in_progress → done only. Every INIT/MOVE writes to file. STATUS reads from file. |
| `artifact-parser` | `agents/artifact-parser.md` | Batch-processes all stories against reviewed architect output | Precondition: architecture must have passed `reviewer`. Raises CONTRACT_GAP (never silently omits) → loops back to architect. |

### Governance — Quality Gates & Validation (4)

| Agent | File | Purpose | Key Constraint |
|---|---|---|---|
| `grill-me` | `agents/grill-me.md` | Pre-planning interrogation | No plan until ALIGNED. |
| `reviewer` | `agents/reviewer.md` | Code + Test review for Deep Modules and bounded context | **Code and Test only** — Design artifacts require human involvement. FAIL is a soft signal; orchestrator decides response. |
| `human-review` | `agents/human-review.md` | Compiles delivery package for human GO/NO-GO | REJECT includes specific remediation steps. APPROVE WITH CONDITIONS creates real backlog stories — not notes. |
| `security` | `agents/security.md` | Full-codebase STRIDE + OWASP scan, runs once at pipeline end | Critical findings = BLOCKED (hard block before human-review). Non-critical → appended to `memory/security_findings`. |

### Domain — Specialists (4)

| Agent | File | Purpose | Key Constraint |
|---|---|---|---|
| `qa` | `agents/qa.md` | TDD loop driver: PLAN writes executable test code; RETEST executes via Bash | Framework from `tech-stack.md`. RETEST runs tests — never predicts from reading code. Failing test = critical bug. |
| `database` | `agents/database.md` | Raw SQL migration generator, scoped to current story | Reads existing migrations to version correctly. Every migration has a DOWN. DB engine from `tech-stack.md`. |
| `devops` | `agents/devops.md` | Infrastructure-as-code + CI/CD; writes files directly to repo | Reads `tech-stack.md` for deployment target (K8s, ECS, Cloud Run, etc.). No root containers. No hardcoded secrets. |
| `doc-writer` | `agents/doc-writer.md` | Incremental docs after each story; ADRs only on user selection | Reads existing docs first, surgical edits only. User selects which `decisions_log` entries become ADRs. |

---

## Skills (Slash Commands)

Invoke as `/skill-name` in Claude Code.

| Command | File | Workflow | Human Gates | Agents Invoked |
|---|---|---|---|---|
| `/idea-to-plan` | `commands/idea-to-plan.md` | Alignment → PRD → Kanban INIT → Execution Plan | **1** (alignment resolution) | grill-me, planner, kanban, phase-orchestrator |
| `/execute-story` | `commands/execute-story.md` | TDD loop for a single story (autonomous) | **0** (escalates to human only on 5-iteration failure) | kanban, qa, database, backend, frontend, reviewer |
| `/full-pipeline` | `commands/full-pipeline.md` | End-to-end SDLC | **3** (alignment · refactor choice · final go/no-go) | All 15 agents |
| `/improve-architecture` | `commands/improve-architecture.md` | Codebase audit + refactor option selection | **1** (refactor option selection) | architect |
| `/final-review` | `commands/final-review.md` | Standalone human GO/NO-GO gate | **1** (final go/no-go) | human-review |

---

## Invocation Guide

### Invoking a skill
```
/idea-to-plan
/execute-story
/full-pipeline
/improve-architecture
/final-review
```

### Delegating to a sub-agent directly
```
Use the grill-me agent to interrogate this idea: [idea]
Use the kanban agent: STATUS
Use the kanban agent: MOVE story_id: US-001 from: todo to: in_progress
Use the reviewer agent to review this code (type: Code): [code]
Use the doc-writer agent to update docs for story US-003
```

### Typical workflow sequence
```
/idea-to-plan          → plan_final + runs/kanban.json initialized + execution_plan
                          ↓ (human gate: alignment resolved)
/full-pipeline         → architect → [reviewer gate] → artifact-parser
                          → /execute-story × N (dependency-ordered, max 3 parallel)
                          → security scan → [BLOCKED? resolve. CLEAR? continue]
                          → /improve-architecture → [human gate: refactor choice]
                          → devops (writes infra files)
                          → /final-review → [human gate: GO/NO-GO]
                          → doc-writer (incremental, per story already done)
/improve-architecture  → runs against delivered codebase (can run standalone anytime)
```

---

## Agent Communication Map

```
idea-to-plan workflow:
  grill-me
    → [HUMAN GATE: resolve open questions]
    → planner (asks: agent / human / both execution mode → sizes stories)
    → kanban INIT (writes all stories to runs/kanban.json as "todo")
    → phase-orchestrator (first iteration: identify initial ready stories)

execute-story workflow (per story, autonomous):
  kanban MOVE (todo → in_progress, writes runs/kanban.json)
    → qa PLAN             [writes executable test code before any implementation]
    → database            [reads existing migrations, generates raw SQL]
    → backend + frontend  [parallel; both read tech-stack.md; backend runs unit tests via Bash]
    ↓
    TDD Loop (max 5 iterations):
      qa RETEST           [executes tests via Bash — actual results, not predictions]
      reviewer            [Code + Test only; FAIL = soft signal to orchestrator]
      backend / frontend  [fix bugs and contract violations]
      ↑ repeat until: no critical bugs + all AC met + contracts compliant
    ↓
    [if 5 iterations fail → reviewer failure analysis → human-review ESCALATION]
    ↓
    reviewer              [final Deep Modules check]
    kanban MOVE           (in_progress → done, writes runs/kanban.json)
    doc-writer            [incremental update; user selects ADR-worthy decisions]

full-pipeline workflow:
  /idea-to-plan → [HUMAN GATE 1: alignment]
    → architect           [full system design, one pass, YAML/JSON only]
    → reviewer            [Design gate — FAIL requires architect revision before proceeding]
    → artifact-parser     [batch: all stories; CONTRACT_GAP → back to architect for amendment]
    ↓
    Execution loop (dynamic, max 20 iterations):
      phase-orchestrator  [called each iteration: returns ready stories, detects DEADLOCK]
      /execute-story × N  [up to 3 parallel, only stories with all deps "done"]
      ↑ repeat until runs/kanban.json shows todo=0 and in_progress=0
    ↓
    security              [once: full codebase scan; BLOCKED = hard stop; CLEAR = proceed]
    /improve-architecture → [HUMAN GATE 2: refactor choice]
    devops                [reads tech-stack.md; writes Dockerfiles, manifests, CI/CD to repo]
    /final-review → [HUMAN GATE 3: GO/NO-GO]
      human-review        [REJECT → remediation steps; APPROVE WITH CONDITIONS → backlog stories]
    doc-writer            [consolidates any remaining doc gaps post-approval]
```

---

## State & Persistence

| What | Where | Written by | Read by |
|---|---|---|---|
| Kanban board | `runs/kanban.json` | kanban (every INIT/MOVE) | kanban (STATUS), phase-orchestrator |
| Architectural decisions | `memory/decisions_log` | planner, architect, devops, human-review | architect, backend, database, reviewer, devops, doc-writer |
| Code patterns | `memory/patterns` | (pre-populated) | backend, frontend |
| Bug history | `memory/bug_history` | qa (RETEST results) | — |
| Security findings | `memory/security_findings` | security | security (cross-run deduplication) |
| Migration files | `db/migrations/` | database | database (reads before generating to version correctly) |
| Infra files | repo root (Dockerfile, etc.) | devops | — |
| Documentation | `docs/` | doc-writer | doc-writer (reads before editing) |

---

## Human Gate Summary

| Gate | Triggered by | What the human decides | Consequence of each path |
|---|---|---|---|
| **1. Alignment** | `/idea-to-plan` | Resolve grill-me's open questions | Unanswered → no plan generated |
| **2. Refactor Choice** | `/improve-architecture` | Select a refactor option or reject | Reject → decision logged, no refactor |
| **3. Final GO/NO-GO** | `/final-review` | APPROVE / APPROVE WITH CONDITIONS / REJECT | Conditions → new backlog stories; REJECT → remediation steps, pipeline stops |
| **Security BLOCKED** | `security` agent | Resolve critical security findings | Must fix and re-run security before human-review can proceed |
| **TDD Escalation** | `/execute-story` (5-iteration failure) | Unblock a stuck story | Human decides: fix design gap, split story, or override |
| **Design Change** | `reviewer` (when Design issue found) | Decide whether to change the architecture | Reviewer does not change Design — human or architect does, then reviewer re-checks Code |
