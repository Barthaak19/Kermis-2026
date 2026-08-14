const CACHE = 'kermis-2026-pwa-v4-update-test';
const APP_SHELL = [
  '/Kermis-2026/',
  '/Kermis-2026/index.html',
  '/Kermis-2026/zaterdag-native.html',
  '/Kermis-2026/zondag-native.html',
  '/Kermis-2026/maandag-native.html',
  '/Kermis-2026/dinsdag-native.html',
  '/Kermis-2026/manifest.webmanifest',
  '/Kermis-2026/icon-192.png',
  '/Kermis-2026/icon-512.png',
  '/Kermis-2026/offline.html'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response && response.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      return caches.match('/Kermis-2026/offline.html');
    }
    throw err;
  }
}

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Live weerdata nooit uit de app-cache halen.
  if (url.hostname.includes('open-meteo.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Alleen onze eigen GitHub Pages-app onderscheppen.
  if (url.origin === self.location.origin && url.pathname.startsWith('/Kermis-2026/')) {
    event.respondWith(networkFirst(event.request));
  }
});
