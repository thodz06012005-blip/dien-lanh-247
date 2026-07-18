# QY_HT_service-only-mode

## 1. Mục đích

`SERVICE_ONLY_MODE` là cổng an toàn dùng trong quá trình chuyển Điện Lạnh 247 từ mô hình bán sản phẩm kết hợp dịch vụ sang mô hình dịch vụ thuần túy. Cổng này phải bảo vệ ở server; việc ẩn giao diện chỉ là lớp trải nghiệm người dùng.

Phạm vi chặn là Product, Category/Brand của catalog sản phẩm, Cart và Order bán hàng. Báo giá, thanh toán, lịch hẹn, điều phối, biên bản hoàn thành và bảo hành của **dịch vụ** không thuộc phạm vi chặn.

## 2. Ma trận cấu hình

| Ứng dụng           | Biến                     | Mặc định an toàn | Sau Giai đoạn 4                                    |
| ------------------ | ------------------------ | ---------------: | -------------------------------------------------- |
| NestJS backend     | `SERVICE_ONLY_MODE`      |           `true` | `false` không khôi phục module commerce đã gỡ      |
| Mock API           | `SERVICE_ONLY_MODE`      |           `true` | `false` không khôi phục router/seed commerce đã gỡ |
| Website khách hàng | `VITE_SERVICE_ONLY_MODE` |           `true` | Source/bundle commerce không còn tồn tại           |
| Website quản trị   | `VITE_SERVICE_ONLY_MODE` |           `true` | Source/bundle commerce không còn tồn tại           |

Giá trị hợp lệ chỉ là `true` hoặc `false` (backend/mock cũng chấp nhận `1` và `0`). Giá trị khác phải làm cấu hình thất bại sớm.

## 3. Quy tắc môi trường

- Production bắt buộc `SERVICE_ONLY_MODE=true` và `VITE_SERVICE_ONLY_MODE=true`. Backend, Mock API và hai frontend đều từ chối khởi động/build nếu production đặt `false`.
- Staging nên luôn chạy service-only để mô phỏng production.
- Từ Giai đoạn 4, local cũng mặc định `true`. Đặt `false` chỉ bỏ phản hồi tombstone `410`; endpoint commerce vẫn là `404` vì controller/router đã được gỡ và tuyệt đối không dùng để phục hồi bán hàng.
- `mock-api npm run dev` chạy service-only giống production. Đối chiếu lịch sử dùng snapshot chỉ đọc trong `mock-api/legacy/`, không mount snapshot vào runtime.
- Muốn quay lại commerce phải checkout/redeploy phiên bản cũ theo quy trình rollback; không được tái kích hoạt bằng feature flag.

## 4. Hành vi khi bật

### Backend và Mock API

Các nhóm URL sau bị từ chối trực tiếp bằng HTTP `410 Gone`, mã lỗi `COMMERCE_DISABLED`:

- `/products`, `/products/*`, `/categories`, `/brands`
- `/cart`, `/cart/*`
- `/orders`, `/orders/*`
- `/admin/products`, `/admin/products/*`
- `/admin/orders`, `/admin/orders/*`
- `/account/orders`, `/account/orders/*`

Các URL dịch vụ như `/service-categories`, `/service-requests`, `/account/service-requests` và `/admin/operations` không được đưa vào danh sách chặn.

### Frontend

- Menu, tìm kiếm module và route Product/Cart/Checkout/Order không xuất hiện khi bật flag.
- URL legacy được chuyển đến bề mặt dịch vụ tương ứng; không tải trang bán hàng.
- Admin chuyển route Product/Order về trung tâm điều phối.

### Seed

- Backend seed không còn câu lệnh tạo product categories, brands, products, coupons hay orders.
- Mock seed không có các key `products`, `orders`, `categories`, `brands`, `cart` hoặc `inventory`.
- Service categories, service requests và technicians vẫn được nạp.
- Seed/mock DB trước chuyển đổi được lưu chỉ đọc trong thư mục `legacy/`. Dữ liệu lịch sử trong MySQL hiện hữu không bị xóa vì baseline chưa cho phép migration phá hủy dữ liệu.

## 5. Cổng kiểm thử

Trước khi hợp nhất phải chạy tối thiểu:

```bash
npm run test:architecture
npm run lint
npm run typecheck
npm run build:all
```

Kiểm tra runtime bổ sung:

1. Khởi động Mock API với `SERVICE_ONLY_MODE=true`.
2. Xác nhận `/api/v1/products` và `/api/v1/orders` trả `410 COMMERCE_DISABLED`.
3. Xác nhận `/api/v1/service-categories` và luồng service request vẫn hoạt động.
4. Reset mock database và xác nhận không có product/order được seed.
5. Build hai frontend bằng flag `true`; kiểm tra route/menu legacy không xuất hiện.

## 6. Rollback và giới hạn

- Không tắt flag ở production để rollback. Rollback phải dùng phiên bản ứng dụng trước đó sau khi đã đánh giá dữ liệu và bảo mật.
- Không mở lại API commerce chỉ bằng cách thêm link frontend.
- Không dùng flag này để chặn quotation/payment dịch vụ.
- Không xóa bảng hoặc dữ liệu commerce vật lý trong Giai đoạn 4. Chỉ xóa đường chạy ứng dụng; contract migration chờ hoàn tất archive/checksum, schema reconciliation và backup/restore drill theo baseline Giai đoạn 0.

## 7. Tham khảo trình bày

Định hướng giao diện ưu tiên CTA đặt lịch rõ, cam kết dịch vụ ngắn, bảng giá dễ quét, quy trình theo bước và lịch sử dịch vụ theo tài khoản. Các nguồn tham khảo hoạt động gồm:

- Daikin: https://www.daikin.com.vn/corporate/dich-vu/dich-vu-dan-dung/dich-vu-bao-tri-tieu-chuan-daikin
- Thợ Điện Máy XANH: https://www.thodienmayxanh.com/dich-vu/bao-duong-may-lanh/ve-sinh-may-lanh-tu-1-hp-2-5-hp-m130090-p4241412000773
- Điện Lạnh Bách Khoa: https://dienlanhbachkhoa.com.vn/bang-gia-sua-chua-bao-tri-dien-lanh-bach-khoa/

Chuyển động chỉ dùng cho phản hồi, phân cấp và hướng sự chú ý; mọi animation phải có trạng thái `prefers-reduced-motion` tương ứng.
