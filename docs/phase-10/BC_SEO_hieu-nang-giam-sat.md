# Báo cáo SEO, hiệu năng và theo dõi — Phase 10

Ngày kiểm kê: 18/07/2026
Contract: service-only

## SEO

- Chỉ giữ JSON-LD `LocalBusiness`, `HomeAndConstructionBusiness`, `Service`, `Article` và `BreadcrumbList`.
- Không có Product JSON-LD, merchant metadata hoặc URL sản phẩm/giỏ hàng/checkout/order trong sitemap và robots.
- Sitemap lấy động `/services`, `/projects`, `/posts` từ CMS, phân trang, chỉ nhận bản ghi `PUBLISHED` khi API trả `status`, thêm `lastmod` hợp lệ và loại trùng URL.
- Route tài khoản, tra cứu, báo giá, xác nhận đặt lịch và design system là `noindex` và bị chặn trong robots.
- `npm run seo:scan-commerce-metadata` là cổng release độc lập.

## Hiệu năng

- Bundle gate: initial JS gzip ≤ 250 KB, initial CSS gzip ≤ 80 KB, mỗi JS chunk ≤ 350 KB, mỗi ảnh ≤ 250 KB.
- Lighthouse: mobile performance ≥ 85, desktop ≥ 90, accessibility/best-practices ≥ 90, SEO ≥ 95.
- Route matrix: Home, Services, Projects, Articles, Service Booking trên mobile; Home trên desktop.
- Field monitoring giữ LCP, CLS và INP; LCP/CLS có lab budgets, INP được đo bằng `PerformanceObserver` ngoài hiện trường.

## Observability

- Backend phát structured log có `requestId`, `traceId`, service, environment, route, status, duration và outcome; không ghi body, cookie, token, địa chỉ hoặc ảnh.
- Hai frontend có error reporter tùy chọn qua `VITE_ERROR_REPORTING_ENDPOINT`; payload chỉ chứa app, nguồn lỗi, tên lỗi, fingerprint, pathname, release và thời gian. Không gửi message, stack, query string, credential hoặc cookie.
- Health monitor kiểm tra readiness theo retry/timeout và gửi webhook cảnh báo qua `ALERT_WEBHOOK_URL`.
- Error endpoint và alert webhook là cấu hình production; hệ thống vẫn hoạt động nếu error endpoint không được cấu hình.

## Cổng nghiệm thu

- `seo:scan-commerce-metadata`: phải PASS.
- Build budgets: phải PASS.
- GitHub Lighthouse route matrix: phải PASS.
- Security/structured logging contracts: phải PASS.

## Tham chiếu trình bày và hành vi

- [Điện Lạnh Số Đỏ](https://dienlanhsodo.com/): ưu tiên nhóm Dịch vụ, Quy trình, Bảng giá, Bảo hành và Đặt lịch thay cho catalog bán lẻ.
- [Thợ Việt](https://thoviet.com.vn/tho-dien-lanh): CTA đặt lịch/gọi rõ ràng và diễn giải quy trình khảo sát → báo giá → thực hiện → bảo hành theo từng bước.
- [Al-Air](https://al-airfl.com/book-online/) và [EHC](https://www.eheatcool.com/schedule): biểu mẫu đặt lịch ngắn, nêu thời gian hoàn thành, luôn có phương án gọi điện thay thế.
- [Barineau Customer Portal](https://barineauac.com/portal/): gom lịch hẹn, lịch sử dịch vụ và tự phục vụ vào một hub; dự án giữ đúng sáu tab đã khóa ở Phase 2.

Các trang trên chỉ là tham chiếu thứ bậc thông tin và hành vi. Màu, hoạt cảnh, hình nền và ảnh vẫn dùng design system/asset key nội bộ; không hotlink và không thêm ảnh ngoài làm phụ thuộc LCP.

## Nguồn chuẩn đối chiếu

- [Google Search Central](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data): structured data, Article và Breadcrumb; kiểm thử trước khi yêu cầu crawl lại.
- [web.dev Core Web Vitals](https://web.dev/explore/learn-core-web-vitals): LCP, CLS và INP.
- [OpenTelemetry semantic conventions](https://opentelemetry.io/docs/concepts/semantic-conventions/): tên trường log/trace nhất quán giữa dịch vụ.
