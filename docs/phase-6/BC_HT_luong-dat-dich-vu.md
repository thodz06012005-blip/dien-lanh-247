# Báo cáo hoàn thiện luồng đặt dịch vụ

Ngày: 2026-07-18
Phạm vi: website khách hàng, backend thật, Mock API, Account Hub và email mốc nghiệp vụ.

## Luồng khách hàng

1. **Liên hệ** — họ tên, điện thoại, email.
2. **Thiết bị/sự cố** — danh mục dịch vụ, thiết bị, mô tả và mức ưu tiên.
3. **Địa chỉ/lịch** — khu vực, địa chỉ, ngày và khung giờ mong muốn.
4. **Ảnh/ghi chú/xác nhận** — tối đa 5 ảnh, ghi chú, bản tóm tắt và xác nhận thông tin giá.

Ngày/khung giờ là **yêu cầu lịch**, không phải lịch tự động chốt. Giao diện nói rõ trạng thái chờ xác nhận, cho phép quay lại sửa từng bước, dùng focus/label chuẩn, không tràn ngang và tắt transition khi người dùng bật reduced motion.

## Giá và báo giá

- `ServiceCategory` công khai khoảng giá tham khảo, phí khảo sát và ghi chú chính sách.
- Khi gửi, backend lưu snapshot đúng phiên bản disclosure khách đã xác nhận.
- Không biến khoảng giá thành `finalPrice`.
- `ServiceQuote` giữ toàn bộ phiên bản; `ServiceQuoteLine` tiếp tục hỗ trợ `LABOR` và `MATERIAL`.
- Account Hub hiển thị danh sách phiên bản, biên bản nghiệm thu và hồ sơ bảo hành.

## Chống tạo trùng và ghi đè

- Frontend tạo một `Idempotency-Key` cho mỗi lần gửi và giữ nguyên khóa khi retry.
- Backend chỉ lưu SHA-256 của khóa và fingerprint payload trong `ServiceRequestSubmission`.
- Cùng khóa/cùng payload trả lại mã cũ; cùng khóa/khác payload trả `409`.
- Mọi cập nhật trạng thái quản trị và tự đổi lịch/hủy đều yêu cầu `requestVersion`.
- Backend khóa dòng, kiểm tra phiên bản và trả `409` khi dữ liệu đã thay đổi.

## Tự phục vụ có điều kiện

Khách chỉ tự đổi lịch hoặc hủy khi trạng thái là `NEW`, `CONFIRMED` hoặc `RESCHEDULED`. Sau khi đã phân công/xử lý, giao diện hướng khách gọi hotline và backend vẫn từ chối trực tiếp. Mỗi lần đổi lịch lưu lịch cũ/mới, lý do, actor và phiên bản trước/sau.

## Timeline và thông báo

- Timeline chuẩn hóa bằng `ServiceRequestStatusEvent`.
- Thông báo trong Account Hub được tạo khi khách đổi lịch/hủy.
- Email mốc quan trọng: tiếp nhận, xác nhận/hẹn lại/hủy, báo giá gửi và quyết định, hoàn thành/nghiệm thu, tạo bảo hành.
- Lỗi gửi email không rollback giao dịch nghiệp vụ; lịch sử trong DB vẫn là nguồn sự thật.

## Tham khảo UX

- Jobber Online Booking: tách request/assessment khỏi lịch đã xác nhận, có màn hình xác nhận và quay lại sửa.
- Housecall Pro Online Booking: mobile-first, arrival window, job/estimate và thông báo email/SMS.
- ServiceTitan Scheduling Pro/Client experience: đặt lịch responsive, bảo vệ dữ liệu liên hệ và self-service theo trạng thái.

Các ý tưởng được áp dụng theo design system hiện tại (slate/cyan/blue, card bo lớn, gradient nhẹ), không sao chép thương hiệu hoặc nội dung của bên thứ ba.

## Cổng nghiệm thu

- Prisma validate/generate: bắt buộc PASS.
- Backend/frontend typecheck, lint, unit, architecture và build: bắt buộc PASS.
- Mock service-only lifecycle/enum/technician contract: bắt buộc PASS.
- Workflow `Phase 5-6 service platform`: MySQL clean migrate, backup/restore/migrate và critical booking→quote→completion E2E bắt buộc PASS trước merge.
