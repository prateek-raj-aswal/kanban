# Execution Plan — Kanbank Enhancements (35 stories)

Source plan: `runs/plan_enhancements_2026-05-31.md`
Board: `runs/kanban.json` (35 new stories in `todo`; US-001..US-007 already `done`)
Waves ship in strict order: PHASE-012 → PHASE-013 → PHASE-014.

## Ordered parallel groups (11 total)

### PHASE-012 — Wave 1 (quick fixes + auth refresh chain)
- **Group A** — `depends_on_groups: []` — US-1201, US-1202, US-1203, US-1204, US-1205, US-1206, US-1207 *(7 wide — phase max parallelism)*
- **Group B** — `depends_on_groups: [A]` — US-1208
- **Group C** — `depends_on_groups: [B]` — US-1209
- **Group D** — `depends_on_groups: [C]` — US-1210
- Intra-wave critical path: US-1207 → US-1208 → US-1209 → US-1210 (auth token chain, 4 deep)

### PHASE-013 — Wave 2 (medium UI / single-field additions)
- **Group E** — `depends_on_groups: [D]` — US-1301, US-1305, US-1306, US-1309, US-1311 *(5 wide)*
- **Group F** — `depends_on_groups: [E]` — US-1302, US-1303, US-1307, US-1310, US-1312 *(5 wide)*
- **Group G** — `depends_on_groups: [F]` — US-1304, US-1308, US-1313
- Note: US-1302 is contingent on the US-1301 investigation; may close as not-needed.

### PHASE-014 — Wave 3 (net-new subsystems)
- **Group H** — `depends_on_groups: [G]` — US-1401, US-1405, US-1408 *(3 wide — 3 independent backend tracks)*
- **Group I** — `depends_on_groups: [H]` — US-1402, US-1406, US-1409
- **Group J** — `depends_on_groups: [I]` — US-1403, US-1407, US-1410
- **Group K** — `depends_on_groups: [J, G]` — US-1404, US-1411
- Cross-phase dep: US-1411 needs US-1410 (J) **and** US-1304 (G, Wave 2 — already satisfied by wave ordering).

## Critical path
- Wave 1: US-1207 → US-1208 → US-1209 → US-1210 (4)
- Wave 2: US-1306 → US-1307 → US-1308 (3)
- Wave 3: US-1408 → US-1409 → US-1410 → US-1411 (4)
- End-to-end (strict wave ordering): 11 groups deep.

## Max parallelism per phase
- Wave 1: **7** (Group A) · Wave 2: **5** (Groups E, F) · Wave 3: **3** (Groups H, I, J)

No cycles or deadlocks — every story's dependencies resolve in a strictly earlier group; all 35 scheduled.
