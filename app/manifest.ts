import type { MetadataRoute } from 'next';

/** Web App Manifest - cài được lên màn hình chính như bản PWA cũ */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gia Phả Dòng Họ Việt Nam',
    short_name: 'Gia Phả',
    description: 'Nền tảng số hóa gia phả truyền thống Việt Nam',
    lang: 'vi',
    start_url: '/',
    display: 'standalone',
    background_color: '#8B0000',
    theme_color: '#8B0000',
    icons: [
      { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
