import { fileURLToPath } from 'url';
import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
