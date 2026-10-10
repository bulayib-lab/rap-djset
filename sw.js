// сначала сеть (обновления доходят сразу), офлайн — из кэша
const V='rds-v20',F=['./','index.html','privacy.html','css/app.css','css/motion.css','js/data.js','js/motion.js','js/plan.js','js/app.js','js/config.js','js/auth.js','js/pro.js','manifest.json','icons/192.png','icons/512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/api/')||u.pathname==='/webhook')return;
e.respondWith(fetch(r).then(n=>{const c=n.clone();caches.open(V).then(x=>x.put(r,c));return n}).catch(()=>caches.match(r).then(x=>x||caches.match('index.html'))))});
