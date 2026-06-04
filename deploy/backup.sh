#!/usr/bin/env bash
# Backs up the running Postgres container (postgres-db) to a gzipped SQL dump.
# Reads credentials from .env in the project root.
# Outputs the backup file path to stdout (info goes to stderr).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../.env"

if [[ ! -f "$ENV_FILE" ]]; then
    echo "ERROR: .env not found at ${ENV_FILE}" >&2
    exit 1
fi

# Load env vars without polluting current shell exports
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

CONTAINER="${BACKUP_SOURCE_CONTAINER:-postgres-db}"
BACKUP_DIR="${BACKUP_DIR:-/opt/kanban/backups}"
TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/kanban_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[backup] Container : ${CONTAINER}" >&2
echo "[backup] Database  : ${DB_NAME}" >&2
echo "[backup] User      : ${DB_USER}" >&2
echo "[backup] Target    : ${BACKUP_FILE}" >&2

if ! docker inspect "${CONTAINER}" &>/dev/null; then
    echo "ERROR: container '${CONTAINER}' not found or not running." >&2
    exit 1
fi

docker exec \
    -e PGPASSWORD="${DB_PASSWORD}" \
    "${CONTAINER}" \
    pg_dump -U "${DB_USER}" "${DB_NAME}" \
    --no-owner --no-acl --clean --if-exists \
    | gzip > "${BACKUP_FILE}"

SIZE=$(du -sh "${BACKUP_FILE}" | cut -f1)
echo "[backup] Done — ${SIZE}" >&2

# Only the file path goes to stdout so callers can capture it
echo "${BACKUP_FILE}"
