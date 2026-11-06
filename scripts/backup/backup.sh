#!/usr/bin/env sh
set -eu

: "${NOOKFOLIO_DATA_ROOT:=/srv/nookfolio/data}"
: "${NOOKFOLIO_BACKUP_ROOT:=/srv/nookfolio/backups}"
: "${COMPOSE_FILE:=docker-compose.production.yml}"
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

timestamp=$(date -u +%Y%m%dT%H%M%SZ)
umask 077
daily_root="$NOOKFOLIO_BACKUP_ROOT/daily"
weekly_root="$NOOKFOLIO_BACKUP_ROOT/weekly"
mkdir -p "$daily_root" "$weekly_root"

staging=$(mktemp -d "$NOOKFOLIO_BACKUP_ROOT/.backup-$timestamp.XXXXXX")
trap 'rm -rf -- "$staging"' EXIT
trap 'exit 1' HUP INT TERM

backup_name=${staging##*/.backup-}
daily="$daily_root/$backup_name"

if [ -n "${NOOKFOLIO_DATABASE_URL:-}" ]; then
  dump_url=$(node "$script_dir/pg-dump-url.mjs" "$NOOKFOLIO_DATABASE_URL")
  pg_dump "$dump_url" > "$staging/database.sql"
else
  docker compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$staging/database.sql"
fi
tar -C "$NOOKFOLIO_DATA_ROOT" -czf "$staging/uploads-geo.tgz" uploads geo

mkdir "$staging/daily"
mv "$staging/database.sql" "$staging/uploads-geo.tgz" "$staging/daily/"
mv "$staging/daily" "$daily"

find "$daily_root" -mindepth 1 -maxdepth 1 -type d -mtime +6 -exec rm -rf {} +
if [ "$(date -u +%u)" = "7" ]; then
  cp -a "$daily" "$staging/weekly"
  mv "$staging/weekly" "$weekly_root/$backup_name"
  find "$weekly_root" -mindepth 1 -maxdepth 1 -type d -mtime +27 -exec rm -rf {} +
fi
