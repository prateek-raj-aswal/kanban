Deploy the Kanban application to a target environment.

Images are always built locally (this machine has Docker Desktop and enough RAM/disk).
The EC2 instance (1GB RAM, no build tools) receives images via SSH pipe — no registry needed.

---

## Constants (project-specific — do not change without updating EC2 setup)

```
SSH_KEY    = D:\workspace\my-postgres-key.pem
EC2_USER   = ubuntu
EC2_HOST   = ec2-35-154-3-162.ap-south-1.compute.amazonaws.com
EC2_REPO   = /home/ubuntu/kanban-app
EC2_BACKUP = /opt/kanban/backups
COMPOSE    = docker-compose.prod.yml
ROOT       = D:\workspace\Claude-workspace\Kanaban
```

---

## Step 0 — Detect target

Parse args or the user's last message:
- Keywords `ec2 | cloud | remote | live | prod | aws | server` → **EC2**
- Keywords `local | locally | docker desktop | my machine | dev | test` → **Local**
- Ambiguous → Ask: "Deploy to EC2 (live) or local Docker Desktop?"

---

## Step 1 — Pre-flight checks

1. Run `git status` in ROOT.
   - If there are **unstaged or uncommitted changes**: tell the user exactly which files, then ask whether to (a) commit and push first, or (b) deploy from current local state (images built from working tree, not from git HEAD).
2. For **EC2 target only**: run `git push` if there are unpushed commits, so EC2 can `git pull` the matching code.

---

## Step 2 — Build images locally

Always build on this machine. The build context is the local working tree.

**Backend:**
```bash
cd ROOT && docker build -t kanban-backend:latest ./backend
```

**Frontend** — API URL is baked into the Next.js build at compile time:

| Target | NEXT_PUBLIC_API_URL | NEXT_PUBLIC_WS_URL |
|--------|---------------------|--------------------|
| EC2    | `http://ec2-35-154-3-162.ap-south-1.compute.amazonaws.com` | `ws://ec2-35-154-3-162.ap-south-1.compute.amazonaws.com/ws` |
| Local  | `http://localhost` | `ws://localhost/ws` |

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL="<url>" \
  --build-arg NEXT_PUBLIC_WS_URL="<ws-url>" \
  --build-arg NEXT_PUBLIC_AGENT_URL="http://<host>:8001" \
  -t kanban-frontend:latest ./frontend
```

If either build fails: stop, show the error, do not proceed.

---

## EC2 Deployment (steps 3–7)

### Step 3 — Transfer images to EC2

Pipe images directly over SSH — no Docker Hub or registry needed.
Run both transfers sequentially (second depends on SSH staying open):

```bash
docker save kanban-backend:latest | gzip | ssh -i "D:\workspace\my-postgres-key.pem" ubuntu@ec2-35-154-3-162.ap-south-1.compute.amazonaws.com "docker load"
docker save kanban-frontend:latest | gzip | ssh -i "D:\workspace\my-postgres-key.pem" ubuntu@ec2-35-154-3-162.ap-south-1.compute.amazonaws.com "docker load"
```

### Step 4 — Pull latest code on EC2

```bash
ssh -i "D:\workspace\my-postgres-key.pem" ubuntu@ec2-35-154-3-162.ap-south-1.compute.amazonaws.com \
  "cd /home/ubuntu/kanban-app && git pull --ff-only"
```

If `--ff-only` fails (diverged history): report to user and stop. Do not force-reset.

### Step 5 — Hot-backup the live database

Run backup.sh against the currently running postgres container (app stays live during backup):

```bash
ssh ubuntu@ec2 "cd /home/ubuntu/kanban-app && bash deploy/backup.sh"
```

Capture the backup file path from stdout. Report it to the user.

### Step 6 — Replace containers (zero-downtime swap)

```bash
ssh ubuntu@ec2 << 'EOF'
set -euo pipefail
cd /home/ubuntu/kanban-app
source .env

# Stop old stack and any legacy standalone containers
docker stop kanban-backend kanban-frontend nginx postgres-db 2>/dev/null || true
docker rm   kanban-backend kanban-frontend nginx postgres-db 2>/dev/null || true
docker compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true

# Start postgres with named volume, wait for readiness
docker compose -f docker-compose.prod.yml up -d postgres
until docker compose -f docker-compose.prod.yml exec -T postgres \
    pg_isready -U "${DB_USER}" -d "${DB_NAME}" 2>/dev/null; do sleep 2; done

# Restore backup
bash deploy/restore.sh <BACKUP_FILE>

# Start full stack
docker compose -f docker-compose.prod.yml up -d
EOF
```

### Step 7 — Health check (EC2)

Poll `http://localhost/api/v1/health` on EC2 every 5s, up to 75s (15 attempts):

```bash
ssh ubuntu@ec2 "for i in \$(seq 15); do wget -qO- http://localhost/api/v1/health && exit 0 || sleep 5; done; exit 1"
```

On success: print container table (`docker compose ps`) and the live URL.
On failure: print last 40 lines of `docker compose logs` and exit with error.

---

## Local Deployment (steps 3–5)

### Step 3 — Ensure local .env exists

Check for `ROOT/.env.local`. If missing, create it with safe dev defaults:

```
DB_NAME=kanban
DB_USER=kanban
DB_PASSWORD=kanban_local_dev
JWT_SECRET=local-dev-secret-at-least-32-chars-long
JWT_EXPIRY_MS=3600000
JWT_REFRESH_EXPIRY_MS=604800000
```

Tell the user if the file was created.

### Step 4 — Start local stack

```bash
cd ROOT
docker compose -f docker-compose.prod.yml --env-file .env.local up -d
```

`docker compose up -d` is idempotent — re-running restarts only containers whose image changed.
The named volume `kanban-postgres-data` persists data across restarts.

If this is a **first-time local deploy** (volume doesn't exist yet), no restore is needed —
Postgres initialises a fresh empty database and Flyway migrations run on backend startup.

If the user explicitly says they want to **reset local data**: run
`docker compose -f docker-compose.prod.yml --env-file .env.local down -v` first (destroys volume).
Do NOT destroy the volume unless explicitly asked.

### Step 5 — Health check (local)

Poll `http://localhost/api/v1/health` every 5s, up to 75s:

```bash
for i in $(seq 15); do curl -sf http://localhost/api/v1/health && break || sleep 5; done
```

On success: print `docker compose ps` and `http://localhost`.
On failure: print `docker compose -f docker-compose.prod.yml --env-file .env.local logs --tail=40`.

---

## Success output (both targets)

```
Deployment complete.
  Target  : <EC2 / Local>
  App URL : <http://ec2-... or http://localhost>
  Backup  : <path or N/A>
  Containers:
  <docker compose ps table>
```
