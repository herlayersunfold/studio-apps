// Order Center service worker: always asks the network first so staff never see an old version.
const C='hlu-center-v1';
self.addEventListener('install',e=>{ self.skipWaiting(); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET'||new URL(r.url).origin!==location.origin) return;
  e.respondWith(fetch(r).then(res=>{ const copy=res.clone(); caches.open(C).then(c=>c.put(r,copy)).catch(()=>{}); return res; }).catch(()=>caches.match(r).then(m=>m||new Response('You are offline. Reconnect to use the Order Center.',{status:503,headers:{'Content-Type':'text/plain'}}))));
});
