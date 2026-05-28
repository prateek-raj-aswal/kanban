Run the **full end-to-end SDLC pipeline** — all 5 stages with explicit human gates.

WORKFLOW: full-pipeline (top-level)
Human gates: **3 total**.

This command runs autonomously between gates. Use `/clarify`, `/design`, `/build`, `/verify`, `/ship` for individual stages with manual control.

---

## HUMAN GATE 1 — Alignment
Run `/clarify` (which runs INTERROGATE first, then PLAN after the user resolves open questions).
**Do not proceed until `.claude/memory/requirements.html` verdict = ALIGNED AND `.claude/memory/plan.json` is written AND the user has approved the plan.**

## Stage 2 — DESIGN
Run `/design`. Reviewer gate and CONTRACT_GAP loops are internal — no human pause.

## Stage 3 — BUILD (autonomous loop)
Run `/build` (no story_id — operates on all ready stories, up to 3 parallel).

Internally `/build`:
- Calls `tracker` NEXT to identify ready stories.
- Calls `/execute-story` per ready story (each runs the bounded TDD loop with 5-iteration cap → human escalation if hit).
- Loops until kanban shows `summary.todo == 0` AND `summary.in_progress == 0`.

If any `/execute-story` hits the 5-iteration cap, that's an **exception gate** — pause and surface to user.

## Stage 4 — VERIFY
Run `/verify` (no story_id — project-wide security scan).

## HUMAN GATE 2 — Security
If `.claude/memory/security/findings.json` verdict = **BLOCKED**, present critical findings.
**STOP. Do not proceed to /ship until every critical finding is resolved and `/verify` re-run shows CLEAR.**
If CLEAR, proceed automatically.

## Stage 5 — SHIP
Run `/ship`. Generates infra, consolidates docs, runs full regression suite (PASS required before delivery), compiles delivery package.

## HUMAN GATE 3 — Final GO/NO-GO
Present `.claude/memory/delivery.html`.
User decides: **APPROVE** | **APPROVE WITH CONDITIONS** | **REJECT**.
Decision is logged to `.claude/memory/decisions/DEC-final-{timestamp}.html`.

---

## Success Criteria
- [ ] Gate 1: plan approved
- [ ] All stories done (kanban summary)
- [ ] Gate 2: security CLEAR
- [ ] Infrastructure + docs + delivery package generated
- [ ] Gate 3: human decision recorded
