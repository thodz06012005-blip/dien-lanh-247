# Legacy backend seed

`seed.commerce.ts.snapshot` là bản lưu chỉ đọc của seed trước Giai đoạn 4. Không
chạy tệp này trong local, CI, staging hoặc production. Seed mặc định hiện hành là
`backend/prisma/seed.ts` và chỉ tạo dữ liệu nghiệp vụ dịch vụ.

Các bảng commerce vật lý chưa bị drop theo ràng buộc baseline Giai đoạn 0. Việc
contract schema chỉ được thực hiện sau reconciliation, archive/checksum và diễn
tập backup/restore thành công.
