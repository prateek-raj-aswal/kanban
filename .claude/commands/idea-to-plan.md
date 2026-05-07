Run the idea-to-plan workflow.

WORKFLOW: idea-to-plan
Human gate: YES (alignment resolution — mandatory before any planning)

---

## Step 1: Alignment Interrogation
Invoke the `grill-me` sub-agent with the raw idea and user context.

Wait for verdict:
- **NEEDS_CLARIFICATION** → present open questions to user. STOP. Do not proceed until resolved.
- **REJECT** → explain why to user. STOP.
- **ALIGNED** → proceed to Human Gate.

## HUMAN GATE — Resolve Ambiguity
Present grill-me's assumptions list and open questions to the user.
Collect answers. Update the clarified requirements.
**Do not proceed until the user explicitly confirms all questions are resolved.**
This gate is mandatory and cannot be bypassed.

## Step 2: Generate Delivery Plan
Invoke the `planner` sub-agent with:
- Clarified requirements (grill-me output + user answers)
- context/constraints.md contents
- memory.decisions_log (if available)

Outputs: PRD + vertical phases + user stories with acceptance criteria

## Step 3: Initialize Kanban
Invoke the `kanban` sub-agent with command INIT.
Load all user stories from the planner output into "todo" status.

## Step 4: Generate Execution Plan
Invoke the `phase-orchestrator` sub-agent with all user stories and their dependency lists.
Output: execution plan (parallel groups, depends_on_groups)

---

## Final Outputs
- **plan_final**: PRD + phases + user stories
- **kanban_board**: all stories in "todo"
- **execution_plan**: dependency-correct parallel groups

## Success Criteria
- [ ] grill-me verdict is ALIGNED
- [ ] All open questions resolved by user
- [ ] Every phase delivers end-to-end functionality (not horizontal layers)
- [ ] Every story has GIVEN/WHEN/THEN acceptance criteria
- [ ] Kanban initialized with all stories in "todo"
- [ ] Execution plan covers every story with correct dependency ordering
