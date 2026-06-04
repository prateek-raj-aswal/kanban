#!/usr/bin/env bash
# Restores a gzipped SQL dump into the compose-managed postgres container.
# Usage: restore.sh <path/to/kanban_YYYY-MM-DD_HHMMSS.sql.gz>
set -euo pipefail

BACKUP_FILE="${1:?Usage: restore.sh <backup_file.sql.gz>}"

if [[ ! -f "$BACKUP_FILE" ]]; then
    echo "ERROR: backup file not found: ${BACKUP_FILE}"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/../docker-compose.prod.yml"

set -a
# shellcheck disable=SC1090
source "${SCRIPT_DIR}/../.env"
set +a

POSTGRES_CID=$(docker compose -f "$COMPOSE_FILE" ps -q postgres 2>/dev/null)
if [[ -z "$POSTGRES_CID" ]]; then
    echo "ERROR: compose postgres service is not running. Start it first:"
    echo "  docker compose -f docker-compose.prod.yml up -d postgres"
    exit 1
fi

echo "[restore] File     : ${BACKUP_FILE}"
echo "[restore] Database : ${DB_NAME}"
echo "[restore] User     : ${DB_USER}"
echo "[restore] Container: ${POSTGRES_CID}"

gunzip -c "${BACKUP_FILE}" | docker exec -i \
    -e PGPASSWORD="${DB_PASSWORD}" \
    "${POSTGRES_CID}" \
    psql -U "${DB_USER}" -d "${DB_NAME}" -v ON_ERROR_STOP=1

echo "[restore] Done."
