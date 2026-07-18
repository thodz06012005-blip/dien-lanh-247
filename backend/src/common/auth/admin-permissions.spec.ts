import {
  ADMIN_PERMISSIONS,
  getAdminPermissions,
  hasAdminPermissions,
} from './admin-permissions';

describe('service-only admin RBAC negative cases', () => {
  it('contains no commerce permission in any role catalog', () => {
    const catalog = Object.values(ADMIN_PERMISSIONS).join(' ');
    expect(catalog).not.toMatch(
      /product|order|inventory|cart|checkout|shipping|return|coupon|promotion/i,
    );
    for (const role of ['SUPERADMIN', 'ADMIN', 'STAFF']) {
      expect(getAdminPermissions(role).join(' ')).not.toMatch(
        /product|order|inventory/i,
      );
    }
  });

  it('denies unknown and customer roles every admin permission', () => {
    for (const role of [undefined, 'CUSTOMER', 'TECHNICIAN', 'unknown']) {
      expect(
        hasAdminPermissions(role, [ADMIN_PERMISSIONS.DASHBOARD_VIEW]),
      ).toBe(false);
    }
  });

  it('denies staff and regular admins elevated operations', () => {
    expect(
      hasAdminPermissions('STAFF', [ADMIN_PERMISSIONS.SETTINGS_MANAGE]),
    ).toBe(false);
    expect(hasAdminPermissions('STAFF', [ADMIN_PERMISSIONS.AUDIT_VIEW])).toBe(
      false,
    );
    expect(
      hasAdminPermissions('STAFF', [ADMIN_PERMISSIONS.CUSTOMERS_MANAGE]),
    ).toBe(false);
    expect(
      hasAdminPermissions('ADMIN', [ADMIN_PERMISSIONS.SETTINGS_MANAGE]),
    ).toBe(false);
    expect(hasAdminPermissions('ADMIN', [ADMIN_PERMISSIONS.AUDIT_VIEW])).toBe(
      false,
    );
  });

  it('requires every permission when mode is all', () => {
    expect(
      hasAdminPermissions(
        'STAFF',
        [ADMIN_PERMISSIONS.DASHBOARD_VIEW, ADMIN_PERMISSIONS.SETTINGS_VIEW],
        'all',
      ),
    ).toBe(false);
  });
});
