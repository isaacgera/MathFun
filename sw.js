// sw.js - offline app-shell caching (SPEC R8).
// Strategy: NETWORK-FIRST when online (so updates are picked up immediately and the cache
// is refreshed), falling back to the cache when offline. The cache name carries the app
// version; bump VERSION on each release.
//
// v1.4: the worker no longer calls skipWaiting() during install, so a NEW version WAITS
// instead of barging in. The page detects the waiting worker and shows an "update available"
// toast; when the user accepts, it posts {type:'SKIP_WAITING'} and we activate + take control
// (controllerchange in app.js reloads once). This makes updates user-prompted. clients.claim()
// in activate is kept so the accepted worker controls the page immediately.

const VERSION = '1.4.0';
const CACHE = `mathfun-v${VERSION}`;

const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './screenshots/mobile-home.png',
  './screenshots/mobile-play.png',
  './screenshots/wide-home.png',
  './js/app.js',
  './js/state.js',
  './js/themes.js',
  './js/sprites.js',
  './js/confetti.js',
  './js/questions.js',
  './js/operations.js',
  './js/funfacts.js',
  './js/game.js',
  './js/rewards.js',
  './js/mastery.js',
  './js/sound.js',
  './js/ui.js',
  './js/avatars.js',
];

self.addEventListener('install', (event) => {
  // Precache the shell. addAll() is all-or-nothing (one missing file fails the whole
  // install), so cache each asset individually and don't let a single miss break offline
  // support for the rest of the app.
  // NOTE: no skipWaiting() here - the new worker waits until the user accepts the update
  // (via the SKIP_WAITING message below), so we can show an "update available" prompt.
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(ASSETS.map((url) => c.add(url).catch(() => {}))))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// The page posts this when the user taps "Update" on the toast - activate immediately so the
// new version takes over (clients.claim in activate + controllerchange in app.js then reload).
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
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
        // Only cache complete, cacheable responses. Partial (206) or opaque/error
        // responses throw on cache.put(); skip them so nothing is logged to the console.
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
  );
});
