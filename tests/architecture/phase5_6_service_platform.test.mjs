import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '../..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('Phase 5 migration and drill remain non-destructive for release data', () => {
  const migration = read('backend/prisma/migrations/20260718120000_phase5_safe_legacy_booking/migration.sql');
  const drill = read('scripts/phase5-database-drill.sh');
  assert.doesNotMatch(migration, /\b(?:DROP|TRUNCATE|RENAME|DELETE\s+FROM)\b/i);
  assert.match(migration, /LEGACY_READ_ONLY/);
  assert.match(drill, /BACKUP\/RESTORE DRILL PASS/);
  assert.match(drill, /RESTORE_CONFIRM=phase5_restore/);
  assert.match(read('docs/phase-5/BC_DB_anh-huong-schema.md'), /ServiceQuoteLine/);
});

test('Phase 6 booking is four explicit steps with pricing disclosure and retry protection', () => {
  const booking = read('frontend-user/src/pages/ServiceBooking.tsx');
  const api = read('frontend-user/src/services/serviceRequestApi.ts');
  assert.match(booking, /label: 'Liên hệ'/);
  assert.match(booking, /label: 'Thiết bị'/);
  assert.match(booking, /label: 'Địa chỉ & lịch'/);
  assert.match(booking, /label: 'Ảnh & xác nhận'/);
  assert.match(booking, /Giá tham khảo/);
  assert.match(booking, /crypto\.randomUUID/);
  assert.match(api, /Idempotency-Key/);
});

test('Phase 6 account actions are backend-enforced and versioned', () => {
  const controller = read('backend/src/modules/users/users.controller.ts');
  const service = read('backend/src/modules/users/users.service.ts');
  const detail = read('frontend-user/src/pages/MyServiceDetail.tsx');
  assert.match(controller, /service-requests\/:id\/reschedule/);
  assert.match(controller, /service-requests\/:id\/cancel/);
  assert.match(service, /\['NEW', 'CONFIRMED', 'RESCHEDULED'\]/);
  assert.match(service, /requestVersion !== dto\.requestVersion/);
  assert.match(detail, /Các phiên bản báo giá/);
  assert.match(detail, /Biên bản nghiệm thu/);
  assert.match(detail, /Bảo hành/);
});
