# Kanbank — 15-Enhancement Delivery Plan (Three Waves)

**Generated:** 2026-05-31
**Execution model:** Claude Code sub-agents (backend/frontend/database/etc.) with human-review gates between waves. Stories sized for autonomous agent execution — each is a single vertical slice an agent implements and tests in one pass.
**Status of this document:** APPENDED. It does NOT overwrite or renumber `runs/plan_final.md` (US-101..US-1103, PHASE-001..PHASE-011) or `runs/kanban.json` (US-001..US-007, PHASE-001/002). See "ID conventions" below.

---

## ID conventions (reconciled from existing artifacts)

Two pre-existing numbering schemes were found and are BOTH preserved:

| Source | Phase IDs | Story IDs | Notes |
|--------|-----------|-----------|-------|
| `runs/plan_final.md` | PHASE-001 → PHASE-011 | US-101 → US-1103 | Design-reference enhancement backlog |
| `runs/kanban.json` | PHASE-001, PHASE-002 | US-001 → US-007 | Live kanban board (DB/infra stories, all `done`) |

To collide with neither, this plan uses **fresh, non-overlapping IDs**:
- **Phases:** `PHASE-012`, `PHASE-013`, `PHASE-014` (continue `plan_final.md` past PHASE-011).
- **Stories:** `US-1201` onward (a fresh band above US-1103 and far above US-007).

Field schema for the kanban matches `runs/kanban.json`: `id, title, phase, dependencies, status, acceptance_criteria`.

---

## Repo investigation results (drives sizing; scope flags resolved)

Verified against the live codebase before sizing:

- **#1 Workspace management (backend).** `WorkspaceController` is fully implemented: `POST/GET/GET{id}/PATCH/DELETE` plus `GET/POST/DELETE .../members`. **Backend works.** #1 is a FRONTEND build, not a backend fix. A thin verification story is included; a contingent backend-fix story is included but expected to be a no-op.
- **#6 Column color change.** `PATCH /api/v1/columns/{columnId}` already updates `headerColor`; `ColumnService` persists it to `columns.header_color VARCHAR(20)` (migration V15) and emits a `ColumnColorUpdatedData` WS event. **Backend accepts repeat updates and free-form strings already.** #6 is a FRONTEND "can't re-open the picker" gap. No backend change required — scope flag resolved DOWN.
- **#10 Free-form color (columns).** Because `header_color` is already a free-form `VARCHAR(20)`, the column side of #10 needs **no DB/DTO change** — only frontend (swap the fixed 8-swatch enum UI for a hex/wheel picker). The `ColumnColor` enum + `GET /api/v1/column-colors` stay as preset suggestions. The **card** side of #10 IS net-new (cards have no color field) — that requires a migration.
- **#13 Refresh tokens.** No `refresh` token code exists anywhere in `backend/src/main/java`. Genuinely net-new: refresh-token store table + rotation + revocation-on-logout. Pairs with #14.
- **#15 RBAC.** `WorkspaceMember.role` / `BoardMember.role` are bare `String` defaulting to `"MEMBER"`; `BoardAccessPolicy` only distinguishes `VIEWER` vs not. Net-new role enum (OWNER/ADMIN/MEMBER/VIEWER) + central policy + UI is real and large.

