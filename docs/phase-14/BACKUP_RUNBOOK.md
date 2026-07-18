# Backup và restore runbook

## Mục tiêu

Giảm rủi ro mất dữ liệu bằng backup nhất quán, nén, có checksum và retention; mật khẩu database không xuất hiện trong process arguments hoặc log.

## Yêu cầu máy chạy backup

- Node.js 22.
- `mysqldump` tương thích với MySQL/MariaDB production.
- `DATABASE_URL` được inject từ secret manager hoặc protected CI environment.
- Thư mục backup chỉ tài khoản vận hành đọc được.
- Dung lượng trống tối thiểu bằng 2 lần kích thước database trước nén.

## Tạo backup

```bash
export DATABASE_URL='mysql://USER:PASSWORD@HOST:3306/DATABASE'
export BACKUP_DIRECTORY='/secure/dien-lanh-247/backups'
export BACKUP_RETENTION_DAYS='14'
export BACKUP_ENCRYPTION_KEY='<64-hex-character-key-from-secret-manager>'
npm run backup:mysql
```

Script thực hiện:

1. Parse `DATABASE_URL` trong memory.
2. Truyền password qua `MYSQL_PWD` chỉ cho process `mysqldump`.
3. Chạy `--single-transaction --quick --routines --triggers --events --hex-blob`.
4. Ghi file SQL với permission `0600`.
5. Nén gzip level 9.
6. Xóa SQL chưa nén.
7. Mã hóa AES-256-GCM trong production và xóa gzip plaintext.
8. Tạo SHA-256 trên ciphertext.
9. Xóa backup quá retention.

Không chạy lệnh có `DATABASE_URL=...` trực tiếp trên terminal được ghi shell history. Production nên dùng systemd EnvironmentFile có quyền `0600`, Docker/Kubernetes secret hoặc CI secret injection.

## Kiểm tra checksum

```bash
cd /secure/dien-lanh-247/backups
sha256sum -c dien_lanh_247-YYYY-MM-DDTHH-MM-SS.sql.gz.enc.sha256
```

Kết quả phải là `OK`. Backup checksum lỗi không được dùng để restore.

## Restore vào staging

Không restore thử trực tiếp vào production.

```bash
export DATABASE_URL='mysql://RESTORE_USER:PASSWORD@STAGING_HOST:3306/STAGING_DATABASE'
export BACKUP_DIRECTORY='/secure/dien-lanh-247/backups'
export BACKUP_ENCRYPTION_KEY='<load-from-secret-manager>'
export RESTORE_FILE='/secure/dien-lanh-247/backups/dien_lanh_247-YYYY-MM-DDTHH-MM-SS.sql.gz.enc'
export RESTORE_CONFIRM='STAGING_DATABASE'
npm run restore:mysql
```

Sau restore:

1. Chạy Prisma migration status.
2. Kiểm tra số lượng User, ServiceRequest, ServiceQuote, ServicePaymentRecord và AuthSession.
3. Đăng nhập bằng tài khoản staging.
4. Kiểm tra một yêu cầu dịch vụ, báo giá, bảo hành và một bài CMS.
5. Xác nhận dữ liệu audit không nằm trong `/uploads`.
6. Ghi thời gian restore, RPO và RTO thực tế vào biên bản vận hành.

## Lịch đề xuất

- Full logical backup: mỗi ngày, ngoài giờ cao điểm.
- Backup trước migration hoặc release có thay đổi dữ liệu.
- Copy backup mã hóa sang object storage khác máy chủ ứng dụng.
- Retention ngắn tại máy chạy ứng dụng: 14 ngày.
- Retention object storage: 30 ngày daily, 12 bản monthly.
- Restore drill: ít nhất mỗi tháng một lần.

## Mã hóa và quyền truy cập

Script mã hóa AES-256-GCM bằng khóa 32 byte lấy từ secret manager. Production từ chối chạy nếu thiếu khóa; khóa không được lưu cùng backup hoặc trong repository. Object storage vẫn phải bật KMS/SSE như lớp bảo vệ thứ hai.

Chỉ nhóm vận hành được phép:

- đọc backup;
- chạy restore;
- xem secret database;
- thay đổi retention.

## Sự cố backup thất bại

1. Không xóa bản backup hợp lệ gần nhất.
2. Kiểm tra dung lượng, quyền thư mục và phiên bản `mysqldump`.
3. Không gửi stderr chứa hostname/database nội bộ lên kênh công khai.
4. Tạo incident nếu không có backup hợp lệ trong 24 giờ.
5. Chạy lại sau khi sửa nguyên nhân và xác minh checksum.
Production tạo file `.sql.gz.enc` bằng AES-256-GCM; checksum được tính trên ciphertext. Không lưu khóa cùng thư mục backup hoặc trong repository.
