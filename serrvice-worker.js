const CACHE_NAME = 'mmu-bikes-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './firebase-auth.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});