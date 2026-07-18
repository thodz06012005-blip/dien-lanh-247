# Hợp đồng API service-only v1

## Trạng thái

- Contract: `service-only-v1`
- Hiệu lực: Giai đoạn 4
- Runtime áp dụng: NestJS backend và Mock API
- Chế độ production bắt buộc: `SERVICE_ONLY_MODE=true`

Từ contract này, Điện Lạnh 247 chỉ cung cấp nghiệp vụ dịch vụ. Việc đặt `SERVICE_ONLY_MODE=false` ở local không khôi phục controller, router, permission hoặc seed bán hàng đã bị gỡ.

## Capability công khai

`GET /api/v1/health`, `/health/live` và `/health/ready` công bố:

```json
{
  "mode": "service-only",
  "contractVersion": "service-only-v1",
  "capabilities": {
    "serviceRequests": true,
    "quotations": true,
    "servicePayments": true,
    "warranty": true,
    "commerce": false
  }
}
```

Mock API và backend thật phải giữ cùng các trường capability trên. `ready` của backend thật kiểm tra MySQL; Mock API trả database in-memory/file ở trạng thái `up`.

## Nhóm endpoint còn hoạt động

| Nhóm                   | Route chính                                                                                                                                 | Ghi chú                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Nội dung công khai     | `/services`, `/projects`, `/posts`, `/service-categories`                                                                                   | Catalog dịch vụ/CMS, không phải catalog sản phẩm         |
| Đặt và tra cứu dịch vụ | `/service-requests`, `/service-requests/lookup`, `/service-requests/track`                                                                  | Giữ privacy-safe lookup và workflow trạng thái           |
| Tài khoản khách hàng   | `/auth/*`, `/account`, `/account/profile`, `/account/addresses`, `/account/service-requests`, `/account/notifications`, `/account/sessions` | Không còn projection đơn hàng                            |
| Điều phối              | `/admin/operations/overview`, `/admin/operations/requests/*`, `/admin/operations/technicians/*`, `/admin/operations/sla/*`                  | SLA, lịch, phân công, thiết bị và ghi chú nội bộ         |
| Tài chính dịch vụ      | `/admin/operations/requests/:id/quotes`, `/operations/quotes/confirm`, `/admin/operations/requests/:id/payments`                            | Giữ dòng `LABOR` và `MATERIAL`; không dùng Product/Order |
| Hoàn thành và bảo hành | `/admin/operations/requests/:id/completion`, `/admin/operations/requests/:id/warranties`, `/admin/operations/warranties/:id/events`         | Giữ biên bản và lịch sử bảo hành                         |
| Quản trị hỗ trợ        | `/admin/customers`, `/admin/content/*`, `/admin/notifications`, `/admin/audit-logs`, `/admin/settings`, `/admin/auth/profile`               | Customer metrics chỉ tính dịch vụ                        |

## Endpoint commerce đã đóng

Các đường dẫn sau không còn controller/router public. Với `SERVICE_ONLY_MODE=true`, guard trả `410 Gone` và mã `COMMERCE_DISABLED` để client cũ nhận kết quả ổn định:

- `/products`, `/products/*`, `/categories`, `/brands`
- `/cart`, `/cart/*`
- `/orders`, `/orders/*`
- `/admin/products`, `/admin/products/*`
- `/admin/orders`, `/admin/orders/*`
- `/account/orders`, `/account/orders/*`

Không endpoint nào trong nhóm trên được xuất hiện trong Swagger/OpenAPI. Khi flag bị đặt `false` ở local, kết quả là `404` vì module đã bị xóa; đây không phải legacy mode.

## Permission và role navigation

| Bề mặt                        | Superadmin |          Admin |          Staff |
| ----------------------------- | ---------: | -------------: | -------------: |
| Dashboard dịch vụ             |        xem |            xem |            xem |
| Khách hàng                    |    xem/sửa |        xem/sửa |            xem |
| Yêu cầu dịch vụ và Operations |    xem/sửa |        xem/sửa |        xem/sửa |
| Kỹ thuật viên                 |    xem/sửa |        xem/sửa |            xem |
| Content Hub                   |    xem/sửa |        xem/sửa |            xem |
| Notifications                 |        xem |            xem |            xem |
| Settings                      |    xem/sửa |            xem | không hiển thị |
| Audit                         |        xem | không hiển thị | không hiển thị |
| Profile                       |    xem/sửa |        xem/sửa |        xem/sửa |

Backend là nguồn quyết định quyền. Frontend chỉ lọc điều hướng từ permission backend trả về; gọi URL trực tiếp vẫn phải qua `JwtAuthGuard`, `RolesGuard` và `PermissionsGuard`.

## Seed, snapshot và dữ liệu vật lý

- Backend seed mặc định chỉ tạo admin, service categories, technicians, service settings và service request demo.
- Mock seed mặc định nằm tại `mock-api/seed/service-only.snapshot.json`; không có key commerce.
- Snapshot trước chuyển đổi được lưu tại `mock-api/legacy/mock-db.pre-service-only.json` và `mock-api/legacy/initialData.commerce.js` để đối chiếu chỉ đọc.
- Prisma commerce models và bảng MySQL lịch sử chưa bị drop. Theo baseline Giai đoạn 0, contract migration chỉ được tạo sau khi schema được reconciliation, dữ liệu được archive/checksum, và backup/restore drill thành công. Runtime hiện tại không còn repository access tới các bảng đó.

## Kiểm thử chấp nhận

1. Architecture test xác nhận module/router commerce không tồn tại và seed mặc định không có commerce key.
2. Runtime contract test xác nhận toàn bộ URL commerce trả `410 COMMERCE_DISABLED`.
3. Health test xác nhận backend và Mock API công bố cùng `service-only-v1` capability.
4. Test báo giá xác nhận cả dòng tiền công và vật tư còn nguyên, tổng tiền được tính xác định.
5. Regression test xác nhận service request lifecycle, technician matching, thanh toán dịch vụ, biên bản và bảo hành vẫn hoạt động.
6. Mỗi vai trò đăng nhập phải nhận đúng permission và sidebar tương ứng; truy cập trực tiếp ngoài quyền trả `403`.

## Rollback

Rollback ứng dụng dùng artifact/commit trước Giai đoạn 4 sau khi đánh giá dữ liệu và bảo mật. Không mount file trong `legacy/` vào production, không tắt flag để mở lại commerce và không chạy migration drop table trong rollback.
