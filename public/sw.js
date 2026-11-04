// Offline support. Keeps the app (its page and built files) and the guitar
// samples, which come from the soundfont CDN the first time each sound plays,
// in a cache, so the app opens and plays with no network.
const CACHE = 'chords-v1';
const SAMPLES_HOST = 'gleitz.github.io';

// Cache the page and every built file it links to, so the app works offline
// right after the first visit.
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      const response = await fetch('/', {cache: 'no-cache'});
      const html = await response.clone().text();
      await cache.put('/', response);
      await cache.addAll(builtFiles(html));
    })(),
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter(name => name !== CACHE).map(name => caches.delete(name)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', event => {
  const {request} = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (request.mode === 'navigate') {
    // Every path is the same app: the network first, so a new deploy shows up
    // straight away, and the cached page when offline.
    event.respondWith(fromNetworkThenCache(request));
  } else if (
    url.hostname === SAMPLES_HOST ||
    (url.origin === self.location.origin && url.pathname.startsWith('/assets/'))
  ) {
    // Samples and built files (their names change with their content) never
    // change: the cache first.
    event.respondWith(fromCacheThenNetwork(request));
  } else if (url.origin === self.location.origin) {
    // Other files (icons, gear pictures): the cache for speed, refreshed in the
    // background.
    event.respondWith(fromCacheAndRefresh(event, request));
  }
});

function builtFiles(html) {
  return [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(match => match[1]);
}

async function fromNetworkThenCache(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put('/', response.clone());
      await dropOldBuilds(cache, await response.clone().text());
    }
    return response;
  } catch {
    return (await cache.match('/')) ?? Response.error();
  }
}

// After a deploy, forget the previous build's files.
async function dropOldBuilds(cache, html) {
  const current = new Set(builtFiles(html).map(path => new URL(path, self.location.origin).href));
  const keys = await cache.keys();
  await Promise.all(
    keys
      .filter(key => new URL(key.url).pathname.startsWith('/assets/') && !current.has(key.url))
      .map(key => cache.delete(key)),
  );
}

async function fromCacheThenNetwork(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(CACHE)).put(request, response.clone());
  return response;
}

async function fromCacheAndRefresh(event, request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const refresh = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });
  event.waitUntil(refresh.catch(() => {}));
  return cached ?? refresh;
}
