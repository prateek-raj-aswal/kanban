# Tech Stack

## Backend

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Spring Boot | 3.3.x | REST APIs + WebSocket |
| Language | Java | 21 LTS | |
| Build Tool | Gradle | 8.x | |
| Auth | Spring Security + JWT | — | Stateless JWT auth |
| Real-Time | WebSocket (STOMP) | — | Board collaboration |
| API Style | REST | — | URL-versioned (`/api/v1`) |

## Frontend

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Next.js | 14.x | App Router |
| Language | TypeScript | 5.x | |
| State Mgmt | Zustand | 4.x | Board and auth state |
| Styling | Vanilla CSS | — | No paid UI libs |
| Testing | Vitest + RTL | — | |

## Database

| Type | Technology | Version | Notes |
|------|-----------|---------|-------|
| Primary DB | PostgreSQL | 16.x | UUID PKs, soft deletes |
| Migrations | Flyway | 10.x | |
| Caching | Redis | 7.x | Session / hot data |

## Infrastructure

| Component | Technology | Notes |
|-----------|-----------|-------|
| Containerization | Docker + Docker Compose | Dev and prod |
| CI/CD | GitHub Actions | |
| Monitoring | Prometheus + Grafana | |
| Logging | Loki / ELK compatible | Structured JSON |

## Testing

| Type | Technology | Notes |
|------|-----------|-------|
| Unit (Backend) | JUnit 5 + Mockito | |
| Integration | Spring Boot Test | Real DB via Testcontainers |
| Unit (Frontend) | Vitest + React Testing Library | |
