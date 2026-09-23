const CACHE_NAME = "accenture-practice-v3";
const urlsToCache = [
  "/",
  "/home/accenture",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET, API, webpack hot-reloads, and chrome-extension requests
  if (
    event.request.method !== "GET" ||
    url.pathname.startsWith("/api") ||
    url.pathname.includes("_next/webpack-hmr") ||
    url.pathname.includes(".hot-update.") ||
    !url.protocol.startsWith("http")
  ) {
    return;
  }

  // Network-first for navigation (HTML) and scripts to prevent React hydration mismatch
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});