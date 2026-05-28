Run a full-codebase security scan (STRIDE threat modeling + OWASP Top 10).

WORKFLOW: security-scan (atomic)
Human gate: NO inside this command (but BLOCKED verdict requires user to resolve before `/ship`).
Prerequisite: every story status=done in `.claude/memory/kanban.json`.

---

## Step 1
```powershell
$env:CLAUDE_AGENT = 'auditor'
$env:CLAUDE_STORY_ID = $null
```

Invoke `auditor` SECURITY.

`auditor` reads:
- Full codebase
- Deployment config (if `/ship` has run)
- `.claude/memory/security/findings.json` (prior findings, for dedup)

Writes `.claude/memory/security/findings.json` containing:
1. Threat Model (STRIDE) — only categories with findings
2. OWASP Top 10 — categories with findings
3. Auth & AuthZ Review
4. Findings (critical_findings + other_findings) with specific locations
5. Pipeline Verdict: **BLOCKED** | **CLEAR**

Critical = automatic block: hardcoded secrets, SQL injection, missing auth on protected endpoints, RCE.

## If BLOCKED
Present critical findings to user. Every critical finding must be resolved before `/ship`. After fixing, re-run `/security-scan` until CLEAR.

## Success Criteria
- [ ] Full codebase scanned (not per-story)
- [ ] Verdict emitted
- [ ] Findings written to `.claude/memory/security/findings.json`

Next step: If CLEAR — `/ship`. If BLOCKED — resolve criticals and re-run.
