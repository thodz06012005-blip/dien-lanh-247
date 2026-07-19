# Kịch bản UAT không hướng dẫn từng nút — Giai đoạn 11

## Mục tiêu

Người tham gia chỉ nhận mục tiêu nghiệp vụ, không nhận chỉ dẫn vị trí nút. Điều phối viên chỉ quan sát, ghi thời gian, điểm vướng và lỗi; không cứu bài trừ khi có nguy cơ dữ liệu hoặc an toàn.

## Vai trò và nhiệm vụ

| Vai trò | Mục tiêu giao cho người dùng | Thành công khi |
|---|---|---|
| Khách hàng | Đặt lịch sửa điều hòa, thêm ảnh hiện trạng, sau đó tra cứu và đổi lịch | Tự hoàn tất, hiểu giá chỉ tham khảo, không tạo trùng |
| Nhân viên vận hành | Tìm yêu cầu mới, kiểm tra hồ sơ, xác nhận và điều phối kỹ thuật viên phù hợp | Không cần quyền Settings/Audit; nhận biết xung đột lịch |
| Người quản trị | Kiểm tra SLA, báo giá, CMS, thông báo, audit, cấu hình và quy trình backup | Dùng đúng step-up; không làm lộ dữ liệu nhạy cảm |

## Tình huống gây lỗi có kiểm soát

1. Ngắt mạng khi người dùng đang ở bước cuối; quan sát banner, dữ liệu form và hành vi gửi lại.
2. Giả lập API chậm quá timeout; xác nhận thông báo dễ hiểu và idempotency không tạo bản trùng.
3. Tải tệp có đuôi `.png` nhưng nội dung không phải PNG, rồi tải ảnh quá 5 MB.
4. Nhấn gửi liên tiếp hoặc phát lại cùng `Idempotency-Key`.
5. Dùng access token hết hạn nhưng refresh session còn hợp lệ; sau đó thử session đã revoke.
6. Điều phối hai yêu cầu cho cùng kỹ thuật viên trong cùng khung giờ.
7. Tắt provider email/SMS/Zalo; xác nhận nghiệp vụ chính vẫn commit và outbox retry/dead-letter.

## Cách ghi lỗi

- **P0:** mất dữ liệu, vượt quyền, tạo bản ghi trùng, không thể hoàn tất nghiệp vụ chính hoặc không thể rollback/restore.
- **P1:** luồng chính hoàn tất nhưng gây hiểu sai chi phí/trạng thái, điều phối sai, lỗi accessibility nghiêm trọng hoặc thiếu cảnh báo vận hành.
- **P2:** lỗi trình bày/viết chữ không chặn nhiệm vụ.

P0/P1 phải về 0 trước quyết định GO. Ảnh chụp, trace hoặc log chỉ được đính kèm sau khi đã che địa chỉ, token, cookie và ảnh nhạy cảm.

## Nguồn tham khảo

- [Playwright Network](https://playwright.dev/docs/network): chặn, sửa và mô phỏng request/response.
- [Playwright API testing](https://playwright.dev/docs/api-testing): xác nhận hậu điều kiện phía server.
- [OWASP Session Timeout Testing](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/06-Session_Management_Testing/07-Testing_Session_Timeout).
- [OWASP Unexpected File Types](https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/10-Business_Logic_Testing/08-Test_Upload_of_Unexpected_File_Types).
