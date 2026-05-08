# Security Findings — Phase 1 + Phase 2

Generated: 2026-05-08 | Scan scope: backend auth/board/column modules + frontend auth layer

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
