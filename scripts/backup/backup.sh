#!/usr/bin/env sh
set -eu

: "${NOOKFOLIO_DATA_ROOT:=/srv/nookfolio/data}"
: "${NOOKFOLIO_BACKUP_ROOT:=/srv/nookfolio/backups}"
: "${COMPOSE_FILE:=docker-compose.production.yml}"
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

timestamp=$(date -u +%Y%m%dT%H%M%SZ)
daily="$NOOKFOLIO_BACKUP_ROOT/daily/$timestamp"
mkdir -p "$daily"

if [ -n "${NOOKFOLIO_DATABASE_URL:-}" ]; then
  dump_url=$(node "$script_dir/pg-dump-url.mjs" "$NOOKFOLIO_DATABASE_URL")
  pg_dump "$dump_url" > "$daily/database.sql"
else
  docker compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$daily/database.sql"
fi
tar -C "$NOOKFOLIO_DATA_ROOT" -czf "$daily/uploads-geo.tgz" uploads geo

find "$NOOKFOLIO_BACKUP_ROOT/daily" -mindepth 1 -maxdepth 1 -type d -mtime +6 -exec rm -rf {} +
mkdir -p "$NOOKFOLIO_BACKUP_ROOT/weekly"
if [ "$(date -u +%u)" = "7" ]; then
  cp -a "$daily" "$NOOKFOLIO_BACKUP_ROOT/weekly/$timestamp"
  find "$NOOKFOLIO_BACKUP_ROOT/weekly" -mindepth 1 -maxdepth 1 -type d -mtime +27 -exec rm -rf {} +
fi
