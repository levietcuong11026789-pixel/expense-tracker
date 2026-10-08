// ⬆️ MỖI KHI CẬP NHẬT APP, CHỈ CẦN ĐỔI SỐ VERSION NÀY
const APP_VERSION = '1.9.0';
const CACHE_NAME = `expense-v${APP_VERSION}`;

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  // skipWaiting ngay để SW mới activate, app.js sẽ handle reload
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => {
      // Thông báo cho tất cả tab/client biết có bản mới
      return self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'APP_UPDATED',
            version: APP_VERSION
          });
        });
      });
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    // Network first: luôn thử lấy bản mới nhất từ server
    fetch(e.request)
      .then(res => {
        // Cache lại response mới
        if (res && res.status === 200 && res.type === 'basic') {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, resClone));
        }
        return res;
      })
      .catch(() => caches.match(e.request)) // Fallback offline
  );
});

// Lắng nghe lệnh SKIP_WAITING từ app
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
