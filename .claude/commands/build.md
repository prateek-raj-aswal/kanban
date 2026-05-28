Run **Stage 3 (BUILD)** — implement the ready stories via TDD. Calls `/execute-story` per ready story, up to 3 in parallel.

WORKFLOW: build (stage)
Stage: 3 (BUILD)
Human gate: NO inside `/build` (only on TDD 5-iteration escalation per story).
Prerequisite: per-story contracts.json must exist (from `/design`).

Optional input: `story_id` — if provided, runs `/execute-story` for ONLY that story.

---

## Step 1: Determine target stories
Set hook attribution:
```powershell
$env:CLAUDE_AGENT = 'tracker'
$env:CLAUDE_STORY_ID = $null
```

If invoked with `story_id`: target = [story_id].
Else: invoke `tracker` NEXT with the full story list from `.claude/memory/plan.json`. Target = `ready` list. If `ready` is empty and DEADLOCK flagged, STOP and report.

## Step 2: Run /execute-story for each target (max 3 parallel)
For each target story_id, run `/execute-story {story_id}` — they may proceed in parallel, up to 3 at a time. The next batch starts only after one of the in-flight stories completes.

Each `/execute-story` invocation handles its own TDD loop (max 5 iterations → human escalation), per-story `auditor` REVIEW, `doc-writer` increment, and tracker MOVE to done.

## Step 3: Refresh ready list
After each story completes, invoke `tracker` NEXT again. Any newly-unblocked stories enter the pool.

## Step 4: Exit
Stop when `tracker` STATUS shows `summary.todo == 0` AND `summary.in_progress == 0` — every story is done.

---

## Outputs
- Source code in repo (per-story)
- `db/migrations/*.sql` (per-story)
- Test files in repo (per-story)
- `.claude/memory/stories/{id}/{test_plan,test_results,bugs,build_log,review,doc_summary}.{yaml,json,html}`
- `.claude/memory/test-reports/{id}-{backend,frontend}.html` (per-story HTML reports)
- `.claude/memory/bugs/registry.html` (aggregate bug log — all stories)
- `tests/regression/suite.json` (every done story registered)
- `docs/stories/index.html` (one row per done story)
- `docs/api/*.html` (full API schema docs)
- `.claude/memory/kanban.json` (every story moved to done)

## Success Criteria
- [ ] Every targeted story status = done
- [ ] No story escalated to human via 5-iteration TDD failure (or all escalations resolved)
- [ ] Every story has a review.html with verdict: PASS
- [ ] Every done story is registered in `tests/regression/suite.json`
- [ ] HTML test reports exist for every story

Next step: `/verify` for project-wide security scan.
