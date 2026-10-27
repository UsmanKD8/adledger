#!/usr/bin/env bash
# Loads 01..04 into a hosted MySQL (e.g. Aiven) over TLS.
# Put the connection details in database/.remote.env (not committed):
#   DB_HOST=...  DB_PORT=...  DB_USER=...  DB_PASSWORD=...
set -euo pipefail
cd "$(dirname "$0")"
source ./.remote.env

MYSQL="${MYSQL:-mysql}"
export MYSQL_PWD="$DB_PASSWORD"
for f in 01_schema.sql 02_triggers.sql 03_views.sql 04_seed.sql; do
  echo "== $f"
  "$MYSQL" --ssl-mode=REQUIRED -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" < "$f"
done
"$MYSQL" --ssl-mode=REQUIRED -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" adledger_db \
  -e "SELECT * FROM vw_dashboard_summary;"
