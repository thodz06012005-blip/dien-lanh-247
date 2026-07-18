import {
  Bell,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Settings,
  UserRound,
  Users,
  Workflow,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { ADMIN_PERMISSIONS } from './adminPermissions';
import type { AdminPermission } from '@/types/admin';

export interface AdminNavigationItem {
  path: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  permission: AdminPermission;
  exact?: boolean;
  keywords?: string[];
}

export interface AdminNavigationGroup {
  title: string;
  items: AdminNavigationItem[];
}

export const adminNavigation: AdminNavigationGroup[] = [
  {
    title: 'Điều hành dịch vụ',
    items: [
      { path: '/', label: 'Tổng quan dịch vụ', shortLabel: 'Tổng quan', icon: LayoutDashboard, permission: ADMIN_PERMISSIONS.DASHBOARD_VIEW, exact: true, keywords: ['dashboard', 'kpi', 'sla', 'doanh thu dịch vụ'] },
      { path: '/operations', label: 'Trung tâm điều phối', shortLabel: 'Điều phối', icon: Workflow, permission: ADMIN_PERMISSIONS.OPERATIONS_VIEW, keywords: ['sla', 'báo giá', 'bảo hành', 'kỹ thuật viên', 'thiết bị'] },
      { path: '/service-requests', label: 'Yêu cầu sửa chữa', shortLabel: 'Dịch vụ', icon: Wrench, permission: ADMIN_PERMISSIONS.SERVICES_VIEW, keywords: ['yêu cầu', 'trạng thái', 'lịch hẹn'] },
      { path: '/notifications', label: 'Trung tâm thông báo', shortLabel: 'Thông báo', icon: Bell, permission: ADMIN_PERMISSIONS.NOTIFICATIONS_VIEW, keywords: ['cảnh báo', 'sla', 'email'] },
    ],
  },
  {
    title: 'Khách hàng & nội dung',
    items: [
      { path: '/customers', label: 'Hồ sơ khách hàng', shortLabel: 'Khách hàng', icon: Users, permission: ADMIN_PERMISSIONS.CUSTOMERS_VIEW, keywords: ['crm', 'thiết bị', 'lịch sử dịch vụ'] },
      { path: '/technicians', label: 'Quản lý kỹ thuật viên', shortLabel: 'Kỹ thuật viên', icon: UserRound, permission: ADMIN_PERMISSIONS.TECHNICIANS_VIEW, keywords: ['thợ', 'phân công', 'lịch làm việc'] },
      { path: '/content', label: 'Content Hub', shortLabel: 'Nội dung', icon: FileText, permission: ADMIN_PERMISSIONS.CONTENT_VIEW, keywords: ['bài viết', 'dự án', 'dịch vụ'] },
    ],
  },
  {
    title: 'Hệ thống',
    items: [
      { path: '/settings', label: 'Cài đặt hệ thống', shortLabel: 'Cài đặt', icon: Settings, permission: ADMIN_PERMISSIONS.SETTINGS_VIEW, keywords: ['cấu hình', 'hotline', 'zalo'] },
      { path: '/audit', label: 'Nhật ký kiểm toán', shortLabel: 'Audit', icon: ClipboardList, permission: ADMIN_PERMISSIONS.AUDIT_VIEW, keywords: ['bảo mật', 'nhật ký', 'truy vết'] },
    ],
  },
];

export const flatAdminNavigation = adminNavigation.flatMap((group) => group.items);

export function getAdminRouteMeta(pathname: string) {
  const normalized = pathname === '' ? '/' : pathname;
  const exact = flatAdminNavigation.find((item) => item.exact && item.path === normalized);
  const nested = flatAdminNavigation
    .filter((item) => !item.exact && normalized.startsWith(item.path))
    .sort((left, right) => right.path.length - left.path.length)[0];
  if (normalized.startsWith('/profile')) {
    return { label: 'Hồ sơ quản trị', path: '/profile', permission: ADMIN_PERMISSIONS.PROFILE_VIEW };
  }
  return exact ?? nested ?? { label: 'Trang quản trị', path: normalized, permission: undefined };
}
