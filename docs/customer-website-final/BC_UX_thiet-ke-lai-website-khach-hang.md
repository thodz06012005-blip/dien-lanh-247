# BÁO CÁO THIẾT KẾ LẠI WEBSITE KHÁCH HÀNG

- Phạm vi: Giai đoạn 9 - website khách hàng cuối cùng
- Nền tích hợp: `agent/phase-11-12-uat-go-live`
- Mục tiêu: hoàn thiện sitemap, trang chủ và form đặt dịch vụ mà không thay đổi contract vận hành, báo giá, thanh toán, bảo hành, RBAC hay các cổng phát hành đã có
- Trạng thái: chờ kết quả CI và duyệt nội dung/ảnh thật trước go-live

## 1. Nguyên tắc tương thích

1. Yêu cầu lịch do khách gửi vẫn là yêu cầu chờ xác nhận, không phải lịch hẹn đã được chốt.
2. Giá trên website là khoảng tham khảo; kỹ thuật viên chỉ thực hiện sau khi chẩn đoán, gửi báo giá và nhận xác nhận.
3. Mã yêu cầu, idempotency key, optimistic locking, upload ảnh, notification retry, token/session và audit hiện có được giữ nguyên.
4. Không khôi phục giỏ hàng, checkout, đơn hàng bán lẻ, Product JSON-LD hay quyền commerce.
5. Dự án chỉ được công khai khi có bằng chứng và quyền sử dụng ảnh. Đánh giá chỉ được công khai khi có nguồn xác minh. Nếu chưa có dữ liệu đạt điều kiện, toàn bộ section được ẩn.

## 2. Sitemap cuối cùng

| Nhóm | Route | Mục đích |
| --- | --- | --- |
| Trang chính | `/` | Giá trị, dịch vụ, quy trình, bằng chứng và CTA |
| Dịch vụ | `/services`; `/services/:slug` | Danh sách và chi tiết dịch vụ |
| Đặt dịch vụ | `/service-booking`; `/service-booking/success` | Form bốn bước và xác nhận tiếp nhận |
| Tra cứu | `/service-lookup` | Tra cứu bằng mã yêu cầu và số điện thoại |
| Dự án | `/projects`; `/projects/:slug` | Hồ sơ năng lực đã xác minh |
| Bài viết | `/articles`; `/articles/:slug` | Hướng dẫn và nội dung SEO |
| Doanh nghiệp | `/about`; `/contact` | Thông tin, khu vực, giờ làm và liên hệ |
| Chính sách | `/policy/:slug` | Điều khoản, bảo mật, cookie, đặt lịch, báo giá, thanh toán, bảo hành và khiếu nại |
| Tài khoản | `/account`; `/my-services`; `/my-services/:id` | Hồ sơ, quyền dữ liệu và lịch sử dịch vụ |
| Xác thực | `/login`; `/register`; `/forgot-password`; `/reset-password`; `/verify-email` | Quản lý tài khoản |

Registry máy đọc được nằm tại `frontend-user/src/config/finalSitemap.ts`. Contract test đối chiếu registry với router để tránh mất route ở các đợt sửa sau.

## 3. Trang chủ

- Hero ưu tiên hai hành động: Đặt lịch và Gọi ngay; nêu rõ khu vực Hà Nội và nguyên tắc báo giá trước khi làm.
- Năm điểm vào dịch vụ: Sửa chữa, Vệ sinh, Lắp đặt, Bảo trì và Kiểm tra.
- Bảng giá tiếp tục dùng khoảng giá cùng điều kiện khảo sát, không biến thành cam kết giá cố định.
- Quy trình đúng sáu bước: Tiếp nhận → Xác nhận yêu cầu → Phân công → Chẩn đoán & báo giá → Thực hiện → Nghiệm thu & bảo hành.
- Cam kết giữ các nội dung: minh bạch báo giá, xác nhận trước khi làm, bảo hành theo hạng mục và bảo mật dữ liệu.
- Khu vực phục vụ và thời gian làm việc được trình bày riêng, đồng thời phân biệt khung giờ khách yêu cầu với lịch đã xác nhận.
- Dự án và đánh giá không có fallback giả. CMS không trả dữ liệu đủ bằng chứng thì section không render.
- Bài viết, FAQ và CTA cuối trang tiếp tục lấy từ contract nội dung hiện có.

## 4. Form đặt dịch vụ

| Bước | Dữ liệu | Kiểm soát |
| --- | --- | --- |
| 1. Liên hệ | Họ tên, điện thoại, email | Kiểm tra định dạng, consent liên hệ, honeypot; phản hồi không tiết lộ tài khoản |
| 2. Thiết bị và sự cố | Loại thiết bị, hãng, model tùy chọn, dịch vụ, mô tả, ưu tiên | Model không bắt buộc; mô tả tối đa 3.000 ký tự |
| 3. Địa chỉ và lịch | Tỉnh, quận/huyện, phường/xã, địa chỉ, ngày, khung giờ, ghi chú tiếp cận | Chỉ nhận Hà Nội; ngày theo `Asia/Ho_Chi_Minh`; lịch là yêu cầu chờ xác nhận |
| 4. Ảnh và xác nhận | Tối đa 5 ảnh, ghi chú ảnh, xác nhận giá/chính sách/dữ liệu | JPEG/PNG/WebP; kiểm tra MIME và magic bytes; tối đa 5 MB/ảnh; preview/remove; idempotency |

Backend, Mock API và Prisma migration được nâng cấp đồng bộ để không tạo sai khác local/test/production.

## 5. Hình ảnh và trình bày

Ảnh dịch vụ mới được lưu cục bộ theo ba kích thước WebP và quản lý qua asset key `service.diagnostic-team`; website không hotlink ảnh ngoài cho LCP.

Định hướng ảnh: kỹ thuật viên điện lạnh Việt Nam trong căn hộ hiện đại, thao tác chẩn đoán thực tế, đồng phục xanh navy/cyan không logo, ánh sáng tự nhiên, khung ngang 16:9, không chữ và không watermark. Ảnh thật thay thế sau này phải giữ cùng tỉ lệ, kích thước, alt text và có xác nhận quyền sử dụng.

Chuyển động tiếp tục dùng design system hiện có, tôn trọng `prefers-reduced-motion`; không bổ sung hiệu ứng gây cản trở thao tác hoặc làm tăng CLS.

## 6. Nguồn tham khảo

- ServiceTitan Scheduling Pro: luồng đặt lịch mobile-first, availability, buffer và arrival window.
- Housecall Pro Online Booking: phân biệt manual/flexible scheduling, service area và thông báo xác nhận.
- Jobber Client Hub: hành trình yêu cầu dịch vụ, báo giá, lịch hẹn và theo dõi sau dịch vụ.
- Housecall Pro HVAC website guide: CTA rõ, khu vực phục vụ, ảnh thật, đánh giá thật, hiệu năng mobile và online booking.

Các nguồn chỉ dùng để tham khảo hành vi và bố cục; không sao chép tài sản, nội dung hoặc tạo phụ thuộc runtime.

## 7. Cổng nghiệm thu

- `customer-final-redesign.test.mjs`: sitemap, năm dịch vụ, sáu bước, proof gate, booking contract.
- Lint và typecheck: bắt buộc PASS.
- Unit, integration, architecture và Mock API: bắt buộc PASS.
- Production build và bundle/metadata/security scan: bắt buộc PASS.
- Playwright responsive/browser matrix và Lighthouse trên GitHub Actions: bắt buộc PASS.
- Dữ liệu dự án, ảnh và đánh giá thật: chủ nội dung xác nhận bằng chứng/quyền trước publish.

