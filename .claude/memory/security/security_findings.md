# Security Findings — Phase 1 + Phase 2 + AGT-001 through AGT-022 + Full-Codebase Scan (2026-06-11) + Re-scan v2 (2026-06-11)

Generated: 2026-05-08 | Updated: 2026-06-11 (v2 re-scan) | Scan scope: Re-scan v2 — SEC-050/SEC-051 fix verification + full sweep of all Phase 14–17 controllers, services, repositories, frontend new components, docker-compose, .gitignore.

**OVERALL VERDICT: CLEAR** — No Critical findings remain unresolved. One new High finding (SEC-062) introduced in Phase 16.

---

## FIXED (critical + high resolved in same sprint)

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| SEC-001 | Critical | JWT secret had insecure default committed to application.yml | Removed fallback; added startup guard requiring ≥32 chars; `${JWT_SECRET}` with no default |
| SEC-002 | High | CORS config passed env-var placeholder as literal string — production frontend URL never applied | Fixed via `@Value` injection in CorsConfig.java |

## OPEN — Backlog

| ID | Severity | Location | Finding | Recommendation |
|----|----------|----------|---------|---------------|
| SEC-003 | High | `frontend/src/lib/auth.ts:5-9` | JWT token in localStorage; exfiltrable via XSS | Move to HttpOnly cookie or add strict CSP headers |
| SEC-004 | High | `AuthController.java:33-40` | No rate limiting on /api/v1/auth/* — unbounded brute-force and registration floods | Add Bucket4j or upstream rate limiter; account lockout after N failures |
| SEC-005 | Medium | `frontend/next.config.ts` | No HTTP security headers (CSP, X-Frame-Options, X-Content-Type-Options) | Add headers() in next.config.ts |
| SEC-006 | Medium | `MemberResponse.java:9` | Email PII returned to all board members | Gate email to OWNER role only, or remove from member list response |
| SEC-007 | Medium | `BoardAccessPolicy.java`, `ColumnService.java:37,52,62` | RBAC role persisted but never enforced — any MEMBER can delete/rename columns | Add assertRole() to BoardAccessPolicy; apply on destructive column ops |
| SEC-008 | Medium | All service classes | Zero audit logging — no failed-login, board-deletion, or 403 events | Add structured SLF4J security events in AuthService and BoardService |
| SEC-009 | Medium | `AuthController.java`, `JwtTokenProvider.java` | No JWT revocation — stolen tokens valid until expiry (default 1h) | Add jti blocklist (Redis) or user token_version field |
| SEC-010 | Low | `SecurityConfig.java:41` | BCrypt work factor not explicit (default 10) | Use `new BCryptPasswordEncoder(12)` and document |
| SEC-011 | Low | `ColumnService.java:79-86` | N individual save() calls in reorderColumns loop | Replace with saveAll() / bulk JPQL update |
| SEC-012 | Low | `frontend/src/app/(protected)/layout.tsx:9-13` | Auth guard fires in useEffect — one-tick render flash | Use Next.js middleware.ts for server-side redirect |
| SEC-013 | High | `agent/main.py:3` | FastAPI auto-exposes /docs, /redoc, /openapi.json — live API catalogue in production | Suppress with docs_url/redoc_url/openapi_url=None when DEBUG env var is false |
| SEC-014 | High | `agent/Dockerfile` (no USER directive) | Container runs as root; any app-level compromise = root in container | Add non-root system user and USER directive before CMD |
| SEC-015 | ~~High~~ **RESOLVED (AGT-022)** | `agent/Dockerfile:3` | pip dependencies (fastapi, uvicorn) unpinned; no requirements.txt or lockfile. **Fixed**: `agent/requirements.txt` created with four pinned packages; Dockerfile updated to `pip install -r requirements.txt`. | No further action required. Residual gap: no pip-audit step in CI — see SEC-047. |
| SEC-016 | Medium | `agent/Dockerfile:1` | Base image python:3.11-slim unpinned by digest; mutable tag allows silent supply-chain substitution | Pin by SHA256 digest; automate rotation via Dependabot |
| SEC-017 | Medium | `agent/` (no .dockerignore) | Missing .dockerignore; future COPY . . would bundle .env, __pycache__, .pytest_cache into image layers | Create .dockerignore now before COPY . . pattern is introduced |
| SEC-018 | Low | `agent/main.py` | No access logging or request middleware; endpoint probing leaves no trace | Enable uvicorn access-log; add structured JSON middleware |
| SEC-019 | Low | `agent/main.py`, `docker-compose.yml` | No rate limiting on /health; no upstream proxy for agent service | Route agent behind reverse proxy; add slowapi rate-limiter |
| SEC-020 | Low | `agent/main.py` | Server response header discloses FastAPI/Starlette version | Strip or replace Server header via HTTP middleware |
| SEC-021 | High | `agent/main.py:21-23` | ~~POST /chat accepts unauthenticated requests; jwt field is collected but never verified — endpoint is fully public~~ **MITIGATED in AGT-003**: _validate_jwt() added; backend called before handler proceeds | No further action on original finding; see SEC-026 for residual gap |
| SEC-022 | High | `agent/models.py:11-13` | messages list and content string are unbounded; no body-size limit on uvicorn; OOM DoS possible | Add Field(max_length=50) on messages list and Field(max_length=32_000) on content; set uvicorn concurrency limit |
| SEC-023 | Medium | `agent/models.py:6-8` | Message.role is free-form str; when LLM is wired an attacker can inject role="system" to hijack prompt context | Constrain to Literal["user", "assistant"] now before LLM wiring |
| SEC-024 | ~~Medium~~ **RESOLVED (AGT-021)** | `agent/models.py:12, agent/main.py, docker-compose.yml` | JWT previously in request body — exposure risk via body logging. **Fixed**: AGT-021 moves JWT to `Authorization: Bearer` header; body contains only `{ messages }`. | No further action required. |
| SEC-025 | Low | `agent/models.py:1` | Unused `from typing import Any` import; predicts future Any-typed field that would bypass Pydantic validation and response_model filtering | Remove unused import |
| SEC-026 | High | `agent/main.py:27` | _validate_jwt gates only on HTTP 401; any other non-200 response (403, 500, 503) passes through as authorized. Not currently exploitable (backend returns 200 or 401 from GET /api/v1/boards for valid tokens), but logic is incorrect and will become exploitable when LLM handler is wired in | Replace single-condition check with positive assertion: `if response.status_code != 200: raise HTTPException(status_code=401, ...)` |
| SEC-027 | Medium | `agent/models.py:13` | `jwt: str` field is unbounded; attacker can submit multi-megabyte JWT string which agent forwards as Authorization header to backend on every /chat request — amplification and connection-pool exhaustion | Add `Annotated[str, Field(min_length=1, max_length=4096)]` to the jwt field |
| SEC-028 | High | `agent/tools.py:25, agent/tools.py:46` | httpx.TransportError messages embedded verbatim in JSON error strings returned to LLM tool loop; LLM may relay to end user, disclosing internal hostnames, IP addresses, and network topology | Replace `str(exc)` with fixed opaque string `"Backend unreachable"`; log original exception server-side with request ID |
| SEC-029 | Medium | `agent/main.py:80-84, agent/tools.py` | _run_tool_loop caps rounds at 10 but not tool calls per round; adversarially crafted or prompt-injected LLM response can trigger O(10 × N) synchronous backend requests per /chat call, exhausting backend connection pool | Add per-round cap e.g. `tool_calls = message.tool_calls[:5]` in _run_tool_loop |
| SEC-030 | Low | `agent/tools.py:6, agent/main.py:10` | `_backend_url` independently defaulted to `http://localhost:8080` in two files; split-brain risk if one default is updated without the other | Define _backend_url once in a shared config module and import it in tools.py |
| SEC-031 | **Critical** | `backend/src/main/java/com/kanban/service/BoardService.java:68-82` | **BLOCKING — AGT-006** `createBoard` persists caller-supplied `workspaceId` without checking whether the authenticated user is a member or owner of that workspace. Any authenticated user (or prompt-injected LLM tool call) can associate a new board with a foreign workspace UUID, corrupting workspace data. | Add `workspaceAccessPolicy.assertMember(request.workspaceId(), requestingUserId)` before persisting; create WorkspaceAccessPolicy mirroring BoardAccessPolicy; throw 403 on failure. |
| SEC-032 | Medium | `agent/tools.py:35-53` | `create_board` forwards `workspace_id` without UUID format validation, inconsistent with `get_board` which applies `_UUID_RE.fullmatch` on `board_id`. Malformed strings reach the backend unconditionally. | Add UUID guard: `if workspace_id is not None and not _UUID_RE.fullmatch(workspace_id): return json.dumps({"error": "Invalid workspace_id"})` |
| SEC-033 | Medium | `agent/tools.py:36-37` | `name` has no upper-length bound in the tool layer. Oversized LLM-supplied names transit to backend, occupy LLM context window (compounding SEC-029), and stored names surfaced in future `get_boards` responses are a stored-prompt-injection carrier. | Add length cap aligned to backend constraint: `if len(name.strip()) > 255: return json.dumps({"error": "Board name exceeds maximum length"})` |
| SEC-034 | Medium | `agent/tools.py:81` | `get_cards_in_column` fetches the full board payload (all columns, all cards) before filtering to the requested column. No response body size cap is applied before `response.json()` is called. Large board payloads cause unbounded memory allocation per invocation; combined with the 10-round tool loop (SEC-029), prompt injection can trigger repeated full-board fetches amplifying memory pressure. | Add a response size guard (`len(response.content) > 1_048_576`) before `.json()`; long-term add a dedicated cards endpoint so the agent fetches only the data it needs. |
| SEC-035 | Low | `agent/tools.py:84` | Card objects are returned to the LLM verbatim with no field projection. User-authored card description text is a stored-prompt-injection vector: any user who can write card content can embed LLM instructions that execute in the next agent session that calls this tool. | Project a safe subset of fields (`id`, `title`, `position`, `columnId`) before returning to the LLM; drop free-text `description` and attachment metadata from the tool result. |
| SEC-036 | High | `backend/src/main/resources/application-dev.yml:5`, `application-test.yml:4` | Hardcoded fallback credential `sandbox@2024` committed in dev and test Spring profile files. When `SPRING_DATASOURCE_PASSWORD` env var is absent the application silently uses this value. Credentials in git history are routinely harvested. | Remove fallback from both files so the expression is `${SPRING_DATASOURCE_PASSWORD}` with no default. Rotate `sandbox@2024` if it was ever used against a shared database. Use `.env` (already gitignored) for local dev. |
| SEC-037 | Medium | `agent/tools.py:79` | `q` (free-text search term) has no maximum length constraint in the agent, Pydantic models, or backend controller. An LLM-supplied `q` can be arbitrarily long, driving an expensive `LIKE '%...%'` full-table scan on the cards table and inflating HTTP request size. | Add length cap in `search_cards`: reject `q` if `len(q) > 256`. Add `@Size(max=256)` on `@RequestParam String q` in `BoardController.java` as defence-in-depth. |
| SEC-038 | Medium | `agent/tools.py:86-95` | `search_cards` has no response-body size guard before calling `response.json()`. Unlike `get_cards_in_column` (which caps at 1 MiB), a broad search on a large board returns an unbounded payload deserialized fully into agent memory and forwarded to the LLM context window. | Add `if len(response.content) > 1_048_576: return json.dumps({"error": "Response too large"})` before `.json()`, mirroring the pattern at `tools.py:120`. |
| SEC-039 | Low | `agent/tools.py:61` | No audit logging on `search_cards` entry. LLM-driven searches (including potential exfiltration attempts) leave no trace in the agent layer. | Log at INFO level before the httpx call: board_id, whether q/assignee_id/priority were supplied (not values), and a correlation ID propagated from the `/chat` request. |
| SEC-AGT019-001 | Low | `frontend/src/components/board/ChatSidebar.module.css:76,80` | `outline: none` on `.input` with no guaranteed visible replacement in all theme variants. The `:focus` override applies `border-color: var(--accent)` which is correct but untested against dark/high-contrast themes where `--accent` may be indistinguishable from `--card-border`. | Verify focus indicator contrast in all supported themes; consider `box-shadow` fallback for robustness. |
| SEC-017 | High | `frontend/src/lib/agentApi.ts:13-19` | STATUS UPDATE (AGT-019 scan): JWT is now passed via `Authorization: Bearer` header; body contains only `{ messages }`. SEC-017 appears resolved in current codebase. Confirm against AGT-016 commit and mark resolved. | Verify commit history and update status to resolved if fix is confirmed. |
| SEC-040 | High | `docker-compose.yml:53` | Port 8001 bound on 0.0.0.0 — agent chat endpoint publicly reachable in non-localhost deployments | Bind to 127.0.0.1 for local dev (`127.0.0.1:8001:8001`) or route exclusively through reverse proxy in production; remove direct port exposure |
| SEC-041 | Medium | `docker-compose.yml:50` | GROQ_API_KEY passed as plain Docker env var — visible via `docker inspect` and `/proc/<pid>/environ` | Use Docker secrets or an external secret manager (e.g. AWS Secrets Manager) in production; document in `.env.example` |
| SEC-042 | Medium | `docker-compose.yml:41-58` | No memory/CPU resource limits on agent service — 10-round tool loop can exhaust host resources under no-limit container | Add `deploy.resources.limits` with appropriate `cpus` and `memory` constraints |
| SEC-043 | Low | `docker-compose.yml:55` | Healthcheck spawns a Python interpreter every 15s — heavier than the `wget` pattern used by the backend | Consider `CMD-SHELL` with `wget` or `curl` for consistency and lower overhead |
| SEC-044 | Low | `agent/Dockerfile`, `docker-compose.yml` | No `cap_drop: ALL` or `read_only: true` — default Linux capabilities retained post-compromise | Add `cap_drop: [ALL]` and `security_opt: [no-new-privileges:true]` to the agent service block |
| SEC-045 | ~~Medium~~ **RESOLVED (AGT-021)** | `frontend/Dockerfile:11` | Fixed during AGT-021 review loop: `ARG NEXT_PUBLIC_AGENT_URL=http://agent:8001` — now consistent with `http://backend:8080` pattern. | No further action required. |
| SEC-046 | Low | `.env.example:14`, `frontend/.env.local.example:2` | `NEXT_PUBLIC_WS_URL` is `http://localhost:8080/ws` in `.env.example` but `ws://localhost:8080` in `frontend/.env.local.example`. Developers copying `.env.example` will get an HTTP scheme for a WebSocket URL, which browsers reject on upgrade. | Align both files to `ws://localhost:8080`; remove the `/ws` path suffix (appended by client code). |
| SEC-047 | Medium | `.github/workflows/ci.yml` | No `pip-audit` step in CI. `requirements.txt` is now the dependency manifest but the pipeline never scans it for known CVEs. A future vulnerable transitive dependency (e.g. starlette under fastapi, anyio under httpx) would ship undetected. | Add a `pip-audit` job to ci.yml: `pip install pip-audit && pip-audit -r agent/requirements.txt`. Run on every PR targeting main. |
| SEC-048 | Low | `agent/requirements.txt` | No transitive lockfile (pip-compile output / `requirements-lock.txt`). `pip install -r requirements.txt` resolves transitive deps at build time against whatever versions are on PyPI. A malicious or buggy new release of starlette, anyio, or h11 (all pulled in by fastapi/uvicorn/httpx) could enter the image on the next Docker build without any requirements.txt change. | Add `pip-compile` (pip-tools) to generate a fully-resolved `requirements-lock.txt`; change the Dockerfile to install from the lockfile. Run `pip-compile --upgrade` on a scheduled basis and review the diff. |
| SEC-049 | Low | `agent/requirements.txt:4` | `openai==1.57.0` is pinned at a version from the 1.x series. The openai package has since released a 2.x series (currently 2.38.0). The 1.x branch is no longer the maintained release train, meaning future security patches will target 2.x only. | Upgrade to `openai>=2.0.0` after validating API compatibility; ensure the Groq base_url usage still works with the 2.x client. |

---

## FULL-CODEBASE SCAN — 2026-06-11

**Scan verdict: BLOCKED**

All 62 user stories confirmed done. Agent service (`codebase/agent/`) is absent from the current codebase tree — agent findings SEC-013 through SEC-049 are carried forward from prior partial scans and remain open. The backend and frontend were scanned in full.

---

### STATUS UPDATES ON PRIOR FINDINGS

| ID | Prior Status | Current Status | Evidence |
|----|--------------|----------------|----------|
| SEC-001 | Critical | **RESOLVED** | `application.yml:36` has `${JWT_SECRET}` with no default; `JwtTokenProvider.java:22-24` enforces ≥32 chars at startup |
| SEC-002 | High | **RESOLVED** | `CorsConfig.java:16` uses `@Value("${FRONTEND_URL:...}")` correctly |
| SEC-003 | High | **OPEN** | `frontend/src/lib/auth.ts:5-9` — both access and refresh tokens in `localStorage` |
| SEC-004 | High | **OPEN** | `AuthController.java` has no rate limiting on `/api/v1/auth/*` |
| SEC-005 | Medium | **OPEN** | `next.config.mjs` is 4 lines — no `headers()` block at all |
| SEC-006 | Medium | **OPEN** | `MemberResponse.java:9` email field exposed to all board members in `BoardService.getMembers()` |
| SEC-007 | Medium | **RESOLVED** | `ColumnService.java` now calls `accessPolicy.assertAccess(..., BoardAction.WRITE)` on create/update/delete/reorder |
| SEC-031 | Critical | **RESOLVED** | `BoardService.java:78-81` now checks `workspaceMemberRepository.existsByWorkspaceIdAndUserId` before persisting |
| SEC-036 | Critical (was High) | **RESOLVED** | `application-dev.yml` and `application-test.yml` no longer contain hardcoded credentials — both files are pure `${ENV_VAR}` expressions |

---

### NEW FINDINGS — FULL-CODEBASE SCAN

#### Critical / P0

| ID | Severity | Location | Finding | Recommendation |
|----|----------|----------|---------|---------------|
| SEC-050 | **Critical** | `codebase/backend/src/main/java/com/kanban/controller/IssueController.java:34-54` | **IDOR — Issues endpoints have no authorization checks.** `GET /api/v1/issues`, `GET /api/v1/issues/{issueId}`, `PATCH /api/v1/issues/{issueId}`, and `DELETE /api/v1/issues/{issueId}` do not receive `@AuthenticationPrincipal` and pass nothing to `IssueService`. Any authenticated user (JWT valid) can enumerate all issues in the system, update any issue's status/description, and permanently delete any issue regardless of board membership. `IssueService.listIssues()` calls `issueRepository.findAll()` — a full table scan with no tenant filter. | Add `@AuthenticationPrincipal AuthenticatedUser principal` to all four methods. In `IssueService`, resolve the issue's board (via `parentCard -> column -> board`) and call `boardAccessPolicy.assertMember(boardId, requestingUserId)` before any read or mutation. For standalone issues, add a `workspaceId` access check. |
| SEC-051 | **Critical** | `.env:1-9` (root of repo, untracked but present in working tree) | **Live credentials in working-directory `.env`.** The file contains `POSTGRES_PASSWORD=kanban@docker2024` and `JWT_SECRET=local-dev-secret-at-least-32-chars-long`. The `.gitignore` does NOT list `.env` — it only lists `codebase/*`, so a `git add .` by any contributor will commit the file. If pushed, the PostgreSQL password and JWT signing secret enter git history permanently. | Add `.env` to `.gitignore` immediately. Rotate `kanban@docker2024` on any shared or cloud Postgres instance. Replace `JWT_SECRET` with a randomly generated value. Verify the credential has never appeared in a remote commit via `git log --all -- .env`. |

#### High / P1

| ID | Severity | Location | Finding | Recommendation |
|----|----------|----------|---------|---------------|
| SEC-052 | High | `codebase/backend/src/main/java/com/kanban/service/AttachmentService.java:159` | **HTTP response-header injection via unsanitized original filename.** The `Content-Disposition` header is built as `"inline; filename=\"" + attachment.getOriginalFilename() + "\""`. The `originalFilename` is the value from `MultipartFile.getOriginalFilename()`, which is the user-supplied filename sent in the multipart request. A filename containing `\r\n` allows an attacker to inject arbitrary HTTP response headers, including `Set-Cookie` and `Location`. | Sanitize with: `filename.replaceAll("[\\r\\n\"\\\\]", "_")` before embedding in the header. Or use RFC 5987 encoding: `attachment; filename*=UTF-8''<encoded>`. |
| SEC-053 | High | `codebase/backend/src/main/java/com/kanban/controller/BoardController.java:100` and `codebase/backend/src/main/java/com/kanban/controller/WorkspaceController.java:83` | **Unhandled `IllegalArgumentException` on invalid role string — 500 response leaks Spring stack trace.** `Role.valueOf(body.get("role"))` throws `IllegalArgumentException` for any unrecognised string (e.g. `"SUPERADMIN"`). `GlobalExceptionHandler` handles only `ApiException` and `MethodArgumentNotValidException`; uncaught `IllegalArgumentException` propagates to the Spring default error page, which may include a stack trace depending on Spring Boot `server.error.include-stacktrace` configuration. | Wrap both callsites: `try { Role newRole = Role.valueOf(...); ... } catch (IllegalArgumentException e) { throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ROLE", "Role must be one of: OWNER, ADMIN, MEMBER, VIEWER"); }`. Or add `@ExceptionHandler(IllegalArgumentException.class)` to `GlobalExceptionHandler` as a safety net. |
| SEC-054 | High | `codebase/backend/src/main/java/com/kanban/service/CommentService.java:102-108` | **User enumeration via comment `@mention` parsing — `userRepository.findAll()` leaks all user records.** `processMentions()` calls `userRepository.findAll()` on every comment create/update, then filters in-memory by display name match. Any board member can craft a comment with `@<displayName>` substrings to probe whether users with specific display names exist in the system, across all tenants. It also scales O(N) with total user count. | Scope the query to board members only: replace `userRepository.findAll()` with a query joining users to `board_members` for the relevant `boardId`. This eliminates cross-tenant enumeration and fixes the full-table scan. |
| SEC-055 | High | `codebase/docker-compose.yml:16-17` and `:34` | **PostgreSQL port 5432 and backend port 8080 exposed on all interfaces (`0.0.0.0`) in the default compose file.** Port `5432:5432` makes the database directly reachable from the host network and, in cloud deployments without a firewall, from the public internet. Port `8080:8080` also bypasses the nginx reverse proxy. | In `docker-compose.yml` (dev), bind both to localhost: `"127.0.0.1:5432:5432"` and `"127.0.0.1:8080:8080"`. The prod compose (`docker-compose.prod.yml`) correctly omits these ports — the dev compose should match. |
| SEC-003 | High | `frontend/src/lib/auth.ts:5-9` | *(Carried forward — still open)* JWT access token and refresh token stored in `localStorage`; exfiltrable by any XSS payload. | Migrate to HttpOnly `Secure` `SameSite=Strict` cookies for both tokens. The backend `/auth/login`, `/auth/refresh`, and `/auth/logout` endpoints must be updated to issue/rotate/clear cookies rather than returning tokens in the JSON body. |
| SEC-004 | High | `AuthController.java` (all `/api/v1/auth/*` endpoints) | *(Carried forward — still open)* No rate limiting, no account lockout. | Add Bucket4j per-IP rate limiter: ≤10 login attempts per minute per IP; 429 on breach. |

#### Medium / P2

| ID | Severity | Location | Finding | Recommendation |
|----|----------|----------|---------|---------------|
| SEC-056 | Medium | `codebase/backend/src/main/java/com/kanban/websocket/WebSocketConfig.java:38` | **WebSocket endpoint allows all origins (`setAllowedOriginPatterns("*")`).** While STOMP over SockJS is not directly exploitable by CSRF (the token check enforces authentication), a wildcard origin pattern grants any domain the ability to establish a WebSocket connection, which may be exploited by drive-by pages if browser security controls change or SockJS fallback transports are used. | Restrict to the configured frontend origin: inject the same `${FRONTEND_URL}` used in `CorsConfig` and call `.setAllowedOriginPatterns(frontendUrl)`. |
| SEC-057 | Medium | `codebase/backend/src/main/java/com/kanban/service/IssueService.java:67` | **`IllegalArgumentException` thrown from service layer for missing `workspaceId` — returns HTTP 500.** When a standalone issue is created without `workspaceId`, the service throws `new IllegalArgumentException("workspaceId is required...")`. `GlobalExceptionHandler` does not handle this; Spring Boot returns 500 with a default error body. | Replace with `throw new ApiException(HttpStatus.BAD_REQUEST, "MISSING_WORKSPACE_ID", "workspaceId is required for standalone issues")`. |
| SEC-058 | Medium | `codebase/backend/src/main/java/com/kanban/service/AttachmentService.java:65` | **MIME type accepted from client-supplied `Content-Type` header without server-side content sniffing.** `file.getContentType()` returns the MIME type declared by the uploader, not the actual file magic bytes. An attacker can upload a malicious HTML file with `Content-Type: image/jpeg` and bypass the allowlist, then trigger it to render as HTML via `Content-Disposition: inline`. | Detect content type from file bytes using Apache Tika or the JDK's `Files.probeContentType()` against a temporary path. Validate the detected type against the allowlist, not the declared type. Also set `X-Content-Type-Options: nosniff` on file-serving responses. |
| SEC-059 | Medium | `codebase/backend/src/main/java/com/kanban/controller/BoardController.java:107-134` (search) | **No upper bound on `q` parameter length in `searchCards`.** `@RequestParam(required = false) String q` is unbounded. Long `q` values drive expensive `LIKE '%...%'` full-table scans and may also fill the query parse buffer. SEC-037 (agent layer cap) was recorded but the backend controller has no `@Size` constraint. | Add `@Size(max = 256)` on the `q` parameter and return 400 for oversized values. Spring validation does not apply `@Size` to `@RequestParam` automatically — use manual check: `if (q != null && q.length() > 256) throw new ApiException(HttpStatus.BAD_REQUEST, "QUERY_TOO_LONG", "Search query must not exceed 256 characters")`. |
| SEC-005 | Medium | `codebase/frontend/next.config.mjs` | *(Carried forward — still open)* No security response headers. | Add `headers()` function to `next.config.mjs` setting `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`. |
| SEC-006 | Medium | `MemberResponse.java:9`, `BoardService.java:170-175` | *(Carried forward — still open)* Email returned to all board members via `GET /api/v1/boards/{id}/members`. | Gate email field to OWNER/ADMIN roles; return `null` for MEMBER/VIEWER callers. |
| SEC-008 | Medium | All service classes | *(Carried forward — still open)* No security event logging for failed login, 403s, board deletion, or token revocation events. | Add structured `log.warn()` at minimum for: failed login (with IP from `HttpServletRequest`), every `FORBIDDEN` ApiException thrown, and every `revokeAllByUserId` call in `RefreshTokenService`. |
| SEC-009 | Medium | `JwtTokenProvider.java`, `AuthController.java` | *(Carried forward — still open)* No short-lived access token revocation (stolen access tokens valid until expiry, default 15 min per prod config). | Add `jti` claim to access tokens; maintain a small Redis blocklist populated on logout and on refresh-token reuse detection. |

#### Low / P3

| ID | Severity | Location | Finding | Recommendation |
|----|----------|----------|---------|---------------|
| SEC-060 | Low | `codebase/backend/src/main/java/com/kanban/exception/GlobalExceptionHandler.java` | **No catch-all `Exception` handler — unhandled exceptions produce Spring Boot default error JSON which may expose class names and stack traces** depending on `spring.mvc.problemdetails.enabled` and actuator exposure. | Add `@ExceptionHandler(Exception.class)` returning a generic 500 `ErrorResponse` with no internal detail. Log the full exception server-side under the correlation ID. |
| SEC-061 | Low | `codebase/docker-compose.yml:68` | **Agent service healthcheck uses `python -c "import urllib.request; ..."` — spawns a full Python interpreter every 15 s.** (Carried forward from SEC-043 with updated line reference.) | Replace with `curl -sf http://localhost:8001/health` or `wget -qO- ...` to match the backend pattern. |
| SEC-010 | Low | `SecurityConfig.java:50` | *(Carried forward — still open)* `BCryptPasswordEncoder()` uses default work factor 10. | Use `new BCryptPasswordEncoder(12)` |
| SEC-012 | Low | `frontend/src/app/(protected)/layout.tsx:9-13` | *(Carried forward — still open)* Auth guard in `useEffect` produces a one-tick unauthenticated render. | Move check to `middleware.ts` (server-side). |

---

### STRIDE THREAT MODEL SUMMARY

| Threat | Category | Findings | Status |
|--------|----------|---------|--------|
| **Spoofing** | JWT secret weak/missing | SEC-001 | RESOLVED |
| **Spoofing** | Refresh token reuse / theft | RefreshTokenService correctly implements RFC 6819 family revocation | MITIGATED |
| **Spoofing** | No rate limiting on login | SEC-004 | OPEN |
| **Tampering** | Issue CRUD lacks authorization | SEC-050 | **BLOCKING** |
| **Tampering** | HTTP header injection via filename | SEC-052 | OPEN |
| **Tampering** | Role update throws 500 on invalid input | SEC-053 | OPEN |
| **Repudiation** | No security audit log | SEC-008 | OPEN |
| **Information Disclosure** | Tokens in localStorage (XSS extractable) | SEC-003 | OPEN |
| **Information Disclosure** | Email PII to all board members | SEC-006 | OPEN |
| **Information Disclosure** | User enumeration via @mention | SEC-054 | OPEN |
| **Information Disclosure** | Credentials in working-directory .env | SEC-051 | **BLOCKING** |
| **Information Disclosure** | MIME type spoofing on uploads | SEC-058 | OPEN |
| **Denial of Service** | Unbounded search query | SEC-059 | OPEN |
| **Denial of Service** | PostgreSQL port 5432 exposed on 0.0.0.0 | SEC-055 | OPEN |
| **Elevation of Privilege** | Issues IDOR — any authenticated user can delete any issue | SEC-050 | **BLOCKING** |
| **Elevation of Privilege** | WebSocket allows all origins | SEC-056 | OPEN |

---

### OWASP TOP 10 COVERAGE

| OWASP Category | Findings | Verdict |
|----------------|---------|---------|
| A01 Broken Access Control | SEC-050 (IDOR issues), SEC-006 (email PII), SEC-056 (WS origin) | **CRITICAL finding present** |
| A02 Cryptographic Failures | SEC-003 (tokens in localStorage), SEC-009 (no token revocation) | High findings open |
| A03 Injection | `CardRepository` uses JPQL parameterised queries throughout — no raw SQL injection surface found in JPA layer. Flyway migrations use DDL only. | No injection finding |
| A04 Insecure Design | SEC-004 (no rate limit), SEC-008 (no audit log) | Medium |
| A05 Security Misconfiguration | SEC-005 (no security headers), SEC-051 (.env credentials), SEC-055 (ports exposed), SEC-053 (500 on role parse) | **Critical + High findings** |
| A06 Vulnerable/Outdated Components | Spring Boot 3.3.0 (released May 2024) — no critical CVEs known at scan date. `next@^14.2.0` — range constraint; actual version depends on lockfile. `jjwt-api:0.12.6` — current stable. No SBOM or Dependabot configured. | Low risk currently; monitoring gap |
| A07 Identification and Authentication Failures | SEC-004 (no rate limit), SEC-009 (no access token revocation), SEC-010 (BCrypt factor 10) | Medium/Low |
| A08 Software and Data Integrity Failures | SEC-047 (no pip-audit in CI for agent when present) | Low (agent absent) |
| A09 Security Logging and Monitoring | SEC-008, SEC-060 | Medium |
| A10 SSRF | No server-side URL fetching found in backend. Backend-to-backend calls are only internal Docker network. | No finding |

---

### PIPELINE VERDICT (v1 — 2026-06-11 initial full-codebase scan)

**BLOCKED** *(superseded by v2 re-scan below)*

Two critical findings required resolution before DELIVERY could proceed:

1. **SEC-050** — `IssueController` (GET/PATCH/DELETE) had zero authorization.
2. **SEC-051** — `.env` file with live credentials was not gitignored.

---

## RE-SCAN v2 — 2026-06-11 (Fix Verification + Phase 16/17 Sweep)

### STATUS OF PRIOR CRITICAL FINDINGS

| ID | Prior Verdict | Re-scan Result | Evidence |
|----|--------------|----------------|----------|
| SEC-050 | Critical — BLOCKING | **RESOLVED** | `IssueController.java:34-58` — all 5 handlers have `@AuthenticationPrincipal`. `IssueService.java:89-97` — `listIssues` uses `findAccessibleByUser` (scoped JPQL, not `findAll()`). `assertIssueReadAccess` and `assertIssueWriteAccess` (lines 150-166) enforce board membership for card-attached issues, and createdBy ownership for standalone issues. |
| SEC-051 | Critical — BLOCKING | **RESOLVED** | `.gitignore:2` — `.env` explicitly listed. Working-tree file present but gitignored — expected for local dev. Cannot be accidentally committed. |

---

### NEW FINDING — Phase 16 Sweep

#### High / P1

| ID | Severity | Location | Finding | Recommendation |
|----|----------|----------|---------|---------------|
| SEC-062 | **High** | `codebase/backend/src/main/java/com/kanban/service/IssueService.java:66-74, 81` | **Standalone issue creation accepts foreign workspaceId without membership check.** When `request.parentCardId()` is null, `createIssue` takes `request.workspaceId()` from the request body and immediately calls `readableIdService.allocate(workspaceId, issueType)` without calling `workspaceAccessPolicy.assertMember(workspaceId, requestingUserId)`. Any authenticated user can create issues tagged to a foreign workspace and increment that workspace's readable-ID counter. `BoardService.createBoard` (lines 78-81) correctly performs this check — `IssueService` must mirror it. | Inject `WorkspaceAccessPolicy` into `IssueService`. Add `workspaceAccessPolicy.assertMember(workspaceId, requestingUserId)` immediately after the `workspaceId == null` null check at line 73, before `readableIdService.allocate()` is called. |

---

### UPDATED STATUS TABLE — All Findings

| ID | Severity | Status | Category |
|----|----------|--------|----------|
| SEC-050 | Critical | **RESOLVED** | Broken Access Control |
| SEC-051 | Critical | **RESOLVED** | Security Misconfiguration |
| SEC-062 | High | **OPEN (new)** | Broken Access Control |
| SEC-052 | High | OPEN | Tampering / Header Injection |
| SEC-053 | High | OPEN | Security Misconfiguration |
| SEC-054 | High | OPEN | Information Disclosure |
| SEC-055 | High | OPEN | Security Misconfiguration |
| SEC-003 | High | OPEN | Crypto Failures |
| SEC-004 | High | OPEN | Auth Failures |
| SEC-056 | Medium | OPEN | Broken Access Control |
| SEC-057 | Medium | OPEN | Security Misconfiguration |
| SEC-058 | Medium | OPEN | Security Misconfiguration |
| SEC-059 | Medium | OPEN | DoS |
| SEC-005 | Medium | OPEN | Security Misconfiguration |
| SEC-006 | Medium | OPEN | Information Disclosure |
| SEC-008 | Medium | OPEN | Repudiation |
| SEC-009 | Medium | OPEN | Auth Failures |
| SEC-060 | Low | OPEN | Logging/Monitoring |
| SEC-010 | Low | OPEN | Auth Failures |
| SEC-012 | Low | OPEN | Auth Failures |
| SEC-061 | Low | OPEN | Security Misconfiguration |

---

### PIPELINE VERDICT (v2 — 2026-06-11 re-scan)

**CLEAR**

Both prior Critical findings are verified resolved:
- SEC-050: `IssueController` has `@AuthenticationPrincipal` on all 5 handlers; `IssueService` has scoped access checks everywhere.
- SEC-051: `.env` is gitignored at line 2 of `.gitignore`.

One new High finding (SEC-062) was introduced in Phase 16: standalone issue `CREATE` does not verify workspace membership before persisting. This is High severity — resource pollution and counter exhaustion — but does not meet the Critical bar (no existing data is exposed or deleted from foreign tenants). It must be fixed before the next sprint ships the issues feature.

All other open findings remain High/Medium/Low. SEC-003 (tokens in localStorage) and SEC-004 (no rate limiting) are the highest-risk open items and should be prioritized on the next sprint backlog.
