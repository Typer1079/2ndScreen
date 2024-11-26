// service-worker.js
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('static-cache').then(cache => {
      return cache.addAll([
        '/',
        '/2ndScreen.html',
        '/2ndScreen.css',
        '/2ndScreen.js',
        // Add other necessary files like images, etc.
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
