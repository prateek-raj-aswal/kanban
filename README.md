# Kanban

A full-stack Kanban board application.

## Stack

- **Backend**: Spring Boot 3.3 (Java 21, Gradle 8)
- **Frontend**: Next.js 14 (TypeScript)
- **Database**: PostgreSQL with Flyway migrations
- **Auth**: Spring Security + JWT

## Environment Variables

The backend assembles the JDBC URL from individual env vars. All eight are required at runtime (and for test runs).

| Variable | Description | Example |
|---|---|---|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `kanban` |
| `DB_USER` | Database username | `kanban_user` |
| `DB_PASSWORD` | Database password | — |
| `JWT_SECRET` | JWT signing secret | — |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000` |
| `SERVER_PORT` | Backend HTTP port | `8080` |

Copy `.env.example` and fill in values before starting:

```
cp .env.example .env
```

## Local Development

A Docker Compose file is provided for running the full dev stack locally (backend + PostgreSQL 15).

```
docker-compose -f docker-compose.dev.yml up
```

This starts:
- `kanban-backend` — Spring Boot app on port 8080
- `postgres` (postgres:15) — database on port 5432

Flyway migrations (V1–V20) run automatically on startup.

### Running tests

Tests require the datasource env vars to be set explicitly — there are no hardcoded fallbacks:

```
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/kanban_test
export SPRING_DATASOURCE_USERNAME=kanban_user
export SPRING_DATASOURCE_PASSWORD=secret
./gradlew test
```

## Database Migrations

Migrations live in `backend/src/main/resources/db/migration/`. Flyway runs them in version order on startup.

| Version | Change |
|---|---|
| V1–V15 | Initial schema (boards, columns, cards, users, auth) |
| V16 | Creates `projects` table |
| V17 | Adds `project_id` FK to `boards` |
| V18 | Renames `cards→tasks` and dependent tables; adds `created_by` to tasks |
| V19 | Adds `old_value`/`new_value` to activity_log; `deleted_at` to comments; `project_id` to labels |
| V20 | Renames stale `*_card` indexes to `*_task` |
