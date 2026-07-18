import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const read = (file) => readFileSync(resolve(root, file), 'utf8');

test('commerce modules and mock routers are absent from runtime', () => {
  for (const path of [
    'backend/src/modules/products/products.module.ts',
    'backend/src/modules/cart/cart.module.ts',
    'backend/src/modules/orders/orders.module.ts',
    'backend/src/modules/categories/categories.module.ts',
    'backend/src/modules/brands/brands.module.ts',
    'mock-api/routes/orders.js',
    'mock-api/routes/adminProducts.js',
  ])
    assert.equal(existsSync(resolve(root, path)), false, `${path} must be removed`);

  const backend = read('backend/src/app.module.ts');
  const mock = read('mock-api/server.js');
  assert.doesNotMatch(backend, /modules\/(?:products|cart|orders|categories|brands)\//);
  assert.doesNotMatch(mock, /ordersRouter|adminProductsRouter|mapProductToUser/);
});

test('service quotation, material, payment and warranty capabilities remain', () => {
  const controller = read('backend/src/modules/operations/operations.controller.ts');
  const calculator = read('backend/src/modules/operations/quote-calculator.ts');
  const mock = read('mock-api/routes/adminOperations.js');
  for (const marker of ['quotes', 'payments', 'completion', 'warranties']) {
    assert.match(controller, new RegExp(marker));
    assert.match(mock, new RegExp(marker));
  }
  assert.match(calculator, /lineType === 'MATERIAL'/);
  assert.match(calculator, /lineType === 'LABOR'/);
});

test('default seeds contain no commerce keys and archive legacy fixtures', () => {
  const snapshot = JSON.parse(read('mock-api/seed/service-only.snapshot.json'));
  for (const key of ['products', 'orders', 'cart', 'inventory', 'categories', 'brands']) {
    assert.equal(key in snapshot, false, `${key} leaked into the service-only snapshot`);
  }
  assert.ok(snapshot.serviceRequests.length > 0);
  assert.ok(snapshot.technicians.length > 0);
  assert.equal(existsSync(resolve(root, 'mock-api/legacy/mock-db.pre-service-only.json')), true);
  assert.equal(existsSync(resolve(root, 'mock-api/legacy/initialData.commerce.js')), true);

  const seed = read('backend/prisma/seed.ts');
  assert.doesNotMatch(seed, /prisma\.(product|order|cart|category|brand|coupon)/);
  assert.match(seed, /serviceCategory/);
});

test('backend and mock publish the same service-only health capability contract', () => {
  for (const source of [
    read('backend/src/modules/health/health.service.ts'),
    read('mock-api/routes/public.js'),
  ]) {
    assert.match(source, /service-only-v1/);
    assert.match(source, /commerce:\s*false/);
    assert.match(source, /quotations:\s*true/);
    assert.match(source, /servicePayments:\s*true/);
    assert.match(source, /warranty:\s*true/);
  }
});

test('public settings and account contracts no longer expose commerce', () => {
  const settings = read('backend/src/modules/settings/settings.service.ts');
  const users = read('backend/src/modules/users/users.controller.ts');
  const permissions = read('backend/src/common/auth/admin-permissions.ts');
  assert.doesNotMatch(settings, /shippingFee|freeShippingThreshold/);
  assert.doesNotMatch(users, /@Get\('orders/);
  assert.doesNotMatch(permissions, /PRODUCTS_|ORDERS_|design-system\.view/);
  assert.match(permissions, /notifications\.view/);
});

test('retained admin profile contract is mirrored by the Mock API', () => {
  const mock = read('mock-api/server.js');
  for (const marker of [
    "'/api/v1/admin/auth/sessions'",
    "'/api/v1/admin/auth/profile'",
    "'/api/v1/admin/auth/change-password'",
    "'/api/v1/admin/auth/sessions/:id'",
  ]) {
    assert.match(mock, new RegExp(marker.replaceAll('/', '\\/')));
  }
});
