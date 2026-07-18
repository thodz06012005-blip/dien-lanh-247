# Legacy commerce snapshots

Các tệp trong thư mục này chỉ phục vụ đối chiếu và rollback có kiểm soát. Chúng
không được import, mount hoặc dùng làm seed mặc định trong production.

- `initialData.commerce.js`: bộ sinh seed trước service-only.
- `mock-db.pre-service-only.json`: ảnh chụp dữ liệu Mock API trước chuyển đổi.
- `REFACTOR_PLAN.commerce.md`: kế hoạch tách router theo contract commerce cũ.

Contract runtime hiện hành: `HD_API_service-only-contract.md` tại root dự án.
