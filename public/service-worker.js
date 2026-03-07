// AuraVue Service Worker — Cache-first strategy for offline support
const CACHE_NAME = 'auravue-cache-v1';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico',
    '/logo192.png',
    '/logo512.png',
];

// Install: pre-cache static shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[AuraVue SW] Pre-caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => {
                        console.log('[AuraVue SW] Deleting old cache:', key);
                        return caches.delete(key);
                    })
            )
        )
    );
    self.clients.claim();
});

// Fetch: network-first for API/Firebase, cache-first for static assets
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests and cross-origin requests (e.g. Firebase APIs)
    if (request.method !== 'GET') return;
    if (url.origin !== self.location.origin) return;

    // For HTML navigation requests — network first, fallback to cached index.html
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() =>
                caches.match('/index.html')
            )
        );
        return;
    }

    // For JS/CSS/image assets — cache first, then network
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
                return response;
            });
        })
    );
});
