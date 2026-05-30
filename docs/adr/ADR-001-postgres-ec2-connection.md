# ADR-001: PostgreSQL Connection Config — Split Env Vars and sslmode=prefer

Date: 2026-05-30
Status: Accepted

## Context

The backend previously assembled the JDBC URL as a single `SPRING_DATASOURCE_URL` environment variable. Deploying to AWS EC2 requires coordinating host, port, database name, credentials, and SSL mode independently across environments (dev, test, production). A single opaque URL string makes this harder to manage, harder to rotate credentials, and harder to enforce SSL per environment.

Additionally, EC2-hosted PostgreSQL requires SSL in production but the TLS certificate chain may not be provisioned at initial deployment, so a hard `sslmode=require` would block first deployment.

## Decision

1. **Split the JDBC URL into discrete env vars**: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`. The application assembles `jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=prefer` at startup.

2. **Use `sslmode=prefer` as the initial SSL setting.** This allows the backend to connect with or without TLS depending on what the server advertises. It unblocks deployment before TLS certificates are provisioned on the EC2 Postgres container.

3. **HikariCP pool** is explicitly configured (max: 10, min-idle: 2, pool-name: KanbanHikariPool) rather than relying on Spring Boot defaults, giving operational visibility.

4. **No credential fallbacks in any profile.** `application-dev.yml` and `application-test.yml` no longer contain hardcoded credentials. All environments must supply env vars explicitly.

## Consequences

- Deployments, CI pipelines, and local dev setups must supply all five DB env vars. There is no silent fallback.
- Secret rotation (password, host) requires only the relevant env var to change — not a composed URL string.
- `sslmode=prefer` means a misconfigured or missing TLS setup will silently downgrade to plaintext. This is acceptable during initial provisioning but must be hardened.

**Hardening backlog item:** Once TLS certificates are provisioned on the EC2 PostgreSQL container, change `sslmode=prefer` to `sslmode=require` in `application.yml`. This should be treated as a security-critical follow-up before the deployment is considered production-ready.
