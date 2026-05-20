const CACHE_NAME = 'scores-tarot-gino-v11';
const APP_ASSETS = [
  './',
  '/',
  './index.html',
  '/index.html',
  './manifest.webmanifest',
  '/manifest.webmanifest',
  './styles.css',
  '/styles.css',
  './icon-192.png',
  '/icon-192.png',
  './icon-512.png',
  '/icon-512.png'
];

function mettreEnCacheSiValide(request, response) {
  if (!response || response.status !== 200) {
    return response;
  }

  const responseClone = response.clone();
  caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
  return response;
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isNavigationRequest = event.request.mode === 'navigate';
  const isAppShellRequest = isSameOrigin && (requestUrl.pathname.endsWith('/') || requestUrl.pathname.endsWith('/index.html'));
  const isStaticAsset = isSameOrigin && APP_ASSETS.some(asset => {
    const assetUrl = new URL(asset, self.location.origin);
    return assetUrl.pathname === requestUrl.pathname;
  });

  if (isNavigationRequest || isAppShellRequest) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => mettreEnCacheSiValide(event.request, networkResponse))
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          return cachedResponse
            || await caches.match('/index.html')
            || await caches.match('./index.html')
            || await caches.match('/')
            || await caches.match('./');
        })
    );
    return;
  }

  if (isStaticAsset) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => mettreEnCacheSiValide(event.request, networkResponse))
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          return cachedResponse
            || await caches.match('/index.html')
            || await caches.match('./index.html');
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then(networkResponse => mettreEnCacheSiValide(event.request, networkResponse))
        .catch(() => caches.match(event.request).then(r => r)
          .then(r => r || caches.match('/index.html') || caches.match('./index.html')));
    })
  );
});