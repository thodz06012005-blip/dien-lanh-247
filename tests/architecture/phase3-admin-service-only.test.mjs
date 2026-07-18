import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const read = (file) => readFileSync(resolve(root, file), 'utf8');

test('admin commerce feature bundles are physically absent', () => {
  for (const file of [
    'frontend-admin/src/pages/Products.tsx',
    'frontend-admin/src/pages/Orders.tsx',
    'frontend-admin/src/components/admin/DashboardCharts.tsx',
  ]) {
    assert.equal(existsSync(resolve(root, file)), false, `${file} must not ship in the admin bundle`);
  }
});

test('admin navigation contains service operations only', () => {
  const navigation = read('frontend-admin/src/config/adminNavigation.ts');
  const permissions = read('frontend-admin/src/config/adminPermissions.ts');
  const router = read('frontend-admin/src/router/AppRouter.tsx');

  for (const required of ['operations', 'service-requests', 'technicians', 'customers', 'notifications', 'content', 'settings', 'audit']) {
    assert.match(navigation, new RegExp(required));
  }
  assert.doesNotMatch(navigation, /\/products|\/orders|Sản phẩm|Đơn hàng|Tồn kho/);
  assert.doesNotMatch(permissions, /PRODUCTS_|ORDERS_|DESIGN_SYSTEM_/);
  assert.doesNotMatch(router, /pages\/(Products|Orders)|features\/(products|orders)/);
});

test('mock sessions expose service-only role navigation permissions', () => {
  const auth = read('mock-api/utils/auth.js');
  assert.match(auth, /UI_ROLE_PERMISSIONS/);
  assert.match(auth, /notifications\.view/);
  assert.match(auth, /audit\.view/);

  const uiPermissionBlock = auth.slice(auth.indexOf('const UI_ROLE_PERMISSIONS'), auth.indexOf('const getUiPermissions'));
  assert.doesNotMatch(uiPermissionBlock, /products\.|orders\.|design-system\./);
});

test('dashboard prioritizes SLA, dispatch, quotations, service revenue and warranty', () => {
  const dashboard = read('frontend-admin/src/pages/Dashboard.tsx');
  for (const marker of ['SLA', 'Kỹ thuật viên', 'Báo giá', 'Doanh thu dịch vụ', 'Bảo hành']) {
    assert.match(dashboard, new RegExp(marker));
  }
  assert.doesNotMatch(dashboard, /Sản phẩm|Đơn hàng|Tồn kho/);
});
