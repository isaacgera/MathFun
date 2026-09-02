// sw.js - app-shell caching so MathFun loads and plays offline (SPEC R8).
// The cache name carries the app version; bump VERSION on each release to bust old caches.

const VERSION = '1.0.1';
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

// Cache-first for our shell; network fallback for anything else.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).catch(() => cached))
  );
});
