const CACHE_NAME = 'salat-v5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './icon-1024.png'
];

// تثبيت الـ Service Worker وحفظ الملفات الأساسية في الذاكرة
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// تنظيف الذاكرة القديمة عند تحديث الـ Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// استراتيجية الاستجابة: يحاول جلب البيانات من الإنترنت أولاً، إذا فشل (أوفلاين) يجلبها من الكاش
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // إذا نجح الاتصال، قم بتخزين نسخة محدثة في الكاش
        if (event.request.method === 'GET' && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // إذا فشل الاتصال (أوفلاين)، ابحث عنها في الكاش
        return caches.match(event.request);
      })
  );
});
