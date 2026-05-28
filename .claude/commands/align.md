Run the `clarify` agent in **INTERROGATE** mode against a raw idea — no plan, just alignment.

WORKFLOW: align (atomic)
Stage: 1 (CLARIFY, INTERROGATE only)
Human gate: YES — resolve open questions before calling `/clarify` for the PLAN portion.

Required input: raw idea or feature description (ask user if not provided).

---

## Pre-step: tag the hook
Set environment variables so the logging hook attributes this work correctly:
```powershell
$env:CLAUDE_AGENT = 'clarify'
$env:CLAUDE_STORY_ID = $null
```

## Step 1: Interrogate
Invoke the `clarify` agent in INTERROGATE mode with the raw idea + user context.

`clarify` writes `.claude/memory/requirements.html` with:
- Clarified Requirements (Draft)
- Assumptions (id, statement, risk)
- Open Questions (id, text)
- Verdict: **ALIGNED** | **NEEDS_CLARIFICATION** | **REJECT**

## HUMAN GATE — Resolve Ambiguity
Present the Assumptions and Open Questions to the user.
Collect answers. Update `.claude/memory/requirements.html`.
**Do not proceed until the user explicitly confirms all questions are resolved.**

After resolution, the verdict in requirements.html should be ALIGNED.

---

## Success Criteria
- [ ] `.claude/memory/requirements.html` exists
- [ ] Verdict: ALIGNED
- [ ] All assumptions acknowledged by the user
- [ ] All open questions resolved by the user

Next step: Run `/clarify` to also generate the plan, or `/design` if the plan already exists.
