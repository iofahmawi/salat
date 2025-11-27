// sw.js

// قم بتحديث رقم الإصدار لضمان تفعيل التعديلات
const CACHE_NAME = 'prayer-times-dynamic-v16';

// نضع هنا فقط ملفات واجهة التطبيق الأساسية
// أزلنا ملفات CSV لكي لا يفشل التثبيت إذا تعثر تحميل أحدها
const urlsToCache = [
  '/',
  'index.html',
  'manifest.json',
  'icon-1024.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap'
];

self.addEventListener('install', event => {
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
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // سطر مهم لإجبار المتصفح على استخدام النسخة الجديدة فوراً
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // 1. إذا وجدنا الملف في الكاش، نرجعه فوراً
        if (cachedResponse) {
          return cachedResponse;
        }

        // 2. إذا لم نجده، نطلبه من الإنترنت
        return fetch(event.request).then(networkResponse => {
          // التحقق من صحة الاستجابة
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
            return networkResponse;
          }

          // 3. نقوم بنسخ الاستجابة وتخزينها في الكاش للمرة القادمة
          // هذا هو الجزء الذي يحل مشكلتك (التخزين الديناميكي)
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        });
      })
  );
});