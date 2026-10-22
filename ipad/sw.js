// Offline support. Bump the build number (it changes automatically with each new version of the app).
const CACHE='ipad-2026-10-21a';
const FILES=['./','index.html','manifest.webmanifest','vendor/jspdf.umd.min.js','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k.startsWith('ipad-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET'||new URL(r.url).origin!==location.origin) return;
  if(r.headers.has('range')||//help//.test(r.url)) return; // let videos stream straight from the network
  const isPage=r.mode==='navigate'||r.url.endsWith('/')||r.url.endsWith('index.html');
  if(isPage){ // newest version when online, saved copy when offline
    e.respondWith(fetch(r).then(res=>{ const cp=res.clone(); caches.open(CACHE).then(c=>c.put('index.html',cp)); return res; }).catch(()=>caches.match('index.html').then(m=>m||caches.match('./'))));
  } else {
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); return res; })));
  }
});
