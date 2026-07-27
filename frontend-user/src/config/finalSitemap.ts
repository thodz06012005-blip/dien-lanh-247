export interface SitemapGroup {
  label: string;
  routes: ReadonlyArray<{
    path: string;
    purpose: string;
    indexable: boolean;
  }>;
}

export const FINAL_CUSTOMER_SITEMAP = [
  {
    label: 'Trang chính',
    routes: [{ path: '/', purpose: 'Giá trị, dịch vụ, quy trình, bằng chứng và CTA', indexable: true }],
  },
  {
    label: 'Dịch vụ',
    routes: [
      { path: '/services', purpose: 'Danh sách dịch vụ đã xuất bản', indexable: true },
      { path: '/services/:slug', purpose: 'Chi tiết phạm vi, giá, quy trình và bảo hành', indexable: true },
    ],
  },
  {
    label: 'Đặt dịch vụ',
    routes: [
      { path: '/service-booking', purpose: 'Form yêu cầu dịch vụ bốn bước', indexable: false },
      { path: '/service-booking/success', purpose: 'Xác nhận tiếp nhận và mã tra cứu', indexable: false },
    ],
  },
  {
    label: 'Tra cứu',
    routes: [{ path: '/service-lookup', purpose: 'Tra cứu bằng mã và số điện thoại', indexable: false }],
  },
  {
    label: 'Dự án',
    routes: [
      { path: '/projects', purpose: 'Danh sách dự án đã xác minh', indexable: true },
      { path: '/projects/:slug', purpose: 'Hồ sơ dự án và bằng chứng được phép công bố', indexable: true },
    ],
  },
  {
    label: 'Bài viết',
    routes: [
      { path: '/articles', purpose: 'Danh sách hướng dẫn và nội dung SEO', indexable: true },
      { path: '/articles/:slug', purpose: 'Chi tiết bài viết', indexable: true },
    ],
  },
  {
    label: 'Doanh nghiệp',
    routes: [
      { path: '/about', purpose: 'Thông tin doanh nghiệp và quy trình', indexable: true },
      { path: '/contact', purpose: 'Khu vực, thời gian và kênh liên hệ', indexable: true },
    ],
  },
  {
    label: 'Chính sách',
    routes: [{ path: '/policy/:slug', purpose: 'Điều khoản và chính sách dịch vụ', indexable: true }],
  },
  {
    label: 'Tài khoản',
    routes: [
      { path: '/account', purpose: 'Hồ sơ và quyền dữ liệu', indexable: false },
      { path: '/my-services', purpose: 'Lịch sử yêu cầu dịch vụ', indexable: false },
      { path: '/my-services/:id', purpose: 'Theo dõi chi tiết một yêu cầu', indexable: false },
    ],
  },
  {
    label: 'Xác thực',
    routes: [
      { path: '/login', purpose: 'Đăng nhập', indexable: false },
      { path: '/register', purpose: 'Đăng ký', indexable: false },
      { path: '/forgot-password', purpose: 'Yêu cầu đặt lại mật khẩu', indexable: false },
      { path: '/reset-password', purpose: 'Đặt lại mật khẩu', indexable: false },
      { path: '/verify-email', purpose: 'Xác minh email', indexable: false },
    ],
  },
] as const satisfies ReadonlyArray<SitemapGroup>;

export const FINAL_CUSTOMER_ROUTE_PATHS = FINAL_CUSTOMER_SITEMAP.flatMap((group) =>
  group.routes.map((route) => route.path),
);
