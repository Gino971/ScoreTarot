const CACHE_NAME = 'scores-tarot-gino-v12';
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
  '/icon-512.png',
  './Excuse.png',
  '/Excuse.png'
];

function mettreEnCacheSiValide(request, response) {
  if (!response || response.status !== 200) {
    return response;
  }

  const responseClone = response.clone();
  caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
  return response;
}

async function reponseDepuisCache(request) {
  return caches.match(request)
    || caches.match('/index.html')
    || caches.match('./index.html')
    || caches.match('/')
    || caches.match('./');
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  const networkPromise = fetch(request)
    .then(response => mettreEnCacheSiValide(request, response))
    .catch(() => null);

  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await networkPromise;
  return networkResponse || reponseDepuisCache(request);
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
  const isManifestRequest = isSameOrigin && requestUrl.pathname.endsWith('/manifest.webmanifest');
  const isStaticAsset = isSameOrigin && APP_ASSETS.some(asset => {
    const assetUrl = new URL(asset, self.location.origin);
    return assetUrl.pathname === requestUrl.pathname;
  });

  if (isNavigationRequest || isAppShellRequest) {
    event.respondWith(reponseDepuisCache(event.request).then(response => response || staleWhileRevalidate(event.request)));
    return;
  }

  if (isStaticAsset || isManifestRequest) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then(networkResponse => mettreEnCacheSiValide(event.request, networkResponse))
        .catch(() => reponseDepuisCache(event.request));
    })
  );
});