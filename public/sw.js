/* Oʻyna va oʻrgan — Offline-First Service Worker (ADR-0005) */
const CACHE_PREFIX = 'oyna-organ-';
let CACHE_NAME = `${CACHE_PREFIX}v1`;

const CORE_ROUTES = [
  '/',
  '/uz',
  '/uz/learn',
  '/uz/play',
  '/uz/map',
  '/uz/principles',
  '/offline',
  '/manifest.webmanifest',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      let urls = [...CORE_ROUTES];
      try {
        const res = await fetch('/sw-manifest.json', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.buildId) {
            CACHE_NAME = `${CACHE_PREFIX}${data.buildId}`;
          }
          if (Array.isArray(data.assets)) {
            urls = Array.from(new Set([...urls, ...data.assets]));
          }
        }
      } catch {
        // Fallback to CORE_ROUTES
      }
      const cache = await caches.open(CACHE_NAME);
      await Promise.allSettled(urls.map((u) => cache.add(u)));
      // Notify open tabs that a new version is waiting without calling skipWaiting() automatically
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) {
        client.postMessage({ type: 'SW_UPDATE_READY' });
      }
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Immutable hashed static assets & fonts: Cache-First
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              void caches.open(CACHE_NAME).then((c) => c.put(req, copy));
            }
            return res;
          })
      )
    );
    return;
  }

  // HTML navigation: Network-First with cache fallback + /offline fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            void caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          const offline = await caches.match('/offline');
          return offline || new Response('Oflayn', { status: 503 });
        })
    );
  }
});