### Constraint mismatch flagged (NOT acted on)
`context/constraints.md` line 100 says "Angular frontend" and lines 104/173 mandate Redis + WebSocket. The live repo is **Next.js/React/TypeScript + Zustand** (per `context/tech-stack.md` and `frontend/src`). This plan follows the actual repo/`tech-stack.md`. The refresh-token store (#13) and RBAC are designed to work with the existing JWT stack; Redis is optional (a DB table denylist is the default, swappable for Redis later) so we do not introduce a hard Redis dependency mid-flight.

---

## PRD — Appendix C: UX Polish, Customization, and Collaboration Hardening

> Appended to the existing PRD. Existing PRD sections are unchanged.

### Problem Statement
Kanbank's core board mechanics, workspace hierarchy, and personal views (delivered in PHASE-001..PHASE-011) are in production on AWS EC2 PostgreSQL with live data. Day-to-day use has surfaced three classes of gaps: (1) **wiring/polish defects** that make the app feel unfinished and break on mobile, (2) **missing self-service customization** (workspace management UI, board descriptions, richer theming, free-form colors), and (3) **absent collaboration subsystems** that a Jira-alternative is expected to have (swimlanes, attachable issues, real RBAC). Auth is also weaker than required — a 1h JWT with no refresh/revocation forces re-login and cannot revoke a session on logout.

### Target Users
- **Solo / small-team board owners** (primary; moderate tech literacy) — want a polished, mobile-usable board they can theme and organize without admin friction.
- **Workspace/board admins** (moderate-to-high literacy) — need to manage members, assign roles, and control access per workspace and per board.
- **Individual contributors** (mixed literacy) — need swimlanes to slice work by assignee/priority/module and to attach lightweight issues to a story.

### Goals & Success Metrics
| Goal | Metric |
|------|--------|
| Eliminate visible wiring defects | 0 of {favicon missing, column reorder not refreshing, no logout, theme blocked on mobile, modal/scroll overflow} remain |
| Secure, revocable sessions | Access token ≤ 15m; refresh rotates; logout revokes refresh token server-side (subsequent refresh → 401) |
| Self-service customization | Owners create/rename/delete workspaces, manage members, set board description, pick any theme + any hex color for cards/columns — all without backend access |
| Real collaboration subsystems | Swimlane group-by (assignee/priority/module) persists; issues attach/detach to story-cards; OWNER/ADMIN/MEMBER/VIEWER enforced across all controllers |
| Production-safe delivery | Every Wave-3 migration is reversible and validated on a branch/non-prod DB before prod; no data loss on live EC2 PostgreSQL |

### Non-Goals
- Auto-closing issues when a parent story closes (closing is MANUAL).
- Per-cell or per-lane WIP limits on swimlanes.
- OAuth/social-login changes (JWT issuer unchanged; only refresh/revocation added).
- Theme marketplace / user-uploaded texture assets (new themes ship bundled).
- Migrating column colors away from free-form strings (already free-form; no change).
- Redis as a hard dependency for the denylist (DB-backed store is the default).

---

## Phases (vertical slices — each delivers DB + Backend + Frontend + QA end-to-end)

```yaml
phase:
  id: PHASE-012
  name: "Wave 1 — Wiring gaps, mobile/layout fixes, and refresh-token auth"
  priority: P0
  depends_on: []   # builds on shipped PHASE-001..011
```
```yaml
phase:
  id: PHASE-013
  name: "Wave 2 — Self-service customization (workspace mgmt UI, board description, themes, free-form colors)"
  priority: P1
  depends_on: [PHASE-012]   # logout/auth UI from W1 underpins member-mgmt flows; theme token model precedes color picker
```
```yaml
phase:
  id: PHASE-014
  name: "Wave 3 — Net-new subsystems with prod-safe migrations (swimlanes, attachable issues, RBAC)"
  priority: P2
  depends_on: [PHASE-013]   # RBAC builds on workspace-mgmt UI; swimlane modules reuse color/token work
```

QA bar (applied in acceptance criteria):
- Backend stories → JUnit 5 + Mockito unit tests (project test runner).
- Frontend stories → manual verification on BOTH desktop and mobile viewports.
- DB-migration stories → reversible (down/undo proven) and validated on a branch/non-prod DB before prod.

---

## User Stories — Full Backlog

### PHASE-012 — Wave 1: Wiring gaps, mobile/layout, refresh-token auth

```yaml
story:
  id: US-1201
  title: "Add app favicon and document head metadata"
  description: "As a user, I want the app to show a favicon in the browser tab so it looks finished and is recognizable among tabs."
  acceptance_criteria:
    - GIVEN frontend/public currently contains only .gitkeep WHEN the favicon asset(s) (favicon.ico + any app-icon) are added and referenced in the Next.js head/metadata THEN the browser tab shows the Kanbank icon
    - GIVEN any route in the app WHEN the page loads THEN no 404 is logged for /favicon.ico
  phase: PHASE-012
  priority: P0
  story_points: 1
  execution_mode: agent
  dependencies: []
```

```yaml
story:
  id: US-1202
  title: "Fix column reorder not refreshing the DOM (frontend state/render bug)"
  description: "As a user, I want columns to visually reorder immediately after I drag them so the board reflects the order the backend already saved."
  acceptance_criteria:
    - GIVEN PATCH /api/v1/boards/{boardId}/columns/reorder returns 200 with the new order WHEN the drag completes THEN the column DOM order updates without a manual page refresh
    - GIVEN the reorder response WHEN boardStore state is updated THEN columns render in the returned order and React keys remain stable (no flicker/duplicate)
    - GIVEN a failed reorder request WHEN the error returns THEN the previous order is restored (optimistic rollback)
  phase: PHASE-012
  priority: P0
  story_points: 2
  execution_mode: agent
  dependencies: []
```

```yaml
story:
  id: US-1203
  title: "Render a logout control in the UI wired to authStore.logout()"
  description: "As a logged-in user, I want a visible logout control so I can end my session from the UI."
  acceptance_criteria:
    - GIVEN authStore.logout() already exists WHEN a logout control is added to the app shell (e.g. user menu in Sidebar/header) and clicked THEN authStore.logout() runs and the user is redirected to the login route
    - GIVEN logout completed WHEN protected routes are visited THEN the user is unauthenticated and access tokens are cleared from client state
    - VERIFY visible and usable on BOTH desktop and mobile viewports
  phase: PHASE-012
  priority: P0
  story_points: 1
  execution_mode: agent
  dependencies: []
```

```yaml
story:
  id: US-1204
  title: "Fix mobile: theme section blocked by BottomNav (z-index/layout)"
  description: "As a mobile user, I want the theme controls to be reachable and not covered by the bottom navigation bar."
  acceptance_criteria:
    - GIVEN viewport < 768px WHEN the theme section (ThemeSwitcher) is opened THEN it is fully visible and interactive, not overlapped by BottomNav (board/today/timeline/inbox)
    - GIVEN BottomNav is fixed WHEN scrollable content reaches the bottom THEN content has padding-bottom equal to BottomNav height so nothing is occluded
    - VERIFY on mobile viewport; desktop layout unchanged
  phase: PHASE-012
  priority: P0
  story_points: 2
  execution_mode: agent
  dependencies: []
```

```yaml
story:
  id: US-1205
  title: "Make the left Sidebar collapsible (collapse/expand)"
  description: "As a user, I want to collapse the left sidebar so I get more horizontal space for the board."
  acceptance_criteria:
    - GIVEN the Sidebar is expanded WHEN the collapse toggle is clicked THEN the sidebar collapses to a narrow rail (or hides) and the board area expands
    - GIVEN the Sidebar is collapsed WHEN the expand toggle is clicked THEN it restores to full width
    - GIVEN a chosen collapsed/expanded state WHEN the page reloads THEN the state persists (localStorage or store)
    - VERIFY on BOTH desktop and mobile viewports
  phase: PHASE-012
  priority: P1
  story_points: 2
  execution_mode: agent
  dependencies: []
```

```yaml
story:
  id: US-1206
  title: "Fix horizontal board scroll and modal overflow off the right edge"
  description: "As a user, I want the board to scroll horizontally and modals to stay on-screen so content past the right edge stays accessible."
  acceptance_criteria:
    - GIVEN more columns than fit the viewport WHEN the board renders THEN it scrolls horizontally within its container and does not push modals/content off-screen
    - GIVEN a modal is opened WHEN it renders THEN it is centered/constrained within the viewport with no part clipped past the right edge, and is scrollable if taller than the viewport
    - VERIFY on BOTH desktop and mobile viewports (mobile = bottom-sheet behavior already used elsewhere is acceptable)
  phase: PHASE-012
  priority: P0
  story_points: 3
  execution_mode: agent
  dependencies: []
```

```yaml
story:
  id: US-1207
  title: "Migration V21: create refresh_tokens store (reversible)"
  description: "As the platform, I need a server-side refresh-token store so sessions can be refreshed and revoked."
  acceptance_criteria:
    - GIVEN Flyway is at V20 WHEN V21 runs THEN a refresh_tokens table exists (id UUID PK, user_id FK, token_hash, expires_at, revoked_at NULL, created_at, replaced_by NULL) with an index on user_id and a unique index on token_hash
    - GIVEN the migration WHEN a matching V21 undo/down is authored THEN it cleanly drops the table and indexes
    - VERIFY migration is reversible and validated on a branch/non-prod DB before prod (no impact on existing tables/data)
  phase: PHASE-012
  priority: P0
  story_points: 2
  execution_mode: agent
  dependencies: []
```

```yaml
story:
  id: US-1208
  title: "Backend: short-lived access token + refresh-token issuance and rotation"
  description: "As a user, I want a short-lived access token plus a refresh token so I stay logged in without a long-lived JWT."
  acceptance_criteria:
    - GIVEN successful login WHEN the auth response is returned THEN it includes a short-lived access token (JWT_EXPIRY_MS reduced to <=15m) and a refresh token persisted (hashed) in refresh_tokens
    - GIVEN a valid, unexpired, unrevoked refresh token WHEN POST /api/v1/auth/refresh is called THEN a new access token is issued and the refresh token is rotated (old row marked replaced_by the new one)
    - GIVEN an expired or unknown refresh token WHEN /auth/refresh is called THEN 401 is returned
    - VERIFY JUnit tests cover issue, refresh-rotate, expired, and unknown-token cases
  phase: PHASE-012
  priority: P0
  story_points: 3
  execution_mode: agent
  dependencies: [US-1207]
```

```yaml
story:
  id: US-1209
  title: "Backend: revoke refresh token on logout (revocation/denylist)"
  description: "As a user, I want logging out to invalidate my refresh token server-side so my session cannot be resumed."
  acceptance_criteria:
    - GIVEN an authenticated session WHEN POST /api/v1/auth/logout is called THEN the active refresh token's revoked_at is set
    - GIVEN a refresh token revoked at logout WHEN POST /api/v1/auth/refresh is attempted with it THEN 401 is returned
    - GIVEN token rotation WHEN an already-replaced (reused) refresh token is presented THEN it is rejected (401) and, defensively, the token family is revoked
    - VERIFY JUnit tests cover logout-then-refresh and replayed-token cases
  phase: PHASE-012
  priority: P0
  story_points: 2
  execution_mode: agent
  dependencies: [US-1208]
```

```yaml
story:
  id: US-1210
  title: "Frontend: silent token refresh + logout wired to refresh-token endpoints"
  description: "As a user, I want the app to silently refresh my access token and to fully log out, using the new endpoints."
  acceptance_criteria:
    - GIVEN an access token nearing/at expiry WHEN an API call returns 401 (or a pre-expiry timer fires) THEN the client calls /auth/refresh once, stores the new access token, and retries the original request transparently
    - GIVEN the user clicks logout (US-1203) WHEN logout runs THEN it calls /auth/logout, clears tokens, and redirects to login
    - GIVEN a failed refresh (401) WHEN it occurs THEN the client clears state and redirects to login (no infinite refresh loop)
    - VERIFY on BOTH desktop and mobile viewports
  phase: PHASE-012
  priority: P0
  story_points: 3
  execution_mode: agent
  dependencies: [US-1208, US-1209, US-1203]
```

---

### PHASE-013 — Wave 2: Self-service customization

```yaml
story:
  id: US-1301
  title: "INVESTIGATE & verify workspace backend (create/rename/delete/members)"
  description: "As the team, I want confirmation that the existing workspace backend fully supports create/rename/delete/manage-members before building the UI."
  acceptance_criteria:
    - GIVEN WorkspaceController endpoints (POST, GET, GET{id}, PATCH, DELETE, members add/list/remove) WHEN exercised via integration tests/curl THEN each returns the documented success/204 and proper 403 for non-owners
    - GIVEN any gap discovered WHEN it is found THEN it is recorded and US-1302 (contingent backend fix) is scheduled; otherwise US-1302 is closed as not-needed
    - SCOPE FLAG: investigation may expand scope into US-1302 if backend gaps are found (expected: none — controller is complete)
  phase: PHASE-013
  priority: P1
  story_points: 1
  execution_mode: agent
  dependencies: []
```

```yaml
story:
  id: US-1302
  title: "CONTINGENT: fix workspace backend gaps found in US-1301"
  description: "As the team, I want any workspace backend gaps from the investigation fixed so the management UI has a complete API."
  acceptance_criteria:
    - GIVEN US-1301 recorded one or more gaps WHEN this story runs THEN each gap is fixed with a JUnit test proving the corrected behavior
    - GIVEN US-1301 found no gaps WHEN triaged THEN this story is closed as not-needed (0 points consumed)
    - SCOPE FLAG: only activates if US-1301 finds backend gaps
  phase: PHASE-013
  priority: P1
  story_points: 2
  execution_mode: agent
  dependencies: [US-1301]
```

```yaml
story:
  id: US-1303
  title: "Workspace management UI: create / rename / delete"
  description: "As a workspace owner, I want to create, rename, and delete workspaces from the UI so I can self-manage without backend access."
  acceptance_criteria:
    - GIVEN the WorkspaceSwitcher WHEN I open a 'Manage workspaces' surface THEN I can create a workspace (POST), rename it (PATCH), and delete it (DELETE) with optimistic UI + error toasts
    - GIVEN I am not the owner WHEN I open the manage surface THEN destructive actions are hidden/disabled per backend 403
    - GIVEN a workspace is created/renamed/deleted WHEN the action succeeds THEN workspaceStore and the switcher list update without a full reload
    - VERIFY on BOTH desktop and mobile viewports
  phase: PHASE-013
  priority: P1
  story_points: 3
  execution_mode: agent
  dependencies: [US-1301]
```

```yaml
story:
  id: US-1304
  title: "Workspace member-management UI (list / add / remove)"
  description: "As a workspace owner/admin, I want to view and manage members so I can control who is in a workspace."
  acceptance_criteria:
    - GIVEN a workspace WHEN I open member management THEN current members are listed (GET .../members)
    - GIVEN the add-member form WHEN I submit an email THEN POST .../members adds them (201) and the list updates; duplicates/errors show a toast
    - GIVEN a member row WHEN I remove a member THEN DELETE .../members/{userId} runs and the row disappears
    - VERIFY on BOTH desktop and mobile viewports
  phase: PHASE-013
  priority: P1
  story_points: 3
  execution_mode: agent
  dependencies: [US-1303]
```

```yaml
story:
  id: US-1305
  title: "Fix column color: allow re-opening the picker to change a set color"
  description: "As a user, I want to change a column's color after it's set, by re-opening the color picker."
  acceptance_criteria:
    - GIVEN a column already has a header color WHEN I open the column menu THEN the color picker is available again (not locked after first set)
    - GIVEN I pick a new color WHEN I confirm THEN PATCH /api/v1/columns/{columnId} with the new headerColor is sent and the column re-renders in the new color (backend already supports repeat updates — verified)
    - GIVEN the ColumnColorUpdated WS event WHEN received THEN other clients reflect the new color
    - SCOPE FLAG: investigation confirmed this is FRONTEND-only; no backend change expected
    - VERIFY on BOTH desktop and mobile viewports
  phase: PHASE-013
  priority: P1
  story_points: 2
  execution_mode: agent
  dependencies: []
```

```yaml
story:
  id: US-1306
  title: "Migration V22: add description to boards (reversible)"
  description: "As the platform, I need a board description column so boards can carry a description."
  acceptance_criteria:
    - GIVEN Flyway at V21 WHEN V22 runs THEN boards gains a nullable description column (TEXT or VARCHAR) with no impact on existing rows
    - GIVEN a matching undo/down WHEN authored THEN it drops the column cleanly
    - VERIFY reversible and validated on a branch/non-prod DB before prod
  phase: PHASE-013
  priority: P1
  story_points: 1
  execution_mode: agent
  dependencies: []
```

```yaml
story:
  id: US-1307
  title: "Backend: board description in model, CreateBoardRequest, and BoardResponse"
  description: "As a user, I want to set and read a board description via the API."
  acceptance_criteria:
    - GIVEN Board.java and CreateBoardRequest.java WHEN updated THEN description is accepted on create and on board update (PATCH) and returned in BoardResponse
    - GIVEN an empty/omitted description WHEN creating a board THEN it is null/blank-tolerant (not required)
    - VERIFY JUnit tests cover create-with-description and update-description
  phase: PHASE-013
  priority: P1
  story_points: 2
  execution_mode: agent
  dependencies: [US-1306]
```

```yaml
story:
  id: US-1308
  title: "Richer create-board modal: themed UI + description field"
  description: "As a user, I want a create-board modal that matches the app theme and lets me add a description."
  acceptance_criteria:
    - GIVEN the create-board modal WHEN it opens THEN its styling matches the active theme tokens (not an unstyled default)
    - GIVEN the modal WHEN I fill name + description and submit THEN the board is created with the description (US-1307) and appears in the list
    - GIVEN the board detail/header WHEN a description exists THEN it is displayed
    - VERIFY on BOTH desktop and mobile viewports
  phase: PHASE-013
  priority: P1
  story_points: 2
  execution_mode: agent
  dependencies: [US-1307]
```

```yaml
story:
  id: US-1309
  title: "Extend theme token model to support gradient/texture backgrounds"
  description: "As the platform, I want the theme token model to express gradient/texture backgrounds, not only flat color vars."
  acceptance_criteria:
    - GIVEN theme.ts currently defines 3 flat-color themes via CSS vars WHEN extended THEN the token model supports a background that can be a flat color, a CSS gradient, or a texture, without breaking existing themes
    - GIVEN the themeStore WHEN a theme is applied THEN the new background token renders correctly across board/sidebar/modals
    - VERIFY existing 3 themes still render unchanged on BOTH desktop and mobile
  phase: PHASE-013
  priority: P2
  story_points: 3
  execution_mode: agent
  dependencies: []
```

```yaml
story:
  id: US-1310
  title: "Add several new gradient/texture themes"
  description: "As a user, I want more themes (gradients/textures) so I can personalize the app beyond 3 flat colors."
  acceptance_criteria:
    - GIVEN the extended token model (US-1309) WHEN new named themes are added THEN they appear in the ThemeSwitcher and apply on selection
    - GIVEN a selected theme WHEN the page reloads THEN it persists (themeStore)
    - VERIFY contrast remains readable (column headers, text) on BOTH desktop and mobile
  phase: PHASE-013
  priority: P2
  story_points: 2
  execution_mode: agent
  dependencies: [US-1309]
```

```yaml
story:
  id: US-1311
  title: "Migration V23: add color field to cards (reversible)"
  description: "As the platform, I need a card color field so cards can have a free-form color."
  acceptance_criteria:
    - GIVEN Flyway at V22 WHEN V23 runs THEN the cards/tasks table gains a nullable color column (VARCHAR, free-form hex) with no impact on existing rows
    - GIVEN a matching undo/down WHEN authored THEN it drops the column cleanly
    - VERIFY reversible and validated on a branch/non-prod DB before prod
  phase: PHASE-013
  priority: P2
  story_points: 1
  execution_mode: agent
  dependencies: []
```

```yaml
story:
  id: US-1312
  title: "Backend: card color in model, request DTO, and response"
  description: "As a user, I want to set and read a card's color via the API."
  acceptance_criteria:
    - GIVEN the card model + create/update request + response WHEN updated THEN a free-form color (hex) is accepted on PATCH and returned in the card response
    - GIVEN an invalid hex WHEN submitted THEN it is rejected with 422 (basic hex validation)
    - VERIFY JUnit tests cover set, clear (null), and invalid-hex
  phase: PHASE-013
  priority: P2
  story_points: 2
  execution_mode: agent
  dependencies: [US-1311]
```

```yaml
story:
  id: US-1313
  title: "Free-form hex/color-wheel picker for columns AND cards"
  description: "As a user, I want a free-form color picker (hex input + wheel) for both columns and cards, with the existing presets as suggestions."
  acceptance_criteria:
    - GIVEN a column WHEN I open its picker THEN I can choose any hex (wheel + hex input) OR a preset; choosing sends PATCH columns/{id} headerColor (no enum restriction — header_color is already free-form)
    - GIVEN a card WHEN I open its picker THEN I can choose any hex (wheel + hex input); choosing sends PATCH cards/{id} color (US-1312)
    - GIVEN the picker WHEN it renders THEN it reuses the theme token model from US-1309 for consistency
    - VERIFY on BOTH desktop and mobile viewports
  phase: PHASE-013
  priority: P2
  story_points: 3
  execution_mode: agent
  dependencies: [US-1305, US-1312, US-1309]
```

---

### PHASE-014 — Wave 3: Net-new subsystems (prod-safe migrations)

```yaml
story:
  id: US-1401
  title: "Migration V24: create modules/tags + card_modules join (reversible)"
  description: "As the platform, I need a user-defined modules/tags concept on cards (scoped per board) to power swimlane group-by-module."
  acceptance_criteria:
    - GIVEN Flyway at V23 WHEN V24 runs THEN a modules table (id, board_id FK, name, color NULL, created_at) and a card_modules join (card_id, module_id, composite PK) exist with appropriate indexes
    - GIVEN a matching undo/down WHEN authored THEN it drops join + table cleanly
    - VERIFY reversible and validated on a branch/non-prod DB before prod; no impact on existing cards
  phase: PHASE-014
  priority: P2
  story_points: 2
  execution_mode: agent
  dependencies: []
```

```yaml
story:
  id: US-1402
  title: "Backend: modules/tags CRUD + assign/unassign to cards"
  description: "As a user, I want to create modules/tags and assign them to cards via the API."
  acceptance_criteria:
    - GIVEN a board/workspace WHEN POST a module THEN it is created and listable; PATCH renames; DELETE removes (and detaches from cards)
    - GIVEN a card WHEN POST/DELETE card module assignment THEN the join row is added/removed and reflected in the card response
    - VERIFY JUnit tests cover create, assign, unassign, delete-cascade
  phase: PHASE-014
  priority: P2
  story_points: 3
  execution_mode: agent
  dependencies: [US-1401]
```

```yaml
story:
  id: US-1403
  title: "Backend: swimlane group-by config persisted per board"
  description: "As a user, I want my swimlane group-by choice (assignee/priority/module) persisted per board."
  acceptance_criteria:
    - GIVEN a board WHEN I set swimlane group-by to none|assignee|priority|module THEN the choice is persisted (board setting) and returned on board load
    - GIVEN group-by=module WHEN no modules exist THEN the API still returns a valid empty grouping (no error)
    - VERIFY JUnit tests cover each group-by value and persistence
  phase: PHASE-014
  priority: P2
  story_points: 2
  execution_mode: agent
  dependencies: [US-1402]
```

```yaml
story:
  id: US-1404
  title: "Frontend: real swimlanes — group-by rendering with DnD assignment"
  description: "As a user, I want real swimlanes that group cards by assignee, priority, or module, with drag-and-drop that updates the grouping."
  acceptance_criteria:
    - GIVEN a board WHEN I pick group-by (assignee/priority/module) in the header THEN ColumnList/Column render horizontal lanes (not just visual separators) per group value, with an 'Unassigned/None' lane
    - GIVEN a card WHEN I drag it across lanes THEN the corresponding attribute updates (assignee set, priority set, or module assigned via US-1402) and persists
    - GIVEN the group-by choice WHEN I reload THEN it is restored from the persisted board setting (US-1403)
    - VERIFY on BOTH desktop and mobile viewports
  phase: PHASE-014
  priority: P2
  story_points: 3
  execution_mode: agent
  dependencies: [US-1403]
```

```yaml
story:
  id: US-1405
  title: "Migration V25: create issues table (child of story-cards, reversible)"
  description: "As the platform, I need a lightweight issue entity that can exist independently and attach to a story-card."
  acceptance_criteria:
    - GIVEN Flyway at V24 WHEN V25 runs THEN an issues table exists (id, title, description NULL, status, created_by, parent_card_id NULL FK to cards, created_at, updated_at) with index on parent_card_id
    - GIVEN parent_card_id nullable WHEN an issue is created without a parent THEN it persists standalone
    - GIVEN a matching undo/down WHEN authored THEN it drops the table cleanly
    - VERIFY reversible and validated on a branch/non-prod DB before prod
  phase: PHASE-014
  priority: P2
  story_points: 2
  execution_mode: agent
  dependencies: []
```

```yaml
story:
  id: US-1406
  title: "Backend: issue CRUD + attach/detach to a story-card (manual close)"
  description: "As a user, I want to create issues independently, attach/detach them to a story-card, and close them manually."
  acceptance_criteria:
    - GIVEN POST /api/v1/issues WHEN called THEN a standalone issue is created; GET lists issues (with filter by parent and by unattached)
    - GIVEN PATCH issue parent WHEN setting/clearing parent_card_id THEN the issue attaches/detaches; a card response can include its attached issues
    - GIVEN PATCH issue status to closed WHEN called THEN it closes; closing a parent card does NOT auto-close child issues
    - VERIFY JUnit tests cover create, attach, detach, manual-close, and no-auto-close
  phase: PHASE-014
  priority: P2
  story_points: 3
  execution_mode: agent
  dependencies: [US-1405]
```

```yaml
story:
  id: US-1407
  title: "Frontend: create-issue UI, attach/detach UI, and issues view"
  description: "As a user, I want to create issues, attach/detach them to a story-card, and browse issues."
  acceptance_criteria:
    - GIVEN the issues view WHEN it loads THEN it lists issues with status and parent (if any) and supports creating a new issue
    - GIVEN a story-card detail WHEN I open it THEN I can attach an existing unattached issue or detach an attached one, and see its attached issues
    - GIVEN an issue WHEN I close it manually THEN its status updates; no card action auto-closes it
    - VERIFY on BOTH desktop and mobile viewports
  phase: PHASE-014
  priority: P2
  story_points: 3
  execution_mode: agent
  dependencies: [US-1406]
```

```yaml
story:
  id: US-1408
  title: "Migration V26: convert role strings to OWNER/ADMIN/MEMBER/VIEWER (reversible, data-safe)"
  description: "As the platform, I need a proper role enum on workspace and board membership, migrating existing bare-string roles without data loss."
  acceptance_criteria:
    - GIVEN workspace_members.role and board_members.role are free strings (default 'MEMBER') WHEN V26 runs THEN existing values are normalized/mapped to the OWNER/ADMIN/MEMBER/VIEWER set and a CHECK constraint (or enum) enforces the allowed values
    - GIVEN owners of a workspace/board WHEN migrated THEN they are assigned OWNER where determinable (e.g. workspace.owner_id), others default to MEMBER, VIEWER preserved
    - GIVEN a matching undo/down WHEN authored THEN it relaxes the constraint back to free string
    - VERIFY reversible and validated on a branch/non-prod DB before prod; zero membership rows lost
  phase: PHASE-014
  priority: P2
  story_points: 3
  execution_mode: agent
  dependencies: []
```

```yaml
story:
  id: US-1409
  title: "Backend: Role enum + central authorization policy across controllers"
  description: "As the platform, I want a single role enum and a central policy that enforces OWNER/ADMIN/MEMBER/VIEWER per-workspace and per-board across all controllers."
  acceptance_criteria:
    - GIVEN bare-string roles WHEN replaced THEN a Role enum (OWNER>ADMIN>MEMBER>VIEWER) is used in WorkspaceMember/BoardMember, and BoardAccessPolicy is extended (or a WorkspaceAccessPolicy added) into a central authorization policy
    - GIVEN each mutating controller (board, column, card, workspace, members, issues, modules) WHEN a request is made THEN the central policy is enforced (VIEWER read-only; MEMBER edit; ADMIN manage members; OWNER full incl. delete)
    - GIVEN existing primitives (BoardAccessPolicy, InvitationController) WHEN refactored THEN they layer on the new model without breaking current passing tests
    - VERIFY JUnit tests cover each role x action matrix for at least board + workspace scopes
  phase: PHASE-014
  priority: P2
  story_points: 3
  execution_mode: agent
  dependencies: [US-1408]
```

```yaml
story:
  id: US-1410
  title: "Backend: assign/authorize roles per workspace and per board (API)"
  description: "As an owner/admin, I want APIs to assign roles and authorize access to specific workspaces and boards."
  acceptance_criteria:
    - GIVEN a workspace/board WHEN PATCH a member's role THEN the role changes (enforced by US-1409: only OWNER/ADMIN may change roles; only OWNER may grant OWNER)
    - GIVEN a user WHEN granted/denied access to a specific board/workspace THEN membership rows reflect it and the central policy honors it immediately
    - VERIFY JUnit tests cover role-change authorization (allowed and forbidden cases)
  phase: PHASE-014
  priority: P2
  story_points: 2
  execution_mode: agent
  dependencies: [US-1409]
```

```yaml
story:
  id: US-1411
  title: "Frontend: user-management UI to view/assign roles and authorize access"
  description: "As an owner/admin, I want a UI to view members, assign OWNER/ADMIN/MEMBER/VIEWER roles, and authorize access to specific workspaces/boards."
  acceptance_criteria:
    - GIVEN a workspace/board WHEN I open user management THEN members and their roles are listed; I can change a role via a control (PATCH, US-1410)
    - GIVEN my own role lacks permission WHEN I view the surface THEN role controls are disabled/hidden per the central policy (no forbidden actions shown)
    - GIVEN a role change WHEN it succeeds THEN the affected user's capabilities update (e.g. VIEWER loses edit affordances)
    - VERIFY on BOTH desktop and mobile viewports
  phase: PHASE-014
  priority: P2
  story_points: 3
  execution_mode: agent
  dependencies: [US-1410, US-1304]
```

---

## Migration version ledger (continues V20)

| Version | Story | Purpose |
|---------|-------|---------|
| V21 | US-1207 | refresh_tokens store |
| V22 | US-1306 | boards.description |
| V23 | US-1311 | cards.color (free-form hex) |
| V24 | US-1401 | modules/tags + card_modules join |
| V25 | US-1405 | issues (child of story-cards) |
| V26 | US-1408 | role enum migration (workspace + board members) |

All Wave-3 migrations (V24–V26) require: reversible down script + validation on branch/non-prod DB before prod (live EC2 PostgreSQL).

## Scope-expansion flags

- **US-1301/US-1302 (#1):** Investigation-gated. Backend verified complete in this analysis, so US-1302 is expected to close as not-needed. If the agent finds a gap during US-1301, US-1302 activates and Wave-2 point total grows by up to 2.
- **US-1305/US-1313 (#6, #10-columns):** Investigation resolved DOWN — column color is already free-form server-side; these are frontend-only. No backend column-color story needed.

## Human-review gates

- Gate after PHASE-012 (auth/security-sensitive: verify refresh rotation + revocation before exposing).
- Gate after PHASE-013 (verify themes/colors render and no regression on live data).
- Gate before each PHASE-014 migration applies to prod (V24/V25/V26 validated on branch DB first).
