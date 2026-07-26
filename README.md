# Gia Phả Dòng Tộc — Phase 1: Giao diện (UI-only)

100% giao diện theo storyboard. **Mock data, không backend, không database** — sẵn sàng ghép API ở Phase 2.

## Chạy

```bash
npm install
npm run dev     # http://localhost:3000  (vào /login để xem màn đăng nhập)
```

`npm run build` / `npm run typecheck` đều sạch (đã kiểm chứng).

## Stack

Next.js 15 App Router · TypeScript strict · Tailwind CSS · shadcn/ui (Radix) · lucide-react · next-themes (Dark Mode) · sonner (toast)

## Design tokens (theo storyboard)

Đỏ đậm `#8B0000` (primary/sidebar) · Vàng `#D4AF37` (gold) · Kem `#FFF8E7` · Chữ `#333333` · Nền `#F5F5F5` · Font Noto Sans

## 10 màn hình

| # | Màn hình | Route | Điểm nhấn |
|---|---|---|---|
| 01 | Đăng nhập | `/login` | Panel đỏ + cây vàng, ghi nhớ đăng nhập, loading khi submit |
| 02 | Dashboard | `/` | Chào Nguyễn Văn A, 4 thẻ 256/68/12/24, thành viên mới, sự kiện sắp tới |
| 03 | Cây gia phả | `/tree` | 4 đời (Nguyễn Văn Tổ → H/K/L), zoom −/100%/+, lọc, in |
| 04 | Thành viên | `/members` | 256 bản ghi, lọc 3 chiều + tìm kiếm, phân trang, **skeleton**, **dialog** thêm/xóa, **toast**, **empty state** |
| 05 | Chi tiết thành viên | `/members/[id]` | Badge "Đời thứ 2", 5 tab: Thông tin/Quan hệ/Sự kiện/Hình ảnh/Tài liệu |
| 06 | Hồ sơ gia đình | `/families` | Sơ đồ Cha mẹ/Vợ chồng/Con cái/Anh chị em + 68 hồ sơ |
| 07 | Sự kiện | `/events` | Timeline, lọc theo loại, dialog thêm, empty state |
| 08 | Thư viện | `/library` | Tab Ảnh/Video/Tài liệu, lọc album, empty state video |
| 09 | Báo cáo | `/reports` | Biểu đồ thanh theo đời, tỷ lệ giới tính, theo gia đình |
| 10 | Cài đặt | `/settings` | Hồ sơ, **Dark Mode switch**, phân quyền, sao lưu |

## Cấu trúc

```
app/            # mỗi màn hình một page + loading.tsx
components/
  ui/           # shadcn/ui: button, card, dialog, tabs, select, table,
                # switch, dropdown, avatar, badge, skeleton, sonner
  app-shell.tsx # sidebar đỏ (desktop) + drawer (mobile) + header search/user
  tree-node.tsx # node cây gia phả đệ quy
lib/mock-data.ts# toàn bộ dữ liệu giả (khớp số liệu storyboard)
```

Responsive: sidebar cố định ≥1024px, drawer + hamburger dưới 1024px; bảng/lưới co giãn tablet/mobile.
"# gia-pha" 
