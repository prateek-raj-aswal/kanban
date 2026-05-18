# Kanban Life OS — Enhancement Plan

**Generated:** 2026-05-18  
**Total stories:** 35 across 11 phases  
**Execution waves:** 11 (max 7 parallel in wave 5)

---

## PRD Summary

Enhance the existing Kanban app to match the Kanban Life OS design reference. The current app handles core board mechanics but is missing workspace hierarchy, cross-board personal views, richer card model (multi-assignee, attachments, start date), visualization modes (timeline, calendar, swimlanes), and mobile layout.

### Non-Goals
- Drag-to-resize Gantt bars (read-only timeline only)
- Cloud/S3 file storage (local disk only)
- Native mobile app (responsive web only)
- Calendar event syncing

---

## Phase Summary

| Phase | Stories | Priority | Description |
|-------|---------|----------|-------------|
| PHASE-001 | US-101 to US-104 | P0 | Workspace data model + hierarchy |
| PHASE-002 | US-201 to US-204 | P0 | Multiple assignees + card start_date |
| PHASE-003 | US-301 to US-302 | P1 | File attachments (local disk) |
| PHASE-004 | US-401 to US-402 | P1 | Board starring |
| PHASE-005 | US-501 to US-503 | P1 | Smart views: Inbox, Today, Upcoming APIs |
| PHASE-006 | US-601 to US-606 | P1 | Workspace sidebar + switcher UI |
| PHASE-007 | US-701 to US-703 | P2 | Timeline (read-only Gantt) |
| PHASE-008 | US-801 to US-802 | P2 | Calendar view (monthly, read-only) |
| PHASE-009 | US-901 | P2 | Swimlane grouping |
| PHASE-010 | US-1001 to US-1005 | P2 | Card detail enhancements |
| PHASE-011 | US-1101 to US-1103 | P2 | Mobile layout |

---

## Execution Plan (Parallel Waves)

| Wave | Stories | Parallelism |
|------|---------|-------------|
| 1 | US-101 | 1 |
| 2 | US-102, US-201, US-401 | 3 |
| 3 | US-103, US-104, US-202, US-301, US-402 | 5 |
| 4 | US-203, US-204, US-302, US-601, US-801 | 5 |
| 5 | US-501, US-502, US-701, US-602, US-802, US-901, US-1001 | 7 |
| 6 | US-503, US-702, US-1002, US-1003, US-1004, US-1005 | 6 |
| 7 | US-603, US-703 | 2 |
| 8 | US-604, US-605, US-606 | 3 |
| 9 | US-1101 | 1 |
| 10 | US-1102 | 1 |
| 11 | US-1103 | 1 |

**Critical Path:** US-101 → US-102 → US-202 → US-203 → US-502 → US-503 → US-603 → US-604/US-605 → US-1101 → US-1102 → US-1103

---

## Full Story Backlog

### PHASE-001: Workspace Data Model and Hierarchy

**US-101** — Workspace migration: create workspaces table and add workspace_id to boards  
- Flyway V11: workspaces table (id, name, description, owner_id, created_at, updated_at, deleted_at)
- boards gets nullable workspace_id FK
- No data loss on existing boards

**US-102** — Workspace entity, repository, and service  
- POST /api/v1/workspaces → 201 with workspace JSON
- GET /api/v1/workspaces → user's workspaces only
- DELETE /api/v1/workspaces/{id} → soft delete (owner only)

**US-103** — Workspace membership: add/remove members API  
- POST /api/v1/workspaces/{id}/members {email}
- DELETE /api/v1/workspaces/{id}/members/{userId}
- GET /api/v1/workspaces/{id}/members

**US-104** — Assign board to workspace  
- Board creation accepts optional workspaceId
- BoardResponse includes workspaceId
- GET /api/v1/workspaces/{id}/boards (members only)

---

### PHASE-002: Multiple Assignees and Card start_date

**US-201** — Migration: card_assignees join table + start_date column  
- Flyway V12: card_assignees (card_id, user_id, PK composite)
- cards gets start_date DATE nullable
- Existing assignee_id data migrated to card_assignees
- assignee_id column dropped

**US-202** — Card model: replace assigneeId with assignees list + startDate  
- CardResponse: "assignees": [{id, email, displayName}], "startDate": nullable
- assigneeId field removed (breaking change)

**US-203** — Add/remove assignee API  
- POST /api/v1/cards/{id}/assignees {userId} → 200 or 409 (duplicate)
- DELETE /api/v1/cards/{id}/assignees/{userId} → 200

**US-204** — Update card startDate via PATCH  
- PATCH /api/v1/cards/{id} accepts startDate
- Validation: startDate must not be after dueDate (422 otherwise)
- startDate: null clears the field

---

### PHASE-003: File Attachments

**US-301** — Attachment migration  
- Flyway V13: attachments (id, card_id, filename, file_path, file_size, mime_type, uploaded_by, created_at)
- Index on card_id

**US-302** — Attachment upload API  
- POST /api/v1/cards/{id}/attachments (multipart/form-data)
- Max 10 MB; blocks executables (415)
- Local disk storage at configurable app.upload-dir
- Download via /api/v1/files/{filename}
- GET /api/v1/cards/{id}/attachments list
- DELETE /api/v1/cards/{id}/attachments/{attachmentId}

---

