// File: public/sw.js
const CACHE_NAME = "lottery-pwa-v11";
const ASSETS = [
  "/",
  "/index.html",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.json",
  "/index.tsx",
  "/App.tsx",
  "/types.ts",
  "/lib/zodiac.ts",
  "/lib/wave.ts"
];

self.addEventListener("install", (e) => {
  self.skipWaiting(); // 强制跳过等待，立即激活
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) => {
      // 尝试缓存所有资源
      return c.addAll(ASSETS).catch(err => {
        console.warn('部分资源缓存失败:', err);
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // 立即接管所有页面
  );
});

self.addEventListener("fetch", (e) => {
  // API 请求不缓存
  if (e.request.url.includes('/api/')) {
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then((response) => {
      // 即使有缓存，如果请求 URL 带有 v 参数，建议网络优先（虽然这里简单处理，
      // 但上面的 cacheName 更新通常已足够解决问题）
      return response || fetch(e.request);
    })
  );
});