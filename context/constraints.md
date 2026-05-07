# Constraints

<!-- 
  This file is injected into agent prompts via {{context.constraints}}.
  Constraints guide every agent's decisions — the planner scopes features around them,
  the architect designs within them, and the reviewer validates against them.
-->

# Timeline

| Milestone | Target Date | Hard/Soft Deadline | Notes |
|-----------|-------------|-------------------|-------|
| MVP | 2026-06-30 | Hard | Authentication, workspaces, projects, Kanban board, task management, drag-and-drop |
| Beta Release | 2026-08-15 | Soft | Real-time collaboration, comments, notifications, advanced filtering |
| GA Release | 2026-10-01 | Hard | Production-ready release with observability, RBAC, scalability, and security hardening |

---

# Budget

| Category | Budget | Notes |
|----------|--------|-------|
| Cloud Infrastructure | $100/month initially | Prefer free-tier friendly architecture |
| Third-party Services | $0 - Open source preferred | Avoid paid SaaS dependencies in MVP |
| Team Size | Solo developer initially | Expand later if required |
| AI/LLM Costs | $20/month | Used only for development assistance |

---

# Performance Requirements

| Metric | Requirement | Priority |
|--------|-------------|----------|
| API Response Time (p50) | < 100ms | Must |
| API Response Time (p95) | < 500ms | Must |
| API Response Time (p99) | < 2s | Should |
| Throughput | 1000 RPS | Should |
| Page Load Time | < 2s on broadband | Must |
| Board Interaction Latency | < 100ms drag response | Must |
| Real-time Sync Delay | < 500ms | Must |
| DB Query Time | < 50ms for indexed reads | Must |
| Uptime SLA | 99.9% | Should |

---

# Scale Expectations

| Dimension | V1 (Launch) | V2 (6 months) | V3 (18 months) |
|-----------|------------|---------------|----------------|
| Users | 100 | 10K | 100K |
| Requests/day | 20K | 2M | 50M |
| Data volume | 5GB | 250GB | 10TB |
| Concurrent users | 25 | 2K | 20K |
| Active projects | 100 | 50K | 500K |

---

# Regulatory & Compliance

| Regulation | Applies? | Impact |
|-----------|----------|--------|
| GDPR | Yes | User deletion, consent management, export functionality |
| HIPAA | No | N/A |
| SOC 2 | Future | Audit logging and operational controls |
| PCI DSS | No | Payments not in MVP scope |
| CCPA | Yes | Privacy and data access requests |

---

## Data Residency
- **Required regions**: No hard restriction initially
- **Cross-border transfer**: Allowed

---

## Data Retention
- **User data**: Retain until account deletion request
- **Logs**: 30 days hot storage, 1 year cold storage
- **Backups**: Daily backups retained for 30 days

---

# Security Constraints

| Constraint | Requirement |
|-----------|-------------|
| Authentication | OAuth 2.0 + JWT |
| Authorization | RBAC with roles: Owner, Admin, Member, Viewer |
| Encryption at rest | AES-256 |
| Encryption in transit | TLS 1.2 minimum |
| Secret management | Environment variables initially, Vault later |
| Dependency scanning | Trivy/Snyk during CI pipeline |
| Penetration testing | Internal testing before production |

---

# Technical Constraints

## Must Use
- Angular frontend
- Java Spring Boot backend
- PostgreSQL database
- Redis caching layer
- Dockerized deployment
- WebSocket support for real-time collaboration
- REST APIs for external integrations
- Kafka/event-driven architecture ready design

---

## Must Not Use
- No vendor lock-in
- No monolithic frontend state chaos
- No server-side rendering in MVP
- No paid UI component libraries
- No synchronous long-running operations on API threads

---

## Compatibility Requirements

- **Browsers**:
  - Chrome latest 2 versions
  - Firefox latest 2 versions
  - Edge latest 2 versions
  - Safari latest 2 versions

- **Mobile**:
  - Responsive web support mandatory
  - Native apps out of scope initially

- **Accessibility**:
  - WCAG 2.1 Level AA target

- **API Versioning**:
  - URL-based versioning (`/api/v1`)

---

# Organizational Constraints

| Constraint | Details |
|-----------|---------|
| Team timezone | IST (UTC+5:30) |
| Code review policy | No direct commits to main |
| Branching strategy | Trunk-based with feature branches |
| Release cadence | Weekly releases |
| Documentation standard | ADRs + OpenAPI specs |
| Incident response | Logs + alerts through Grafana/Prometheus |

---

# Architecture Constraints

## Frontend
- Component-driven architecture
- Lazy-loaded modules
- Centralized state management
- Drag-and-drop must remain performant with 1000+ tasks

## Backend
- Modular monolith initially
- Microservice-ready boundaries
- Async event processing support
- Stateless APIs

## Database
- PostgreSQL as primary relational database
- UUID-based identifiers
- Soft deletes for critical entities
- Audit history required for task updates

## Real-Time Collaboration
- WebSocket gateway required
- Presence tracking optional for MVP
- Conflict handling required for simultaneous task updates

## Observability
- Structured logging mandatory
- Distributed tracing support planned
- Metrics collection required
- Health endpoints mandatory

---

# DevOps Constraints

| Area | Constraint |
|------|------------|
| CI/CD | GitHub Actions mandatory |
| Containerization | Docker required |
| Infrastructure | Kubernetes-ready deployment |
| IaC | Terraform preferred later |
| Monitoring | Prometheus + Grafana |
| Logging | Loki or ELK compatible |

---

# Known Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Scope creep | High | High | Strict MVP enforcement |
| Real-time sync complexity | Medium | High | Event-driven architecture from day one |
| Drag-and-drop performance degradation | Medium | High | Virtual rendering and pagination |
| Poor database indexing | Medium | High | Query optimization and load testing |
| Notification spam | Medium | Medium | Notification preference system |
| Scaling WebSocket connections | Medium | High | Dedicated gateway/service separation |
| State management complexity | High | Medium | Clear frontend architecture boundaries |
| Solo development bottleneck | High | Medium | Incremental delivery and modular design |

---

# MVP Enforcement Rules

The following features are explicitly OUT OF SCOPE for MVP:

- AI task generation
- Gantt charts
- Native mobile applications
- Plugin marketplace
- Workflow automation engine
- Time tracking/billing
- Video/audio calls
- Advanced analytics dashboards
- Multi-region deployments
- Multi-tenant enterprise isolation

---

# Engineering Principles

- Simplicity over premature optimization
- Async-first architecture where appropriate
- API-first development
- Mobile-responsive by default
- Observability is mandatory, not optional
- Every feature must have clear ownership boundaries
- Avoid distributed microservices until operationally necessary
- Optimize developer experience alongside user experience