#!/usr/bin/env bash
set -euo pipefail

if [[ "${PHASE5_DRILL_CONFIRM:-}" != "phase5_drill" ]]; then
  echo "Set PHASE5_DRILL_CONFIRM=phase5_drill to run against disposable databases."
  exit 2
fi

MYSQL_HOST="${MYSQL_HOST:-127.0.0.1}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-ci_password}"
export MYSQL_PWD="$MYSQL_PASSWORD"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIGRATION_NAME="20260718120000_phase5_safe_legacy_booking"
MIGRATION_DIR="$ROOT_DIR/backend/prisma/migrations/$MIGRATION_NAME"
HELD_MIGRATION="$(mktemp -d)/$MIGRATION_NAME"
BACKUP_DIR="$(mktemp -d)"

mysql_cmd=(mysql --host "$MYSQL_HOST" --port "$MYSQL_PORT" --user "$MYSQL_USER" --default-character-set=utf8mb4)

cleanup() {
  if [[ -d "$HELD_MIGRATION" && ! -d "$MIGRATION_DIR" ]]; then
    mv "$HELD_MIGRATION" "$MIGRATION_DIR"
  fi
}
trap cleanup EXIT

"${mysql_cmd[@]}" -e "DROP DATABASE IF EXISTS phase5_clean; CREATE DATABASE phase5_clean CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
(
  cd "$ROOT_DIR/backend"
  DATABASE_URL="mysql://$MYSQL_USER:$MYSQL_PASSWORD@$MYSQL_HOST:$MYSQL_PORT/phase5_clean" npx prisma migrate deploy
)

clean_metadata="$("${mysql_cmd[@]}" --batch --skip-column-names phase5_clean -e "SELECT COUNT(*) FROM LegacyDomainMetadata;")"
clean_submissions="$("${mysql_cmd[@]}" --batch --skip-column-names phase5_clean -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='phase5_clean' AND table_name='ServiceRequestSubmission';")"
[[ "$clean_metadata" -ge 13 && "$clean_submissions" -eq 1 ]]
echo "CLEAN MIGRATE PASS"

mv "$MIGRATION_DIR" "$HELD_MIGRATION"
"${mysql_cmd[@]}" -e "DROP DATABASE IF EXISTS phase5_legacy; CREATE DATABASE phase5_legacy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
(
  cd "$ROOT_DIR/backend"
  DATABASE_URL="mysql://$MYSQL_USER:$MYSQL_PASSWORD@$MYSQL_HOST:$MYSQL_PORT/phase5_legacy" npx prisma migrate deploy
)

"${mysql_cmd[@]}" phase5_legacy <<'SQL'
INSERT INTO Category (name, slug, createdAt, updatedAt)
VALUES ('Legacy drill category', 'legacy-drill-category', NOW(3), NOW(3));
SET @category_id = LAST_INSERT_ID();
INSERT INTO Brand (name, slug) VALUES ('Legacy drill brand', 'legacy-drill-brand');
SET @brand_id = LAST_INSERT_ID();
INSERT INTO Product (name, slug, description, basePrice, isActive, categoryId, brandId, createdAt, updatedAt)
VALUES ('Legacy rollback fixture', 'legacy-rollback-fixture', 'Must survive backup, restore and migration.', 123456, TRUE, @category_id, @brand_id, NOW(3), NOW(3));
SQL

(
  cd "$ROOT_DIR"
  DATABASE_URL="mysql://$MYSQL_USER:$MYSQL_PASSWORD@$MYSQL_HOST:$MYSQL_PORT/phase5_legacy" \
  BACKUP_DIRECTORY="$BACKUP_DIR" BACKUP_RETENTION_DAYS=1 node scripts/backup-mysql.mjs
)
BACKUP_FILE="$(find "$BACKUP_DIR" -maxdepth 1 -type f -name '*.sql.gz' -print -quit)"
[[ -n "$BACKUP_FILE" && -f "$BACKUP_FILE.sha256" ]]

"${mysql_cmd[@]}" -e "DROP DATABASE IF EXISTS phase5_restore; CREATE DATABASE phase5_restore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
(
  cd "$ROOT_DIR"
  DATABASE_URL="mysql://$MYSQL_USER:$MYSQL_PASSWORD@$MYSQL_HOST:$MYSQL_PORT/phase5_restore" \
  BACKUP_DIRECTORY="$BACKUP_DIR" RESTORE_FILE="$BACKUP_FILE" RESTORE_CONFIRM=phase5_restore \
  node scripts/restore-mysql.mjs
)

mv "$HELD_MIGRATION" "$MIGRATION_DIR"
(
  cd "$ROOT_DIR/backend"
  DATABASE_URL="mysql://$MYSQL_USER:$MYSQL_PASSWORD@$MYSQL_HOST:$MYSQL_PORT/phase5_restore" npx prisma migrate deploy
)

legacy_products="$("${mysql_cmd[@]}" --batch --skip-column-names phase5_restore -e "SELECT COUNT(*) FROM Product WHERE slug='legacy-rollback-fixture';")"
legacy_runtime_exposed="$("${mysql_cmd[@]}" --batch --skip-column-names phase5_restore -e "SELECT COUNT(*) FROM LegacyDomainMetadata WHERE runtimeExposed = TRUE;")"
service_finance_legacy="$("${mysql_cmd[@]}" --batch --skip-column-names phase5_restore -e "SELECT COUNT(*) FROM LegacyDomainMetadata WHERE tableName IN ('ServiceQuote','ServiceQuoteLine','ServicePaymentRecord');")"
[[ "$legacy_products" -eq 1 && "$legacy_runtime_exposed" -eq 0 && "$service_finance_legacy" -eq 0 ]]

echo "BACKUP/RESTORE DRILL PASS"