### PHASE-004: Board Starring

**US-401** — Board stars migration  
- Flyway V14: board_stars (user_id, board_id, created_at, PK composite)

**US-402** — Board star/unstar API  
- POST /api/v1/boards/{id}/star → idempotent, {starred: true}
- DELETE /api/v1/boards/{id}/star → {starred: false}
- GET /api/v1/boards/starred → starred boards list
- BoardResponse includes starred: boolean

---

### PHASE-005: Smart Views

**US-501** — Inbox API  
- GET /api/v1/me/inbox → paginated cards where user is assignee
- Includes boardId, boardName, columnName, title, priority, dueDate, assignees

**US-502** — Today API  
- GET /api/v1/me/today → cards where due_date = today (UTC)

**US-503** — Upcoming API  
- GET /api/v1/me/upcoming → cards due tomorrow through today+7, sorted by dueDate

---

### PHASE-006: Workspace Sidebar and Switcher UI

**US-601** — WorkspaceSwitcher component  
- Shows current workspace name + avatar in sidebar header
- Dropdown lists user's workspaces; selection changes context + reloads board list

**US-602** — Sidebar: starred boards section  
- "Starred" section above board list; hidden when empty
- Star icon per board; click unstars (optimistic update)

**US-603** — Sidebar: smart view nav items with counts  
- Inbox/Today/Upcoming with badge counts from APIs
- Click routes to /inbox, /today, /upcoming

**US-604** — InboxView page (/inbox)  
- CardListItem per card: title, priority dot, board, column, due date, avatars
- Click opens CardModal; infinite scroll; empty state

**US-605** — TodayView (/today) and UpcomingView (/upcoming)  
- Cards grouped by date label; click opens CardModal; empty state

**US-606** — Sidebar: boards grouped under workspace with task count  
- Workspace headings; boards indented below; task count badge
- Boards with no workspace under "No workspace" section

---

### PHASE-007: Timeline View

**US-701** — Timeline data endpoint  
- GET /api/v1/boards/{id}/timeline → cards with startDate, dueDate, labels, assignees, columnName
- Excludes cards with neither date

**US-702** — TimelineView: horizontal date grid  
- CSS Grid, 28px per day column, left panel 200px sticky
- Month headers, "today" vertical line in accent color
- Spans earliest→latest date ±7 days

**US-703** — Timeline task bars  
- Bar color from first label color (fallback: priority color)
- Point diamond for cards with only dueDate
- Click → CardModal; hover → tooltip (title, avatars, dates)

---

### PHASE-008: Calendar View

**US-801** — CalendarView: monthly grid  
- /boards/{id}/calendar; 7-column month grid
- Cards as chips on due-date cells; max 2 visible + "+N more" popover
- Today's cell highlighted

**US-802** — Month navigation + view toggle  
- Prev/Next arrows; month label "Month YYYY"
- View toggle (Board/List/Timeline/Calendar) activates correct view

---

### PHASE-009: Swimlane Grouping

**US-901** — Swimlane toggle  
- "Group by label" toggle in board header
- Cards grouped by label within each column; "Unlabeled" lane at bottom
- DnD still works within lanes; state in Zustand (not URL-persistent)

---

### PHASE-010: Card Detail Enhancements

**US-1001** — Multi-assignee avatar stack display  
- Stacked avatars, max 3 + "+N"; hover shows name/email
- No reference to old assigneeId field

**US-1002** — Assignee picker (add/remove)  
- Dropdown with board member search; check/uncheck fires API
- Non-members see read-only view

**US-1003** — Attachment upload UI  
- "Attach file" → system picker → POST multipart
- List with filename, size, uploader, download link, delete
- Upload progress spinner; error toast on failure

**US-1004** — Copy-link button  
- Chain-link icon → navigator.clipboard.writeText(/boards/{id}?card={cardId})
- 2s checkmark feedback; fallback select-input on non-HTTPS
- URL loads → CardModal auto-opens

**US-1005** — Board star toggle on board header + BoardCard  
- Star icon in board header + board list cards
- Optimistic toggle; consistent with sidebar starred section

---

### PHASE-011: Mobile Layout

**US-1101** — Mobile bottom navigation bar  
- Fixed bottom nav at <768px: Board, Today, Timeline, Inbox
- Hidden on desktop; content area has padding-bottom = nav height

**US-1102** — Mobile board: horizontal scrollable column tabs  
- Column tabs at top at <768px; only active column's cards shown
- Snap-scroll to active tab; desktop layout unchanged

**US-1103** — Mobile card layout: responsive CardItem and CardModal  
- CardItem full-width on mobile; touch-friendly
- CardModal = bottom sheet on mobile (full viewport height, scrollable)
- Desktop unchanged

---

## Implementation Notes

- **Flyway versioning:** V11=workspaces, V12=card_assignees+start_date, V13=attachments, V14=board_stars
- **Breaking change US-202:** assigneeId removed from CardResponse — update all frontend references in same story
- **Upload storage:** `app.upload-dir` property (default `./uploads`); served via `/api/v1/files/{filename}`
- **Timeline rendering:** Pure CSS Grid, no chart library; 28px/day columns
- **Mobile breakpoint:** `@media (max-width: 767px)` only — no JS viewport detection
- **Assignee filter:** After US-202, filter-by-assignee queries card_assignees join table
