const CACHE='kermis-2026-pwa-v2';
const ASSETS=["/Kermis-2026/", "/Kermis-2026/index.html", "/Kermis-2026/zaterdag-native.html", "/Kermis-2026/zondag-native.html", "/Kermis-2026/maandag-native.html", "/Kermis-2026/dinsdag-native.html", "/Kermis-2026/manifest.webmanifest", "/Kermis-2026/icon-192.png", "/Kermis-2026/icon-512.png", "/Kermis-2026/offline.html"];
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.hostname.includes('open-meteo.com')) return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(r=>{
      const copy=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); return r;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('/Kermis-2026/offline.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
