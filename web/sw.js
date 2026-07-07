// PM Skills service worker — offline for everything that doesn't need a model.
// Strategy: precache the no-API core (Handbook, Academy, Campaign, Wrapped,
// Reckoning, Charter, shell assets); runtime-cache other same-origin GETs,
// network-first with cache fallback. NEVER touches other origins (API/CDN
// requests pass straight through, and the trial endpoint is never cached).
const V = 'pm-skills-v1';
const CORE = [
  './', './index.html', './styles.css', './nav.js', './i18n.js', './app.js',
  './handbook.html', './academy.html', './campaign.html', './wrapped.html',
  './reckoning.html', './charter.html', './daily.html', './export-doc.js',
  './workspace.js', './skills.json', './manifest.json',
  './assets/product-notes.jpg', './assets/icon-192.png', './assets/icon-512.png',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;   // APIs/CDNs pass through
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(V).then((c) => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then((hit) => hit || caches.match('./index.html')))
  );
});
