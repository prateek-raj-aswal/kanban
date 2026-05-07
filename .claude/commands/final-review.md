Run the final-review workflow.

WORKFLOW: final-review
Human gate: YES (final GO/NO-GO — mandatory)

Can be run standalone or as the final step in full-pipeline.

Required inputs (ask user if not provided):
- plan + architecture
- phase_results (all executed story outputs)
- qa_reports
- security_reports
- deployment_config
- kanban_board (should show all stories: done)

---

## Step 1: Compile Review Package
Invoke `human-review` with all inputs.

Output: structured review package with:
- Executive summary
- Story-by-story status (PASS/FAIL, test coverage, open bugs)
- QA / security summary
- Code quality assessment (Deep Module adherence)
- Recommendation: APPROVE | REJECT

## HUMAN GATE: GO/NO-GO Decision
Present the full review package to the user.
**Wait for explicit human decision. Do not proceed without it.**

Decision options:
- **APPROVE** → proceed to doc-writer (if part of full-pipeline)
- **APPROVE WITH CONDITIONS** → log conditions to memory.decisions_log, proceed
- **REJECT** → log feedback to memory.decisions_log. STOP.

## Step 2: Log Decision
Write to memory.decisions_log:
```yaml
- type: final_review_decision
  date: today
  decision: APPROVE | APPROVE_WITH_CONDITIONS | REJECT
  conditions: "..." (if applicable)
  feedback: "..." (if REJECT)
```

---

## Success Criteria
- [ ] Review package compiled (all five sections present)
- [ ] Human decision recorded: APPROVE | APPROVE_WITH_CONDITIONS | REJECT
- [ ] If REJECT: feedback logged to memory.decisions_log
- [ ] If APPROVE WITH CONDITIONS: conditions logged to memory.decisions_log
