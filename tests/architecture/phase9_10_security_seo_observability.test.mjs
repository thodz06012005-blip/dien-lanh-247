import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (relativePath) => readFileSync(path.join(root, relativePath), 'utf8');

test('Phase 9 permission catalogs and negative tests are service-only', () => {
  const sources = [
    read('backend/src/common/auth/admin-permissions.ts'),
    read('frontend-admin/src/config/adminPermissions.ts'),
    read('frontend-admin/src/types/admin.ts'),
    read('mock-api/utils/auth.js'),
  ].join('\n');
  assert.doesNotMatch(sources, /products?\.|orders?\.|inventory\.|cart\.|checkout\./i);
  const negative = read('backend/src/common/auth/admin-permissions.spec.ts');
  assert.match(negative, /denies unknown and customer roles/);
  assert.match(negative, /SETTINGS_MANAGE/);
  assert.match(negative, /AUDIT_VIEW/);
});

test('Phase 9 preserves session defenses and adds Super Admin step-up plus CSRF', () => {
  const auth = read('backend/src/modules/auth/auth.service.ts');
  const controller = read('backend/src/modules/auth/admin-auth.controller.ts');
  const settings = read('backend/src/modules/settings/settings.controller.ts');
  const middleware = read('backend/src/common/middleware/security.middleware.ts');
  for (const marker of [
    'TOKEN_REUSE_DETECTED',
    'refreshTokenHash',
    'issueAdminStepUp',
    'admin-step-up',
  ]) {
    assert.match(`${auth}\n${controller}`, new RegExp(marker));
  }
  assert.match(controller, /adminStepUpToken/);
  assert.match(controller, /httpOnly: true/);
  assert.match(settings, /SuperAdminStepUpGuard/);
  assert.match(middleware, /csrfProtectionMiddleware/);
  assert.match(middleware, /x-csrf-protection/);
  const mock = `${read('mock-api/server.js')}\n${read('mock-api/routes/adminSettings.js')}`;
  assert.match(mock, /admin\/auth\/step-up/);
  assert.match(mock, /requireSuperAdminStepUp/);
  assert.match(mock, /x-csrf-protection/);
});

test('Phase 9 encrypts production backups and blocks production data in non-production', () => {
  const backup = read('scripts/backup-mysql.mjs');
  const restore = read('scripts/restore-mysql.mjs');
  const environment = read('backend/src/config/environment.ts');
  assert.match(backup, /aes-256-gcm/);
  assert.match(backup, /BACKUP_ENCRYPTION_KEY is required for production backups/);
  assert.match(restore, /createDecipheriv\('aes-256-gcm'/);
  assert.match(restore, /Production restore requires an encrypted/);
  assert.match(environment, /DATASET_CLASSIFICATION/);
  assert.match(environment, /Production customer data must not be used/);
});

test('Phase 9 minimizes PII in logs and exposes accountable data-right requests', () => {
  const redaction = read('backend/src/common/security/redaction.util.ts');
  const mockRedaction = read('mock-api/utils/auditLog.js');
  for (const marker of ['address', 'phone', 'email', 'image', 'cookie', 'token']) {
    assert.match(redaction, new RegExp(marker, 'i'));
    assert.match(mockRedaction, new RegExp(marker, 'i'));
  }
  const controller = read('backend/src/modules/users/users.controller.ts');
  const migration = read(
    'backend/prisma/migrations/20260718150000_phase9_personal_data_requests/migration.sql',
  );
  assert.match(controller, /privacy\/export/);
  assert.match(controller, /privacy\/requests/);
  assert.match(controller, /Cache-Control', 'no-store/);
  assert.match(controller, /PERSONAL_DATA_EXPORTED/);
  assert.match(controller, /PERSONAL_DATA_REQUEST_CREATED/);
  assert.match(read('mock-api/routes/customerAuth.js'), /account\/privacy\/requests/);
  assert.match(migration, /PersonalDataRequest/);
  assert.doesNotMatch(migration, /DROP TABLE|DROP COLUMN/i);
});

test('Phase 10 contains only service structured data and dynamic CMS sitemap sources', () => {
  const seo = read('frontend-user/src/seo/SeoManager.tsx');
  const sitemap = read('frontend-user/scripts/generate-sitemap.mjs');
  const robots = read('frontend-user/scripts/generate-robots.mjs');
  for (const schema of ['LocalBusiness', 'Service', 'Article', 'BreadcrumbList']) {
    assert.match(seo, new RegExp(schema));
  }
  assert.doesNotMatch(seo, /@type['"]?\s*:\s*['"]Product/i);
  for (const endpoint of ['/services', '/projects', '/posts'])
    assert.match(sitemap, new RegExp(endpoint));
  assert.match(sitemap, /FORBIDDEN_COMMERCE_ROUTE/);
  assert.doesNotMatch(robots, /\/products?|\/cart|\/checkout|\/orders?|\/inventory/i);
});

test('Phase 10 keeps Web Vitals budgets and privacy-safe observability', () => {
  const vitals = read('frontend-user/src/performance/webVitals.ts');
  const lighthouse = read('.github/workflows/customer-lighthouse.yml');
  const customerReporter = read('frontend-user/src/observability/errorReporter.ts');
  const adminReporter = read('frontend-admin/src/observability/errorReporter.ts');
  const logging = read('backend/src/common/interceptors/request-logging.interceptor.ts');
  const monitor = read('scripts/monitor-health.mjs');
  const performanceCss = read('frontend-user/src/styles/phase13-performance.css');
  for (const metric of ['LCP', 'CLS', 'INP']) assert.match(vitals, new RegExp(metric));
  assert.match(lighthouse, /audit_route booking \/service-booking mobile/);
  for (const reporter of [customerReporter, adminReporter]) {
    assert.match(reporter, /VITE_ERROR_REPORTING_ENDPOINT/);
    assert.match(reporter, /credentials: 'omit'/);
    assert.match(reporter, /safeRoute/);
    assert.doesNotMatch(reporter, /error\.message|location\.search/);
  }
  assert.match(logging, /traceId/);
  assert.match(logging, /deploymentEnvironment/);
  assert.match(monitor, /ALERT_WEBHOOK_URL/);
  assert.match(performanceCss, /data-image-key='home\.hero'/);
});
