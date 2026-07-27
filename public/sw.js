/* Service Worker — Gia Phả
   Mục tiêu: NGƯỜI DÙNG LUÔN Ở BẢN MỚI NHẤT.
   - Trang (HTML) và /api/*: LUÔN lấy từ mạng, không bao giờ dùng bản cache cũ.
   - Chỉ cache ảnh/icon/font (thứ ít đổi) để chạy nhanh và xem được khi mất mạng.
   - Cache tự dọn theo phiên bản; skipWaiting + clients.claim để bản mới có hiệu lực ngay. */
const CACHE = 'giapha-v4';
const CORE = [
  'nen-truyen-thong.jpg', 'nen-truyen-thong-2x.jpg',
  'icon-192.png', 'icon-512.png', 'icon-maskable.png', 'apple-touch-icon.png',
  'manifest.webmanifest',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cho phép trang yêu cầu SW mới nắm quyền ngay (dùng khi phát hiện bản mới)
self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

const putOk = (req, res) => {
  if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {}); }
  return res;
};

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 1) API: luôn ra mạng, TUYỆT ĐỐI không cache (dữ liệu + kiểm tra phiên bản).
  if (url.origin === location.origin && url.pathname.startsWith('/api/')) return;

  // 2) Điều hướng TRANG: luôn lấy bản mới từ mạng; mất mạng mới dùng bản dự phòng.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req, { cache: 'no-store' })
        .then((res) => { if (res && res.ok) putOk('offline-app', res.clone()); return res; })
        .catch(() => caches.match('offline-app'))
    );
    return;
  }

  // 3) File HTML / JS khác: cũng ưu tiên mạng để không kẹt bản cũ.
  if (url.origin === location.origin && /\.(html|js)$/i.test(url.pathname)) {
    e.respondWith(
      fetch(req, { cache: 'no-store' }).then((res) => putOk(req, res)).catch(() => caches.match(req))
    );
    return;
  }

  // 4) Ảnh/icon cùng nguồn: cache-first (nhanh, ít đổi).
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => putOk(req, res)).catch(() => hit))
    );
    return;
  }

  // 5) Google Fonts / CDN: dùng cache trước, âm thầm làm mới.
  if (/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/.test(url.host)) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const net = fetch(req).then((res) => putOk(req, res)).catch(() => hit);
        return hit || net;
      })
    );
  }
});
