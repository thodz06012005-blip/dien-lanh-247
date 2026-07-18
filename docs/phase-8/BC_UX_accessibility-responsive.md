# BC_UX — UI/UX, accessibility và responsive acceptance

## 1. Baseline

- Chuẩn mục tiêu: WCAG 2.2 Level AA.
- Viewport bắt buộc: mobile 360–430px, tablet 768–1024px, desktop 1280–1440px.
- Trình duyệt CI: Chromium desktop/mobile/tablet, Firefox desktop và WebKit mobile.
- CTA ưu tiên: `Đặt lịch`, `Gọi ngay`, `Tra cứu yêu cầu`.

## 2. Design system contract

| Nhóm | Component/guard |
|---|---|
| Foundation | Color, spacing, radius, shadow và motion tokens |
| Actions | Button variants, loading/disabled, target cảm ứng |
| Forms | Input, Select, Textarea với label, hint, error, `aria-describedby` |
| Overlay | Modal/Drawer có dialog semantics, Escape, focus trap và focus restore |
| Feedback | Toast/Alert/StatePanel/Skeleton có live region phù hợp |
| Data | ResponsiveTable: table desktop, key/value cards mobile |
| Navigation | Skip link, focus visible, tabs bằng phím mũi tên, breadcrumb |

## 3. Asset contract

Registry canonical: `frontend-user/src/config/imageAssets.ts`.

Mỗi asset có:

- asset key ổn định;
- `src` cục bộ và `srcSet` khi có;
- width, height và aspect ratio;
- alt text theo mục đích;
- fallback cục bộ;
- object position cho crop responsive.

Hero LCP dùng ba WebP cục bộ 768/1280/1672px. Ảnh ngoài không còn là điểm phụ thuộc bắt buộc cho ảnh priority/LCP.

## 4. Accessibility checklist

- [x] Skip link tới `#main-content`.
- [x] Focus ring tương phản cao, có forced-colors fallback.
- [x] Form control có label hoặc accessible name.
- [x] Modal, drawer và mobile menu giữ focus trong overlay, Escape để đóng và trả focus.
- [x] Toast/error/status dùng `aria-live`, `role=status` hoặc `role=alert` phù hợp.
- [x] `prefers-reduced-motion` tắt animation/transition không thiết yếu.
- [x] Target cảm ứng tối thiểu 44px khi pointer coarse; WCAG 2.2 minimum 24px được đáp ứng.
- [x] Ảnh có alt; ảnh trang trí dùng `aria-hidden`.
- [x] Bảng có caption và chuyển thành bố cục key/value ở mobile.
- [x] Không khóa zoom, không dùng màu sắc là tín hiệu duy nhất.
- [ ] Screen reader manual smoke với VoiceOver/NVDA — cần người duyệt thực hiện trước go-live.

## 5. Responsive matrix

| Trang | Mobile | Tablet | Desktop | Keyboard | Overflow |
|---|---|---|---|---|---|
| Home | CI | CI | CI | CI | CI |
| Services | CI | CI | CI | CI | CI |
| Service booking | CI | CI | CI | CI | CI |
| FAQ | CI | CI | CI | CI | CI |
| Policy | CI | CI | CI | CI | CI |
| Login | CI | CI | CI | CI | CI |

Trạng thái cuối chỉ đổi thành `PASS` sau khi workflow browser matrix kết thúc `success`; link bằng chứng phải được ghi trong draft PR.

## 6. Nguồn chuẩn

- W3C WCAG 2.2 Quick Reference, đặc biệt 1.1.1, 1.3.x, 1.4.3, 2.1.x, 2.4.x, 2.5.8, 3.3.x và 4.1.2.
- WAI Understanding WCAG 2.2 cho cách diễn giải và kiểm tra.

