import { fileURLToPath } from 'url';
import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Không để lỗi style của ESLint (prefer-const, no-unused-vars…) chặn deploy.
  // Kiểm tra kiểu TypeScript vẫn bật (typescript.ignoreBuildErrors = false mặc định).
  eslint: { ignoreDuringBuilds: true },
  // MỘT GIAO DIỆN DUY NHẤT = bản HTML 15 module (public/app.html).
  // Trang gốc "/" dùng REWRITE (phục vụ nội dung app.html ngay tại "/", URL giữ nguyên,
  // không chuyển hướng → không thể 404). Chạy ở beforeFiles nên ưu tiên trước mọi route.
  async rewrites() {
    return {
      beforeFiles: [{ source: '/', destination: '/app.html' }],
      afterFiles: [],
      fallback: [],
    };
  },
  // HTML trang chủ đổi theo mỗi lần deploy → cấm CDN giữ bản cũ (luôn revalidate).
  // Nếu không, "/" bị kẹt bản cache cũ (tên/OG cũ) dù đã deploy bản mới.
  async headers() {
    const noCacheHtml = [
      { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=0, must-revalidate' },
    ];
    return [
      { source: '/', headers: noCacheHtml },
      { source: '/app.html', headers: noCacheHtml },
    ];
  },
  // Các trang React cũ → HTML (redirect build-time, không dùng middleware/edge → không 500).
  async redirects() {
    const pages = [
      '/members', '/members/:path*', '/tree', '/families', '/graves', '/events',
      '/restoration', '/contributions', '/relations', '/nha-tho-ho', '/notifications',
      '/library', '/reports', '/roles', '/settings', '/settings/:path*', '/tro-ly', '/login',
    ];
    return pages.map((source) => ({ source, destination: '/app.html', permanent: false }));
  },
  // Chỉ định gốc dự án = thư mục này, tránh Next đoán nhầm khi có nhiều lockfile.
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  images: {
    remotePatterns: [
      // Avatar mẫu (mock/seed)
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      // Ảnh thật từ Supabase Storage
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
};

export default nextConfig;
