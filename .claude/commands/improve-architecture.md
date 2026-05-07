Run the improve-architecture workflow.

WORKFLOW: improve-architecture
Human gate: YES (refactor option selection — mandatory)

Required input: codebase_path (ask user if not provided)

---

## Step 1: Architectural Analysis
Invoke `architect` to analyze the codebase for:
- Shallow modules (wide interfaces exposing unnecessary detail)
- Tight coupling between bounded contexts
- Poor boundary definitions (context bleed)
- Patterns that contradict Deep Modules principles

Output: analysis_report with specific findings, locations, and severity.

## Step 2: Propose Refactor Options
Invoke `architect` with the analysis_report to propose **≥2 distinct refactor options**.

Each option must include:
```yaml
option:
  id: OPT-001
  name: "..."
  target_state: "..."
  trade_offs:
    pros: [...]
    cons: [...]
  migration_path:
    - step: 1, action: "..."
    - step: 2, action: "..."
  estimated_complexity: Low | Medium | High
  estimated_effort: "..."
```

## HUMAN GATE: Select Refactor Option
Present the analysis_report and all options to the user.
**Wait for user selection. Do not begin any refactoring until selected.**

If user rejects all options:
- Log to memory.decisions_log: { decision: "no refactor", rationale: user's reason, date: today }
- STOP.

## Step 3: Log Decision
Write to memory.decisions_log:
```yaml
- type: architecture_decision
  date: today
  selected_option: OPT-{N}
  rationale: "..."
  analysis_summary: "..."
```

---

## Success Criteria
- [ ] Analysis complete with specific findings and locations
- [ ] ≥2 distinct refactor options produced (each with target state + trade-offs + migration path)
- [ ] Human selected an option OR explicitly rejected all
- [ ] Decision logged to memory.decisions_log
