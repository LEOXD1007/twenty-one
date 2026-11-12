/* Twenty-One PWA service worker: network-first with cache fallback. Not used inside the native app. */
var CACHE = 'abstain21-v2';
var ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/app.css',
  './js/env.js',
  './js/i18n.js',
  './js/pro-config.js',
  './js/native.js',
  './js/pro.bundle.js',
  './js/app.js',
  './apple-touch-icon.png',
  './icon-512.png',
  './icon-maskable-512.png'
];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
      return res;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || caches.match('./index.html'); });
    })
  );
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(function (cs) {
    if (cs.length) return cs[0].focus();
    return self.clients.openWindow('./index.html');
  }));
});
