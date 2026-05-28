Show which stories are unblocked and ready to execute right now.

WORKFLOW: next (atomic)
Human gate: NO.
Prerequisite: `.claude/memory/plan.json` and `.claude/memory/kanban.json` exist.

---

## Step 1
```powershell
$env:CLAUDE_AGENT = 'tracker'
$env:CLAUDE_STORY_ID = $null
```

Invoke `tracker` NEXT with the full story list (from `plan.json`) + current board (`kanban.json`).

A story is `ready` only when EVERY id in its `dependencies` has `status: done` in the persisted board.

Output:
```json
{
  "ready": ["US-003", "US-005"],
  "blocked": [ { "story_id": "US-006", "waiting_on": ["US-003", "US-004"] } ],
  "remaining": { "todo": 4, "in_progress": 1, "done": 3 }
}
```

## DEADLOCK
If `ready` is empty AND `in_progress == 0` AND `todo > 0`, `tracker` flags DEADLOCK — investigate circular dependencies or stuck stories.

## Success Criteria
- [ ] `ready` list contains only stories with ALL deps done
- [ ] DEADLOCK detected and reported if applicable

Next step: `/execute-story {id}` for any id in `ready`, or `/build` to fan out across all ready.
