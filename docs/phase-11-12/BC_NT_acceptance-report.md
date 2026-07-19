# Acceptance report — Giai đoạn 11–12

**Phiên bản mục tiêu:** `v1.0.0`

**Trạng thái hiện tại:** Release Candidate / **NO-GO cho production thật**
**Ngày lập:** 2026-07-19

## 1. Kết quả kỹ thuật

| Cổng | Bằng chứng | Trạng thái hiện tại |
|---|---|---|
| Lint, typecheck, unit | Root scripts + unit upload/provider failure | PASS — Actions run `29679961499` |
| Integration/API | Phase 15 critical flow + Phase 11 risk matrix | PASS — Actions runs `29679961499`, `29679961508` |
| Architecture/Mock API | Phase 1–12 inherited contracts | PASS — Actions run `29679961499` |
| Playwright | Responsive matrix + offline/recovery banners | PASS — Actions runs `29679961499`, `29679961508` |
| Production build | Customer, admin, backend | PASS — Actions run `29679961508` |
| Backup/restore | Encrypted near-production Docker drill | PASS — Actions run `29679961508` |
| UAT người thật | Ba vai trò, không hướng dẫn từng nút | Chưa ký |
| Go-live configuration | Domain, CA TLS, secrets, SMTP, storage, alert, schedule, DB | Chưa có production credentials |

Head kỹ thuật được kiểm chứng: `661d163463fa2343eed304bd5bad119e2158092e`; 8/8 workflow trên PR #7 hoàn tất thành công ngày 2026-07-19.

## 2. Ma trận rủi ro bắt buộc

| Tình huống | Kỳ vọng |
|---|---|
| API timeout/mất mạng | Banner rõ ràng, giữ form, không retry mutation mù |
| Upload lỗi/spoof | Từ chối trước storage/provider; thông báo không lộ stack |
| Submit nhiều lần | Cùng khóa trả cùng mã; payload khác trả 409 |
| Token hết hạn | 401, refresh rotation hợp lệ, session revoke không tái sử dụng |
| Xung đột lịch | Backend trả 409 dù frontend có kiểm tra trước |
| Provider notification lỗi | Nghiệp vụ chính không rollback; outbox retry rồi DEAD |
| RBAC ba vai trò | Khách không vào admin; staff không vào Settings/Audit; admin vận hành đúng quyền |

## 3. Tương thích các giai đoạn trước

- Không sửa công thức báo giá, payment dịch vụ, vật tư, completion hoặc warranty.
- Không mở lại endpoint/menu commerce.
- Không hạ 2FA/step-up, CSRF, cookie, rotation, audit redaction hoặc backup encryption.
- Không ghi đè `docs/phase-12/`, vì thư mục đó là tài liệu Communications and Integrations cũ; bộ bàn giao mới đặt tại `docs/phase-11-12/`.

## 4. Trải nghiệm và trình bày

Banner kết nối dùng hai trạng thái amber/emerald, có `aria-live`, reduced-motion và thông điệp theo ngữ cảnh customer/admin. Luồng giữ phương án gọi điện thay thế và giải thích “lịch mong muốn chưa phải lịch đã chốt”, phù hợp cách các website HVAC như [Al-Air](https://al-airfl.com/book-online/), [EHC](https://www.eheatcool.com/schedule) và [Barineau Customer Portal](https://barineauac.com/portal/) trình bày quy trình, xác nhận và hỗ trợ.

## 5. Điều kiện GO/NO-GO

Release workflow chỉ được mở khi `release-v1.0.0-approval.json` có:

- quyết định `GO`;
- UAT và biên bản bàn giao đã ký;
- P0 = 0, P1 = 0;
- production readiness đã xác minh trên staging gần production;
- đủ người duyệt Owner, Operations và QA.

Theo [Google SRE reliable product launches](https://sre.google/sre-book/reliable-product-launches/), checklist phải bắt lỗi rõ ràng, có thể lặp lại và bao phủ domain, persistent data/backup, abuse/rate-limit. Vì vậy CI PASS không được dùng thay chữ ký người nhận hoặc cấu hình production thật.

## 6. Quyết định hiện tại

**NO-GO** cho production thật. Mã nguồn và automation có thể đạt Release Candidate, nhưng chưa được phép tạo GitHub Release `v1.0.0` cho đến khi UAT người thật, staging drill và bàn giao được ký đầy đủ.
