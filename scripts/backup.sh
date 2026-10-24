#!/usr/bin/env bash
# Automated PostgreSQL Daily Backup Script for PrimeBrew Herbis
# Run via cron daily at midnight: 0 0 * * * /app/scripts/backup.sh

set -euo pipefail

BACKUP_DIR="/var/backups/primebrew"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/primebrew_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

mkdir -p "${BACKUP_DIR}"

echo "📦 Starting PrimeBrew PostgreSQL backup at $(date)..."

# Dump database using pg_dump compressed with gzip
if [ -n "${DATABASE_URL:-}" ]; then
  pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_FILE}"
else
  pg_dump -U "${POSTGRES_USER:-postgres}" -h "${POSTGRES_HOST:-localhost}" "${POSTGRES_DB:-primebrew_herbis}" | gzip > "${BACKUP_FILE}"
fi

echo "✅ Backup completed: ${BACKUP_FILE} ($(du -sh "${BACKUP_FILE}" | cut -f1))"

# Prune backups older than 30 days
echo "🧹 Pruning backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "primebrew_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "🎉 Backup rotation complete."
