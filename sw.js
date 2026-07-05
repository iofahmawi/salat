// sw.js - مواقيت الصلاة (نسخة التخزين الديناميكي المضمونة)
const CACHE_NAME = 'prayer-times-v21'; // قمت بتغيير الرقم لفرض التحديث

// سنخزن فقط الصفحة الرئيسية لضمان نجاح التثبيت مهما حدث
const urlsToCache = [
  './',
  'index.html'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // تفعيل التحديث فوراً دون انتظار
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching critical files');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Service Worker: Install failed', err);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  // استراتيجية: الشبكة أولاً فعلياً، والكاش فقط عند عدم توفر إنترنت
  // Network first, falling back to cache only when offline

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      // 1. جرّب النت أولاً دايماً لضمان الحصول على آخر نسخة
      return fetch(event.request)
        .then(networkResponse => {
          // خزّن النسخة الجديدة بالكاش لتُستخدم عند انقطاع النت
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => {
          // 2. لا نت؟ رجّع النسخة المخزّنة بالكاش كحل بديل
          return cache.match(event.request);
        });
    })
  );
});