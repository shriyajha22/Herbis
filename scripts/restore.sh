#!/usr/bin/env bash
# PostgreSQL Restore Script for PrimeBrew Herbis
# Usage: ./scripts/restore.sh /path/to/backup.sql.gz

set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <path-to-backup-file.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Error: Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

echo "⚠️ Restoring PrimeBrew Herbis database from ${BACKUP_FILE}..."
echo "This will overwrite existing data. Press Ctrl+C within 5 seconds to cancel."
sleep 5

gunzip -c "${BACKUP_FILE}" | psql "${DATABASE_URL}"

echo "✅ Database restored successfully!"
