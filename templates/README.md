# templates/

Templates for files you author manually inside `.claude/memory/`.

| Template | Copy into | When to use |
|---|---|---|
| `decision-template.md` | `.claude/memory/decisions/DEC-{N}-{slug}.md` | When you make an architectural / product decision worth recording (especially before/during `/clarify` or `/design`) |
| `pattern-template.md` | `.claude/memory/patterns/{slug}.md` | When you want agents to prefer a specific code pattern over inventing new ones |

## Workflow

1. Copy the template:
   ```powershell
   Copy-Item templates/decision-template.md .claude/memory/decisions/DEC-007-use-postgres-jsonb.md
   ```
2. Fill it in. Save.
3. Agents pick it up automatically on their next invocation (no rebuild step — they read the directory at runtime).

## Why curate patterns up front?

The `backend`, `frontend`, and `architect` agents check `.claude/memory/patterns/` before inventing new approaches. A well-curated patterns directory means:
- Less code variance across stories
- Faster onboarding for humans reviewing the output
- The agents converge on YOUR conventions instead of generic defaults

Recommended starter patterns to author before running `/clarify`:
- Error handling style (typed exceptions vs Result types vs panic)
- Service layer shape (interface + impl, transaction boundaries)
- Test naming + structure (AAA, given-when-then, fixture strategy)
- Logging structure (correlation IDs, structured fields)
