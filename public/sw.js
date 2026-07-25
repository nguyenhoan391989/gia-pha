/* Service Worker — Gia Phả (offline + cài như app). Tăng CACHE khi cập nhật app. */
const CACHE = 'giapha-v2';
const CORE = [
  'app.html', 'privacy.html', 'manifest.webmanifest',
  'nen-truyen-thong.jpg', 'nen-truyen-thong-2x.jpg',
  'icon-192.png', 'icon-512.png', 'icon-maskable.png', 'apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

const putOk = (req, res) => {
  if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {}); }
  return res;
};

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Điều hướng TRANG (mở '/', '/app.html'…): NETWORK-FIRST — luôn lấy bản mới,
  // chỉ khi mất mạng mới rơi về app.html trong cache. Tránh kẹt trang 404 cũ.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => { if (res && res.ok) putOk('app.html', res); return res; })
        .catch(() => caches.match('app.html'))
    );
    return;
  }

  // Tài nguyên cùng origin (ảnh, icon, sw…): cache-first, CHỈ lưu phản hồi 200.
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => putOk(req, res)).catch(() => caches.match('app.html')))
    );
    return;
  }

  // Google Fonts / CDN: stale-while-revalidate (chỉ lưu 200).
  if (/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/.test(url.host)) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const net = fetch(req).then((res) => putOk(req, res)).catch(() => hit);
        return hit || net;
      })
    );
  }
});
