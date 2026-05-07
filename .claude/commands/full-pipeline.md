Run the full end-to-end SDLC pipeline.

WORKFLOW: full-pipeline
Human gates: 3 total (alignment, refactor choice, final go/no-go)

Everything between Gate 1 and Gate 3 is fully autonomous, bounded by Deep Module contracts.

---

## HUMAN GATE 1: Alignment
Run the `/idea-to-plan` workflow.
**Do not proceed until user approves the plan.**

## Step: System Architecture
Invoke `architect` with:
- full plan (PRD + all stories)
- context/constraints.md
- memory.decisions_log + memory.patterns

Output: HLD, LLD, API contracts, DB schema, event schemas (strict YAML/JSON)

## Step: Parse Contracts Per Story
Invoke `artifact-parser` for EACH story in the plan.
Each call: story + acceptance_criteria + architect output
Output: per-story minimal contracts (JSON), stored indexed by story_id

## Autonomous Execution Loop (max 20 iterations)
State before starting: total stories, current kanban state.

Repeat until kanban shows todo=0 AND in_progress=0:
1. Invoke `phase-orchestrator` with current kanban state → get next ready stories (no blocked dependencies)
2. Run `/execute-story` for up to 3 ready stories in parallel
3. Update kanban state after each story completes
4. Check: are all stories done? If yes, exit loop.

If loop reaches 20 iterations without clearing the board: escalate to human with current kanban state and blockers.

## HUMAN GATE 2: Architecture Review
Run the `/improve-architecture` workflow.
Present refactor options to user. **Wait for selection before proceeding.**

## Step: Deployment
Invoke `devops` with final code + system design + deployment requirements.
Output: Dockerfiles, K8s manifests, CI/CD pipeline, health checks

## HUMAN GATE 3: Final Review
Run the `/final-review` workflow.
**Await human decision: APPROVE | APPROVE WITH CONDITIONS | REJECT**
If REJECT: log feedback to memory.decisions_log. STOP.

## Step: Documentation (on APPROVE only)
Invoke `doc-writer` with final code + design + deployment config + memory.decisions_log.
Output: README, API docs, ADRs, runbooks

---

## Success Criteria
- [ ] Gate 1 passed: plan approved by user
- [ ] Architect output: all stories have parsed contracts
- [ ] All stories in kanban: done
- [ ] Gate 2 passed: architecture review completed
- [ ] Deployment config generated
- [ ] Gate 3 passed: human APPROVE received
- [ ] Documentation complete
