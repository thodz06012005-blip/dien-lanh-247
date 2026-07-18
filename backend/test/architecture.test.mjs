import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = (file) => readFileSync(resolve(root, file), 'utf8');

test('backend exposes configuration, API contract and Prisma files', () => {
  const requiredFiles = [
    '.env.example',
    'prisma/schema.prisma',
    'prisma/seed.ts',
    'prisma/migrations/README.md',
    'src/config/environment.ts',
    'src/common/constants/error-codes.ts',
    'src/common/exceptions/business.exception.ts',
    'src/common/filters/http-exception.filter.ts',
    'src/common/interceptors/api-response.interceptor.ts',
    'src/common/interfaces/api-response.interface.ts',
    'src/common/middleware/request-context.middleware.ts',
    'src/common/middleware/security.middleware.ts',
  ];

  for (const file of requiredFiles) {
    assert.equal(existsSync(resolve(root, file)), true, `Missing ${file}`);
  }
});

test('backend TypeScript declares application aliases', () => {
  const tsconfig = JSON.parse(read('tsconfig.json'));
  assert.deepEqual(tsconfig.compilerOptions.paths['@/*'], ['src/*']);
  assert.deepEqual(tsconfig.compilerOptions.paths['@modules/*'], [
    'src/modules/*',
  ]);
});

test('backend bootstrap registers request correlation, validation and error handling', () => {
  const main = read('src/main.ts');
  assert.match(main, /requestContextMiddleware/);
  assert.match(main, /HttpErrorFilter/);
  assert.match(main, /ValidationPipe/);
  assert.match(main, /enableShutdownHooks/);
});

test('backend environment example contains placeholders instead of real secrets', () => {
  const environment = read('.env.example');
  assert.match(environment, /DATABASE_URL=/);
  assert.match(environment, /JWT_ACCESS_SECRET=replace_/);
  assert.match(environment, /JWT_REFRESH_SECRET=replace_/);
  assert.doesNotMatch(
    environment,
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  );
  assert.doesNotMatch(environment, /\bghp_[A-Za-z0-9]{30,}\b/);
});

test('Phase 5 migration is additive and keeps service finance outside legacy commerce', () => {
  const migration = read(
    'prisma/migrations/20260718120000_phase5_safe_legacy_booking/migration.sql',
  );
  assert.doesNotMatch(migration, /\b(?:DROP|TRUNCATE|RENAME)\b/i);
  assert.doesNotMatch(migration, /\bDELETE\s+FROM\b/i);
  assert.match(migration, /CREATE TABLE `LegacyDomainMetadata`/);
  assert.match(migration, /CREATE TABLE `ServiceRequestSubmission`/);
  assert.match(migration, /CREATE TABLE `ServiceRequestScheduleChange`/);
  assert.doesNotMatch(
    migration,
    /\('(?:ORDER_PAYMENT|ORDER|INVENTORY)', 'Service(?:QuoteLine|PaymentRecord)'/,
  );
});

test('Phase 6 enforces idempotency, disclosure and optimistic locking in backend code', () => {
  const controller = read(
    'src/modules/service-requests/service-requests.controller.ts',
  );
  const service = read(
    'src/modules/service-requests/service-requests.service.ts',
  );
  const dto = read(
    'src/modules/service-requests/dto/create-service-request.dto.ts',
  );
  const account = read('src/modules/users/users.service.ts');
  assert.match(controller, /@Headers\('idempotency-key'\)/);
  assert.match(service, /ServiceRequestSubmission/);
  assert.match(service, /requestVersion !== dto\.requestVersion/);
  assert.match(dto, /pricingDisclosureAccepted/);
  assert.match(account, /ServiceRequestScheduleChange/);
  assert.match(account, /customerUserId = \? AND requestVersion = \?/);
});
