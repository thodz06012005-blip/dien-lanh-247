import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { getInitialData } = require('../../mock-api/seed/initialData.js');
const {
  isCommerceApiPath,
  resolveServiceOnlyMode,
  serviceOnlyMiddleware,
} = require('../../mock-api/config/serviceOnly.js');

const source = (relativePath) => readFileSync(path.join(root, relativePath), 'utf8');

test('service-only flag defaults safe and production cannot disable it', () => {
  assert.equal(resolveServiceOnlyMode({ NODE_ENV: 'test' }), true);
  assert.equal(resolveServiceOnlyMode({ NODE_ENV: 'development', SERVICE_ONLY_MODE: 'false' }), false);
  assert.throws(
    () => resolveServiceOnlyMode({ NODE_ENV: 'production', SERVICE_ONLY_MODE: 'false' }),
    /must be true in production/,
  );
  assert.throws(
    () => resolveServiceOnlyMode({ NODE_ENV: 'test', SERVICE_ONLY_MODE: 'sometimes' }),
    /must be true or false/,
  );
});
test('commerce path matcher does not collide with service quotation or payment', () => {
  for (const value of [
    '/products',
    '/products/featured',
    '/cart/items',
    '/orders/42',
    '/admin/products',
    '/admin/orders/42',
    '/account/orders/42',
  ]) assert.equal(isCommerceApiPath(value), true, value);

  for (const value of [
    '/service-categories',
    '/service-requests/SR-1',
    '/account/service-requests',
    '/admin/operations/service-requests/SR-1/quotes',
    '/admin/operations/service-requests/SR-1/payments',
  ]) assert.equal(isCommerceApiPath(value), false, value);
});

test('mock guard rejects commerce directly with a stable 410 contract', () => {
  let nextCalled = false;
  let statusCode = 0;
  let payload;
  const response = {
    status(value) { statusCode = value; return this; },
    json(value) { payload = value; return this; },
  };
  serviceOnlyMiddleware(true)(
    { path: '/products', url: '/products' },
    response,
    () => { nextCalled = true; },
  );
  assert.equal(nextCalled, false);
  assert.equal(statusCode, 410);
  assert.equal(payload.error.code, 'COMMERCE_DISABLED');
});

test('service-only mock seed excludes commerce but preserves service fixtures', () => {
  const data = getInitialData({ NODE_ENV: 'test', SERVICE_ONLY_MODE: 'true' });
  assert.deepEqual(data.products, []);
  assert.deepEqual(data.orders, []);
  assert.deepEqual(data.categories, []);
  assert.deepEqual(data.brands, []);
  assert.ok(data.serviceCategories.length > 0);
  assert.ok(data.serviceRequests.length > 0);
  assert.ok(data.technicians.length > 0);
});

test('all four applications declare the feature flag and server guard is global', () => {
  const backendEnvironment = source('backend/src/config/environment.ts');
  const backendModule = source('backend/src/app.module.ts');
  const backendGuard = source('backend/src/common/guards/service-only.guard.ts');
  const backendDashboard = source('backend/src/modules/dashboard/dashboard.service.ts');
  const accountService = source('backend/src/modules/users/users.service.ts');
  const customerEnvironment = source('frontend-user/src/config/env.ts');
  const adminEnvironment = source('frontend-admin/src/config/env.ts');
  const mockServer = source('mock-api/server.js');

  assert.match(backendEnvironment, /SERVICE_ONLY_MODE must be true in production/);
  assert.match(backendModule, /APP_GUARD, useClass: ServiceOnlyGuard/);
  assert.match(backendGuard, /COMMERCE_DISABLED/);
  assert.match(backendDashboard, /getServiceOnlyDashboardStats/);
  assert.match(accountService, /serviceOnlyMode \? '0'/);
  assert.match(customerEnvironment, /VITE_SERVICE_ONLY_MODE/);
  assert.match(adminEnvironment, /VITE_SERVICE_ONLY_MODE/);
  assert.match(mockServer, /serviceOnlyMiddleware\(serviceOnlyMode\)/);
});

test('admin commerce routes stay gated while the customer app is permanently service-only', () => {
  const customerRouter = source('frontend-user/src/router/AppRouter.tsx');
  const customerHeader = source('frontend-user/src/components/layout/Header.tsx');
  const adminRouter = source('frontend-admin/src/router/AppRouter.tsx');
  const adminNavigation = source('frontend-admin/src/config/adminNavigation.ts');

  assert.match(customerRouter, /path="products\/\*"/);
  assert.match(customerRouter, /to="\/services" replace/);
  assert.doesNotMatch(customerRouter, /pages\/(?:Products|ProductDetail|Cart|Checkout|Orders)/);
  assert.doesNotMatch(customerHeader, /serviceOnlyMode|ShoppingCart|cartStore/);
  assert.match(adminRouter, /path="orders\/\*"/);
  assert.match(adminNavigation, /commerceOnly: true/);
  assert.match(customerRouter, /path="service-booking"/);
  assert.match(adminNavigation, /\/operations/);
});
