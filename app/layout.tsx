import type { Metadata } from 'next';
import './globals.css';

/**
 * Layout gốc tối giản. Giao diện thật của app = bản HTML 15 module ở /public/app.html
 * (được phục vụ tại "/" qua rewrite). Layout này chỉ bọc các route hệ thống (404/lỗi).
 */
export const metadata: Metadata = {
  title: 'Gia Phả Việt Nam',
  description: 'Ứng dụng quản lý gia phả chuyên nghiệp',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
