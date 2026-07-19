# Go-live và bàn giao — Giai đoạn 12

## Trước thời điểm triển khai

- Chốt `USER_DOMAIN`, `ADMIN_DOMAIN`, DNS và certificate CA còn hạn trên 14 ngày.
- Inject JWT, audit salt, backup key, database, SMTP và storage qua secret manager; file env quyền `0600`.
- Chạy `npm run deploy:verify-production`; không bỏ qua lỗi bằng cách sửa script hoặc dùng placeholder.
- Chạy migration additive và encrypted backup trước deploy.
- Xác nhận `SERVICE_ONLY_MODE=true`, `RUN_SEED=false`, dev/demo/mock đều tắt.
- Cấu hình health monitor 5 phút, alert escalation, backup hằng ngày và bản sao ngoài máy chủ.

## Cutover

1. Đóng băng thay đổi nội dung và dữ liệu trong cửa sổ cutover.
2. Ghi image digest và release SHA; backup mã hóa, kiểm tra checksum.
3. Deploy `APP_VERSION=1.0.0`, migration, health live/ready và smoke hai portal.
4. Kiểm tra TLS/HSTS, login ba vai trò, đặt dịch vụ, điều phối, báo giá và thông báo.
5. Theo dõi 5xx, 429, queue, email delivery, CPU/RAM/disk trong ít nhất 30 phút.
6. Quyết định GO hoặc rollback bằng image trước; không rollback database bằng DROP.

## Bàn giao tài khoản

- Gửi thông tin qua kênh quản lý mật khẩu, không qua issue/PR/email thường.
- Người nhận đổi mật khẩu ngay, bật 2FA và revoke session cũ.
- Review quyền thừa; không dùng chung Super Admin cho vận hành hằng ngày.
- Xóa/tắt tài khoản bootstrap sau khi xác nhận tài khoản người nhận hoạt động.

## Bài thực hành bắt buộc

Người nhận phải tự thực hiện: quản lý yêu cầu, phân công, báo giá, CMS/ảnh, audit, backup/restore và rollback. Người hướng dẫn chỉ quan sát và chỉ can thiệp để ngăn mất dữ liệu.

## Rollback

- Ứng dụng: trở về image digest trước, giữ volume.
- Migration: chỉ dùng migration backward-compatible; không tự ý DROP.
- Dữ liệu: restore bản mã hóa vào staging trước, có phê duyệt hai người nếu phải restore production.
- Thông báo: dừng worker khi provider lỗi lan rộng; không xóa outbox để “làm sạch”.
