Show the current kanban board.

WORKFLOW: board (atomic)
Human gate: NO.

---

## Step 1
```powershell
$env:CLAUDE_AGENT = 'tracker'
$env:CLAUDE_STORY_ID = $null
```

Invoke `tracker` STATUS. Reads `.claude/memory/kanban.json` and returns the full board:
```json
{
  "stories": [
    { "id": "US-001", "title": "...", "phase": "PHASE-001", "dependencies": [], "status": "todo|in_progress|done", "acceptance_criteria": ["..."] }
  ],
  "summary": { "todo": N, "in_progress": N, "done": N }
}
```

## Success Criteria
- [ ] Board read from disk (not in-context state)

Tip: `/next` shows which stories are unblocked right now.
