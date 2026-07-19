import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

test('Phase 11 keeps explicit resilience coverage for both portals', () => {
  const customer = read('frontend-user/src/components/feedback/ConnectivityBanner.tsx');
  const admin = read('frontend-admin/src/components/feedback/ConnectivityBanner.tsx');
  const booking = read('frontend-user/src/pages/ServiceBooking.tsx');
  const playwright = read('tests/e2e/phase11-resilience.spec.mjs');
  for (const source of [customer, admin]) {
    assert.match(source, /addEventListener\('offline'/);
    assert.match(source, /addEventListener\('online'/);
    assert.match(source, /aria-live="assertive"/);
    assert.match(source, /data-connectivity-state/);
  }
  assert.match(booking, /ECONNABORTED/);
  assert.match(booking, /khóa gửi an toàn sẽ ngăn tạo yêu cầu trùng/);
  assert.match(playwright, /setOffline\(true\)/);
  assert.match(playwright, /setOffline\(false\)/);
});

test('Phase 11 risk matrix covers the required failure modes and three roles', () => {
  const risk = read('backend/test/phase11-risk-matrix.integration.mjs');
  const notification = read('backend/src/modules/notifications/notifications.service.spec.ts');
  const upload = read('backend/src/common/pipes/safe-image-files.pipe.spec.ts');
  for (const marker of ['replayed', 'badUpload', 'expiredAccessToken', 'customerJar', 'staffJar', 'adminJar', '409']) {
    assert.match(risk, new RegExp(marker));
  }
  assert.match(notification, /SMTP_PROVIDER_UNAVAILABLE/);
  assert.match(notification, /'FAILED'/);
  assert.match(notification, /'DEAD'/);
  assert.match(upload, /spoofed image/);
  assert.match(upload, /oversized image/);
});

test('Phase 11 adds STAFF to MySQL with an additive enum migration', () => {
  const migration = read('backend/prisma/migrations/20260719100000_phase11_staff_role/migration.sql');
  assert.match(migration, /ALTER TABLE `User`/);
  assert.match(migration, /'CUSTOMER', 'STAFF', 'ADMIN', 'SUPERADMIN'/);
  assert.doesNotMatch(migration, /\bDROP\b/i);
});

test('production frontends fail closed when Mock API is enabled', () => {
  for (const path of ['frontend-user/src/config/env.ts', 'frontend-admin/src/config/env.ts']) {
    const source = read(path);
    assert.match(source, /production[\s\S]*VITE_USE_MOCK_API must be false in production/);
  }
});

test('release v1.0.0 remains mechanically blocked until real signatures exist', () => {
  const gate = read('scripts/verify-release-gate.mjs');
  const approval = JSON.parse(read('docs/phase-11-12/release-v1.0.0-approval.json'));
  assert.match(gate, /uatSigned/);
  assert.match(gate, /handoverSigned/);
  assert.match(gate, /productionReadinessVerified/);
  assert.match(gate, /open P0 defects must be zero/);
  assert.match(gate, /open P1 defects must be zero/);
  assert.equal(approval.decision, 'NO_GO');
  assert.equal(approval.uatSigned, false);
  assert.equal(approval.handoverSigned, false);
});

test('go-live verifier checks every production control requested by Phase 12', () => {
  const verifier = read('scripts/verify-production-readiness.mjs');
  for (const marker of [
    'APP_VERSION', 'USER_DOMAIN', 'ADMIN_DOMAIN', 'RUN_SEED', 'SERVICE_ONLY_MODE',
    'ENABLE_DEV_ENDPOINTS', 'ENABLE_DEMO_ACCOUNTS', 'JWT_ACCESS_SECRET',
    'BACKUP_ENCRYPTION_KEY', 'SMTP_HOST', 'MEDIA_STORAGE_PROVIDER', 'MYSQL_ROOT_PASSWORD',
    'X509Certificate', 'CA-issued',
  ]) assert.match(verifier, new RegExp(marker));
});

test('Phase 11-12 handover artifacts do not overwrite the legacy communications Phase 12 folder', () => {
  assert.match(read('docs/phase-12/README.md'), /Communications and Integrations/);
  assert.match(read('docs/phase-11-12/BC_NT_acceptance-report.md'), /Giai đoạn 11–12/);
});
