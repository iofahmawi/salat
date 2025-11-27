// sw.js - مواقيت الصلاة (نسخة التخزين الديناميكي المضمونة)
const CACHE_NAME = 'prayer-times-v20'; // قمت بتغيير الرقم لفرض التحديث

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
  // استراتيجية: الشبكة أولاً، ثم الكاش، مع حفظ كل ما يتم تحميله
  // Network first, falling back to cache, then save network response
  
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // 1. حاول جلبه من الكاش أولاً (لسرعة العرض)
        if (response) {
          // حتى لو وجدناه في الكاش، نحاول تحديثه من النت في الخلفية للمرة القادمة
          // (اختياري، لكن هنا سنعتمد على الكاش الموجود حال عدم وجود نت)
          return response;
        }

        // 2. إذا لم يكن في الكاش، اطلبه من النت
        return fetch(event.request)
          .then(networkResponse => {
            // خزنه في الكاش للمستقبل
            if(networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                 cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
             // هنا وصلنا لطريق مسدود: لا نت ولا كاش
             // يمكن عرض صفحة بديلة أو رسالة خطأ
          });
      });
    })
  );
});