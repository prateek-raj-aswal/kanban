# Tech Stack

## Backend

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| Framework | Spring Boot | 3.3.x | Requested by user, excellent for robust APIs and processing. |
| Language | Java | 21 LTS | Standard for modern Spring Boot. |
| Build Tool | Gradle | 8.x | Efficient dependency management. |
| API Style | REST | — | Standard, easy to consume by frontend. |
| Auth | Spring Security + JWT | — | Out of scope for monetization, but useful for basic admin/vendor auth. |
| Audio Processing | FFmpeg | — | Required for automated audio watermarking. |

## Frontend

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| Framework | Next.js | 14.x | Fast, modern React framework with SSR/SSG capabilities for SEO. |
| Language | TypeScript | 5.x | Type safety. |
| State Mgmt | Zustand | 4.x | Lightweight state management for audio player state. |
| Styling | Vanilla CSS | — | Complete control for premium design, avoiding Tailwind as per AI instructions. |
| Build Tool | Next.js built-in (Webpack/Turbopack) | — | Standard Next.js pipeline. |

## Database

| Type | Technology | Version | Justification |
|------|-----------|---------|---------------|
| Primary DB | SQLite | 3.x | Requested by user. Ideal for initial iteration, simple file-based setup. |
| Migrations | Flyway | 10.x | Schema management for SQLite. |

## Infrastructure & Storage

| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| File Storage | Local FS / S3 Mock | — | Needed for storing large drum kits and beats. Can start local and move to S3. |

## Testing

| Type | Technology | Version | Notes |
|------|-----------|---------|-------|
| Unit (Backend) | JUnit 5 + Mockito | — | Standard testing. |
| Unit (Frontend) | Vitest | — | Fast UI component testing. |
