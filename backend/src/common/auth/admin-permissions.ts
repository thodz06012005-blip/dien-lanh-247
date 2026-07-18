export const ADMIN_PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_MANAGE: 'customers.manage',
  SERVICES_VIEW: 'services.view',
  SERVICES_MANAGE: 'services.manage',
  TECHNICIANS_VIEW: 'technicians.view',
  TECHNICIANS_MANAGE: 'technicians.manage',
  OPERATIONS_VIEW: 'operations.view',
  OPERATIONS_MANAGE: 'operations.manage',
  CONTENT_VIEW: 'content.view',
  CONTENT_MANAGE: 'content.manage',
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_MANAGE: 'settings.manage',
  NOTIFICATIONS_VIEW: 'notifications.view',
  PROFILE_VIEW: 'profile.view',
  PROFILE_MANAGE: 'profile.manage',
  AUDIT_VIEW: 'audit.view',
} as const;

export type AdminPermission =
  (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];

const ALL_PERMISSIONS = Object.values(ADMIN_PERMISSIONS);

const ADMIN_ROLE_PERMISSIONS: Record<string, readonly AdminPermission[]> = {
  SUPERADMIN: ALL_PERMISSIONS,
  ADMIN: ALL_PERMISSIONS.filter(
    (permission) =>
      permission !== ADMIN_PERMISSIONS.SETTINGS_MANAGE &&
      permission !== ADMIN_PERMISSIONS.AUDIT_VIEW,
  ),
  STAFF: [
    ADMIN_PERMISSIONS.DASHBOARD_VIEW,
    ADMIN_PERMISSIONS.CUSTOMERS_VIEW,
    ADMIN_PERMISSIONS.SERVICES_VIEW,
    ADMIN_PERMISSIONS.SERVICES_MANAGE,
    ADMIN_PERMISSIONS.TECHNICIANS_VIEW,
    ADMIN_PERMISSIONS.OPERATIONS_VIEW,
    ADMIN_PERMISSIONS.OPERATIONS_MANAGE,
    ADMIN_PERMISSIONS.CONTENT_VIEW,
    ADMIN_PERMISSIONS.NOTIFICATIONS_VIEW,
    ADMIN_PERMISSIONS.PROFILE_VIEW,
    ADMIN_PERMISSIONS.PROFILE_MANAGE,
  ],
};

export function getAdminPermissions(role?: string | null): AdminPermission[] {
  if (!role) return [];
  return [...(ADMIN_ROLE_PERMISSIONS[role.toUpperCase()] ?? [])];
}

export function hasAdminPermissions(
  role: string | null | undefined,
  required: readonly AdminPermission[],
  mode: 'all' | 'any' = 'all',
) {
  if (!required.length) return true;
  const granted = new Set(getAdminPermissions(role));
  return mode === 'any'
    ? required.some((permission) => granted.has(permission))
    : required.every((permission) => granted.has(permission));
}
