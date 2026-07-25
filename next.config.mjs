import { fileURLToPath } from 'url';
import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Không để lỗi style của ESLint (prefer-const, no-unused-vars…) chặn deploy.
  // Kiểm tra kiểu TypeScript vẫn bật (typescript.ignoreBuildErrors = false mặc định).
  eslint: { ignoreDuringBuilds: true },
  // MỘT GIAO DIỆN DUY NHẤT: mọi trang React cũ → bản HTML 15 module (/app.html).
  // Redirect build-time (KHÔNG dùng middleware/edge) nên không thể gây lỗi 500.
  async redirects() {
    const pages = [
      '/', '/members', '/members/:path*', '/tree', '/families', '/graves', '/events',
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
