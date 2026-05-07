Run the execute-story workflow for a single user story.

WORKFLOW: execute-story
Human gate: ONLY if TDD loop fails to converge within 5 iterations.

Required inputs (ask user if not provided):
- `story`: the user story object (id, title, acceptance_criteria, phase, dependencies)
- `parsed_contracts`: pre-parsed contracts for this story (from artifact-parser)
- `kanban_board`: current kanban board state

---

## Step 1: Move Story to In-Progress
Invoke `kanban` MOVE: `{ story_id, from: "todo", to: "in_progress" }`

## Step 2: Generate Tests (TDD First — before any code)
Invoke `qa` in **PLAN mode** with story + parsed_contracts.
Output: test_plan (tests written BEFORE implementation begins)

## Step 3: Generate DB Migrations
Invoke `database` with story + parsed_contracts.db_schema.
Output: migration scripts

## Step 4: Initial Implementation (Parallel)
Invoke `backend` and `frontend` in parallel:
- Both receive: story + parsed_contracts + test_plan
- backend also receives: migrations

## Step 5: TDD Loop (max 5 iterations)
Repeat until exit condition is met:

**Exit condition**: qa_result.summary.has_critical_bugs == false AND all_ac_passed == true AND contracts_compliant == true

Each iteration:
1. Invoke `qa` RETEST mode → qa_result
2. If no critical bugs: invoke `qa` to validate all acceptance criteria → { all_passed, missing }
3. If no critical bugs: invoke `reviewer` to check contract compliance → { compliant, violations }
4. If backend bugs OR contract violations: invoke `backend` to fix
5. If frontend bugs: invoke `frontend` to fix
6. If AC not fully met: invoke `backend` with missing criteria (fix only missing, preserve passing)
7. Regression guard: no previously passing test may break

**If loop reaches 5 iterations without passing:**
- Invoke `reviewer` for structured failure analysis
- Invoke `human-review` for **HUMAN ESCALATION** (approval required)
- STOP. Do not mark story done until human resolves.

## Step 6: Final Code Review
Invoke `reviewer` on final backend + frontend code.
Check: Deep Modules compliance, bounded context, contract drift.

## Step 7: Security Scan
Invoke `security` on final backend + frontend code.

## Step 8: Move Story to Done
Invoke `kanban` MOVE: `{ story_id, from: "in_progress", to: "done" }`

---

## Success Criteria
- [ ] qa_result.summary.has_critical_bugs == false
- [ ] All acceptance criteria: all_passed == true
- [ ] Contract compliance: compliant == true
- [ ] reviewer verdict: PASS
- [ ] security scan: complete (no critical findings unaddressed)
- [ ] Story status on kanban: done
