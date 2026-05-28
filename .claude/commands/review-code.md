Review code or test artifacts for one story — Deep Modules + contract drift.

WORKFLOW: review-code (atomic)
Human gate: NO (FAIL is a soft signal — you decide how to respond).
Prerequisite: artifact(s) exist on disk; `.claude/memory/stories/{story_id}/contracts.json` exists.

Required inputs: `story_id`, optional `type` (defaults to Code).

---

## Step 1
```powershell
$env:CLAUDE_AGENT = 'auditor'
$env:CLAUDE_STORY_ID = '{story_id}'
```

Invoke `auditor` REVIEW with:
- type: Code | Test (default Code)
- story_id: {story_id}
- parsed_contracts: from `.claude/memory/stories/{story_id}/contracts.json`

`auditor` writes `.claude/memory/stories/{story_id}/review.html` with five sections — Summary, Critical Issues, Warnings, Suggestions, Verdict (PASS | FAIL).

Deep Modules checklist enforced on Code reviews:
- Narrow interfaces
- Deep implementations
- No scope bleed beyond the story's bounded context
- Contracts match parsed_contracts exactly

## Note — Design artifacts
If you want to review a Design artifact (system-design.yaml), invoke this with `type: Design` and omit story_id; `auditor` will write to `.claude/memory/architecture/design_review.html` instead.

## Success Criteria
- [ ] `review.html` (or `design_review.html`) written
- [ ] Every finding cites a file + line/method
- [ ] Verdict explicitly stated

Next step: If FAIL — fix cited issues and re-run. If PASS — `/run-tests {story_id}` or advance.
