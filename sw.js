// sw.js - offline app-shell caching (SPEC R8).
// Strategy: NETWORK-FIRST when online (so updates are picked up immediately and the cache
// is refreshed), falling back to the cache when offline. The cache name carries the app
// version; bump VERSION on each release. skipWaiting + clients.claim make a new worker take
// over promptly.

const VERSION = '1.0.6';
const CACHE = `mathfun-v${VERSION}`;

const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './icons/icon.svg',
  './js/app.js',
  './js/state.js',
  './js/questions.js',
  './js/game.js',
  './js/rewards.js',
  './js/mastery.js',
  './js/sound.js',
  './js/ui.js',
  './js/avatars.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for same-origin GETs: fetch fresh, update the cache, fall back to cache offline.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // let cross-origin requests pass through

  event.respondWith(
    fetch(req)
      .then((res) => {
        // Cache a fresh copy for offline use.
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
  );
});
