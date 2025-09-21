// Minimal Service Worker: cache-first for assets, network-first for HTML
const VERSION = 'xtrance-sw-v1';
const ASSET_CACHE = `${VERSION}-assets`;
const CORE_ASSETS = [
  '/', '/index.html',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(ASSET_CACHE).then(c => c.addAll(CORE_ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  const isAsset = /\.(css|js|png|jpg|jpeg|webp|svg|woff2)$/.test(url.pathname);
  if (isAsset) {
    e.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(ASSET_CACHE).then(c => c.put(req, copy));
      return res;
    })));
  } else if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(()=>caches.match('/index.html')));
  }
});
