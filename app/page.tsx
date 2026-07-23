import { redirect } from 'next/navigation';

/**
 * Giao diện chính của ứng dụng = bản HTML (tông sơn son thiếp vàng) ở /public/app.html.
 * Trang gốc chuyển thẳng tới đó. API + Supabase chạy dưới /api/* làm backend.
 * (Các trang React /members, /tree… vẫn còn cho giai đoạn sau, không phải lối vào chính.)
 */
export default function Home() {
  redirect('/app.html');
}
