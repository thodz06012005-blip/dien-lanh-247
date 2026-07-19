# Điện Lạnh 247 v1.0.0

Release service-only đầu tiên: đặt lịch bốn bước, Account Hub, điều phối/SLA, báo giá phiên bản, nghiệm thu, bảo hành, CMS, notification outbox, audit, privacy requests, SEO dịch vụ và production recovery.

## Điểm kiểm soát

- Không còn commerce public API/bundle/metadata.
- RBAC customer/staff/admin, Super Admin step-up, CSRF và session rotation.
- Upload magic-byte, structured logs đã redact và encrypted backup/restore.
- Responsive/Lighthouse/Playwright, critical API flow và failure matrix.

## Nâng cấp

Chạy migration additive bằng `prisma migrate deploy`, không dùng reset. Backup mã hóa và checksum bắt buộc trước cutover.

## Cổng phát hành

GitHub Release chỉ được tạo sau UAT người thật, staging recovery drill, production configuration verification và biên bản bàn giao đủ chữ ký.
