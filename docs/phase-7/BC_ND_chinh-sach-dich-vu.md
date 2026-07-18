# BC_ND — Nội dung và chính sách dịch vụ thuần túy

## 1. Thông tin kiểm soát

| Trường | Giá trị |
|---|---|
| Policy version | `DL247-SVC-1.0` |
| Ngày ban hành | 18/07/2026 |
| Ngày hiệu lực | 01/08/2026 |
| Trạng thái | `PENDING_OWNER_AND_LEGAL_APPROVAL` |
| Phạm vi | Website khách hàng Điện Lạnh 247 service-only |

> Cổng go-live bị chặn cho tới khi chủ cửa hàng và người tư vấn pháp lý ký biên bản `BB_ND_phe-duyet-noi-dung.md`. Mã nguồn không được coi là ý kiến pháp lý.

## 2. Kiểm kê nội dung chuyển đổi

| Khu vực | Trạng thái Phase 7 | Nội dung chuẩn |
|---|---|---|
| Home | Service-only | Dịch vụ nổi bật, quy trình, giá tham khảo, dự án, FAQ, CTA đặt lịch/gọi |
| About | Service-only | Năng lực, kỷ luật kỹ thuật, điều phối, nghiệm thu, bảo hành |
| Services | Service-only | Phạm vi, giá tham khảo, quy trình, bảo hành, FAQ |
| Contact | Service-only | Hotline, Zalo, email, khu vực phục vụ và form tư vấn |
| FAQ | Mới | Lịch chờ xác nhận, giá, linh kiện, đổi/hủy lịch, hồ sơ và dữ liệu |
| Footer | Service-only | Dịch vụ, khám phá, 09 chính sách, tra cứu yêu cầu |
| CTA | Service-only | `Đặt lịch`, `Gọi ngay`, `Tra cứu yêu cầu` |

Các URL commerce cũ chỉ còn redirect/guard tương thích. Không có CTA mua hàng, giỏ hàng, checkout, giao hàng, đổi trả hay danh mục retail trong nội dung hiển thị.

## 3. Bộ chính sách `DL247-SVC-1.0`

1. Điều khoản sử dụng website — `/policy/terms`
2. Đặt lịch dịch vụ — `/policy/booking`
3. Hủy và đổi lịch — `/policy/cancellation`
4. Báo giá và chi phí — `/policy/pricing`
5. Thanh toán dịch vụ — `/policy/payment`
6. Bảo hành dịch vụ — `/policy/warranty`
7. Tiếp nhận khiếu nại — `/policy/complaints`
8. Bảo mật và dữ liệu cá nhân — `/policy/privacy`
9. Cookie và lưu trữ cục bộ — `/policy/cookies`

Nguyên tắc bắt buộc được lặp lại ở đặt lịch, báo giá và FAQ:

> Linh kiện và vật tư thay thế chỉ được cung cấp như một phần của báo giá dịch vụ đã được khách hàng chấp thuận; không bán lẻ độc lập qua website.

## 4. Quy tắc xuất bản

- Mỗi trang hiển thị policy version, ngày ban hành và ngày hiệu lực.
- Mọi sửa đổi nội dung pháp lý phải tăng version hoặc lập changelog có thể truy vết.
- Bản dịch hoặc bản rút gọn không được làm thay đổi nghĩa của bản tiếng Việt được duyệt.
- CMS không được xuất bản nội dung/CTA commerce. Frontend có lớp lọc phòng vệ cho nội dung cũ nhưng nguồn CMS vẫn phải được làm sạch bởi chủ nội dung.
- Giá website luôn là tham khảo; phí khảo sát và báo giá chính thức phải được xác nhận trước khi thực hiện.

## 5. Tham khảo trải nghiệm

- Housecall Pro tổ chức online booking theo dịch vụ và khả năng điều phối, đồng thời cho phép cấu hình việc hiển thị giá.
- ServiceTitan Scheduling Pro nhấn mạnh câu hỏi có điều kiện, arrival windows, buffer và kiểm soát lịch theo năng lực vận hành.
- Jobber Client Hub được tham khảo cho cách gom yêu cầu, báo giá và lịch sử dịch vụ ở một điểm truy cập khách hàng.

Các nguồn chỉ được dùng để tham khảo pattern hoạt động; nội dung, thương hiệu, hình ảnh và chính sách của Điện Lạnh 247 được viết riêng.

## 6. Acceptance

- [x] Nội dung customer shell không còn CTA commerce.
- [x] Có đủ 09 chính sách service-only.
- [x] Có version và ngày hiệu lực thống nhất.
- [x] Linh kiện được giới hạn trong báo giá dịch vụ.
- [x] Có FAQ độc lập và FAQ trên Home.
- [ ] Chủ cửa hàng ký duyệt.
- [ ] Người tư vấn pháp lý ký duyệt.

