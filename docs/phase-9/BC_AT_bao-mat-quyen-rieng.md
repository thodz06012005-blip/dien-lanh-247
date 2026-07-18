# Báo cáo bảo mật và quyền riêng tư — Phase 9

Ngày kiểm kê: 18/07/2026
Phạm vi: backend, Mock API, customer web, admin web, backup/restore và CI
Trạng thái phát hành: **TECHNICAL PASS — chờ chủ cửa hàng/tư vấn pháp lý duyệt retention cuối**

## Quyết định không mâu thuẫn

- Catalog quyền backend, kiểu frontend, navigation guard và role mapping chỉ còn nghiệp vụ dịch vụ; không có `product`, `order`, `inventory`, `cart`, `checkout`, `shipping`, `return`, `coupon` hay `promotion`.
- Báo giá dịch vụ, thanh toán dịch vụ, dòng vật tư/linh kiện, nghiệm thu và bảo hành không bị xóa hoặc đổi quyền ngoài phạm vi.
- Schema Phase 9 chỉ thêm `PersonalDataRequest`; không `DROP` bảng/cột và không tự động xóa hồ sơ đang có nghĩa vụ lưu trữ.

## Kiểm soát bắt buộc

| Kiểm soát | Trạng thái | Bằng chứng |
|---|---:|---|
| Login lockout + rate limit | PASS | `LoginRateLimitService`, throttle login/refresh |
| Refresh rotation/reuse detection | PASS | `AuthSession`, `TOKEN_REUSE_DETECTED` |
| HttpOnly/Secure/SameSite cookie | PASS | customer/admin auth controllers |
| Super Admin step-up | PASS | cookie 5 phút, gắn user + session, áp dụng khi sửa settings |
| CSRF | PASS | allowed origin/same-site + `X-CSRF-Protection` cho browser cookie writes |
| CORS/CSP/HSTS | PASS | allowlist production, CSP API deny-by-default |
| Upload magic bytes | PASS | JPEG/PNG/WebP signature, extension và 5 MB limit |
| Audit redaction | PASS | token/cookie/address/phone/email/image/media bị redacted |
| Secret scan | CI gate | không in matched secret |
| Backup encryption | PASS | AES-256-GCM bắt buộc khi `NODE_ENV=production`, checksum sau mã hóa |
| Production data isolation | PASS | `DATASET_CLASSIFICATION=production` bị từ chối ngoài production |

## Tối thiểu hóa và quyền dữ liệu

- Form chỉ thu thập thông tin cần cho liên hệ, thiết bị/sự cố, địa chỉ/lịch và ảnh/ghi chú tự nguyện.
- Account Hub cung cấp tải bản sao dữ liệu, sửa hồ sơ/địa chỉ, xóa địa chỉ, thu hồi session và gửi yêu cầu `ACCESS`, `RECTIFY`, `DELETE`, `RESTRICT`.
- Yêu cầu xóa tạo hồ sơ theo dõi và ngày đến hạn; không xóa tức thời dữ liệu báo giá, thanh toán, khiếu nại hoặc bảo hành có căn cứ lưu trữ.
- Dữ liệu export không chứa password, refresh-token hash, cookie, token reset/xác minh hoặc audit internals.

## Retention đề xuất

| Nhóm dữ liệu | Mốc giữ đề xuất | Hành động cuối kỳ |
|---|---|---|
| Session hết hạn/đã thu hồi | 30 ngày | xóa metadata thiết bị |
| Contact chưa thành yêu cầu dịch vụ | 90 ngày | xóa hoặc ẩn danh |
| Ảnh chẩn đoán | 180 ngày sau khi hết bảo hành/khiếu nại | xóa object + metadata |
| Audit bảo mật | 365 ngày | lưu trữ mã hóa hoặc xóa theo phê duyệt |
| Yêu cầu dịch vụ/báo giá/thanh toán/bảo hành | theo nghĩa vụ kế toán, thuế, bảo hành và tranh chấp được duyệt | ẩn danh trường không còn cần thiết |
| Yêu cầu quyền dữ liệu | 5 năm | xóa nội dung tự do, giữ biên nhận tối thiểu |

Retention trên là cấu hình đề xuất, không phải ý kiến pháp lý. Chủ cửa hàng và tư vấn pháp lý phải xác nhận trước go-live.

## Nguồn chuẩn đối chiếu

- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html): loại token/session secret và dữ liệu cá nhân khỏi log vận hành.
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html): cookie an toàn, rotation, revoke và step-up cho thao tác nhạy cảm.
- [Kế hoạch triển khai Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15](https://bcy.gov.vn/chinh-sach-phap-luat/ban-hanh-ke-hoach-trien-khai-thi-hanh-luat-bao-ve-du-lieu-ca-nhan-929009): dùng làm đầu vào cho quy trình quyền dữ liệu; thời hạn/retention cuối vẫn là legal gate.
