importScripts('/cache-polyfill.js');

self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open('footer').then(function(cache) {
     return cache.addAll([
       '/index.html',
       '/styles.css',
       '/app.js'
     ]);
   })
 );
});

navigator.serviceWorker.getRegistrations().then(function(registrations) { for(let registration of registrations) { registration.unregister() } })
