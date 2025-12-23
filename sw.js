// Simple Service Worker for caching
const CACHE_NAME = 'ezzybooks-simple-v1';
const urlsToCache = ['/', '/index.html', '/vehicle.html', '/styles.css', '/script.js'];

// Install - cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch - serve from cache first
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
