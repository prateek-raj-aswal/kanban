Execute the test suite for one story and produce a structured bug report with HTML test reports.

WORKFLOW: run-tests (atomic)
Human gate: NO.
Prerequisite: `.claude/memory/stories/{story_id}/test_plan.yaml` exists AND test files exist on disk.

Required input: `story_id`.

---

## Step 1
```powershell
$env:CLAUDE_AGENT = 'qa'
$env:CLAUDE_STORY_ID = '{story_id}'
```

Invoke `qa` RETEST for the story.

`qa` runs tests with HTML reporters enabled (framework from `context/tech-stack.html`). For E2E tests, confirms app is reachable via WebFetch before running browser suite.

Writes:
- `.claude/memory/stories/{story_id}/test_results.json`
- `.claude/memory/stories/{story_id}/bugs.json` (one entry per failing test; regressions marked critical)
- `.claude/memory/test-reports/{story_id}-backend.html` — HTML backend test report
- `.claude/memory/test-reports/{story_id}-frontend.html` — HTML frontend/E2E test report
- `.claude/memory/bugs/registry.html` — new bugs appended; resolved bugs updated

## Success Criteria
- [ ] All tests executed via Bash (never predicted)
- [ ] Actual pass/fail counts in test_results.json
- [ ] HTML reports generated for backend + frontend
- [ ] Bug registry updated
- [ ] Regressions flagged as critical

Next step: If `has_critical_bugs: true` — fix via backend/frontend and re-run. If false — `/review-code {story_id}` or advance.
