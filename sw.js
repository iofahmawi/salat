const CACHE_NAME = 'prayer-times-cache-v11'; // <-- 1. تم تغيير رقم الإصدار
const urlsToCache = [
  '/',
  'index.html',
  'manifest.json',
  'icon-1024.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap',
  // --- 2. تمت إضافة جميع ملفات البيانات ---
  'https://iofahmawi.github.io/salat/amman-2025.csv',
  'https://iofahmawi.github.io/salat/zarqa-2025.csv',
  // --- 3. الملفات الجديدة التي تمت إضافتها ---
  'https://iofahmawi.github.io/salat/balqa-2025.csv',
  'https://iofahmawi.github.io/salat/Madaba-2025.csv',
  // --- باقي الملفات ---
  'https://iofahmawi.github.io/salat/irbid-2025.csv',
  'https://iofahmawi.github.io/salat/mafraq-2025.csv',
  'https://iofahmawi.github.io/salat/ajloun-2025.csv',
  'https://iofahmawi.github.io/salat/jerash-2025.csv',
  'https://iofahmawi.github.io/salat/karak-2025.csv',
  'https://iofahmawi.github.io/salat/tafilah-2025.csv',
  'https://iofahmawi.github.io/salat/ma\'an-2025.csv',
  'https://iofahmawi.github.io/salat/aqaba-2025.csv'
];

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName); // Deleting old caches
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Use a "Cache, falling back to network" strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});