#!/usr/bin/env bash
# Full production deployment script.
#
# What this does (in order):
#   1. Pull latest code from git
#   2. Build new backend and frontend Docker images
#   3. Backup the existing postgres-db container (HOT — app stays live)
#   4. Stop old containers (kanban-backend, kanban-frontend, postgres-db)
#   5. Start new Postgres with named volume via docker-compose.prod.yml
#   6. Restore the backup into the new Postgres
#   7. Start the full stack (backend, frontend, nginx)
#   8. Health check
#
# Prerequisites:
#   - .env file is present in the project root with real secrets
#   - Docker is installed and running
#   - User is in the docker group (or run with sudo)
#   - Port 80 is open in the EC2 security group
#
# Usage:
#   cd /path/to/kanban
#   bash deploy/deploy.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="${SCRIPT_DIR}/.."
COMPOSE_FILE="${ROOT_DIR}/docker-compose.prod.yml"
EC2_HOST="ec2-35-154-3-162.ap-south-1.compute.amazonaws.com"

cd "$ROOT_DIR"

set -a
# shellcheck disable=SC1090
source .env
set +a

log() { echo ""; echo "=== $* ==="; }
step() { echo "[$(date +%H:%M:%S)] $*"; }

log "KANBAN PRODUCTION DEPLOYMENT — $(date)"

# ── 1. Pull latest code ───────────────────────────────────────────────────────
log "STEP 1/7 — Pull latest code"
git pull --ff-only

# ── 2. Build images ───────────────────────────────────────────────────────────
log "STEP 2/7 — Build Docker images"

step "Building backend image..."
docker build -t kanban-backend:latest ./backend

step "Building frontend image (API URL: http://${EC2_HOST})..."
docker build \
    --build-arg NEXT_PUBLIC_API_URL="http://${EC2_HOST}" \
    --build-arg NEXT_PUBLIC_WS_URL="ws://${EC2_HOST}/ws" \
    --build-arg NEXT_PUBLIC_AGENT_URL="http://${EC2_HOST}:8001" \
    -t kanban-frontend:latest ./frontend

# ── 3. Backup existing Postgres ───────────────────────────────────────────────
log "STEP 3/7 — Backup existing database (app stays live)"
BACKUP_FILE=$(bash "${SCRIPT_DIR}/backup.sh")
step "Backup saved: ${BACKUP_FILE}"

# ── 4. Stop old containers ────────────────────────────────────────────────────
log "STEP 4/7 — Stop old containers"
# Stop standalone postgres-db and any old compose services
docker stop kanban-backend 2>/dev/null && docker rm kanban-backend 2>/dev/null || true
docker stop kanban-frontend 2>/dev/null && docker rm kanban-frontend 2>/dev/null || true
docker stop nginx 2>/dev/null && docker rm nginx 2>/dev/null || true
docker stop postgres-db 2>/dev/null && docker rm postgres-db 2>/dev/null || true
# Also bring down anything the compose file still tracks
docker compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true
step "Old containers stopped."

# ── 5. Start new Postgres ─────────────────────────────────────────────────────
log "STEP 5/7 — Start Postgres with named volume"
docker compose -f "$COMPOSE_FILE" up -d postgres
step "Waiting for Postgres to accept connections..."
until docker compose -f "$COMPOSE_FILE" exec -T postgres \
    pg_isready -U "${DB_USER}" -d "${DB_NAME}" 2>/dev/null; do
    sleep 2
done
step "Postgres is ready."

# ── 6. Restore backup ─────────────────────────────────────────────────────────
log "STEP 6/7 — Restore database backup"
bash "${SCRIPT_DIR}/restore.sh" "${BACKUP_FILE}"
step "Restore complete."

# ── 7. Start full stack ───────────────────────────────────────────────────────
log "STEP 7/7 — Start full stack (backend, frontend, nginx)"
docker compose -f "$COMPOSE_FILE" up -d
step "All services started."

# ── Health check ──────────────────────────────────────────────────────────────
log "HEALTH CHECK"
sleep 5  # Let services settle

MAX_RETRIES=12
RETRY=0
until wget -qO- "http://localhost/api/v1/health" > /dev/null 2>&1; do
    RETRY=$((RETRY + 1))
    if [[ $RETRY -ge $MAX_RETRIES ]]; then
        echo "ERROR: Health check failed after ${MAX_RETRIES} attempts."
        echo "Check logs: docker compose -f docker-compose.prod.yml logs"
        exit 1
    fi
    step "Health check attempt ${RETRY}/${MAX_RETRIES}..."
    sleep 5
done

log "DEPLOYMENT COMPLETE — $(date)"
echo ""
echo "  App URL : http://${EC2_HOST}"
echo "  Backup  : ${BACKUP_FILE}"
echo ""
docker compose -f "$COMPOSE_FILE" ps
