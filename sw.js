/**
 * sw.js — Service Worker do Portal Região 655
 * Estratégia: Cache-First para assets estáticos, Network-First para HTML
 */
const CACHE_NAME = 'reg655-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/login.html',
    '/styles/main.css',
    '/styles/admin.css',
    '/styles/pastor.css',
    '/styles/components.css',
    '/js/auth.js',
    '/js/utils.js',
    '/js/firebase-helpers.js',
    '/js/toast.js',
    '/firebase-config.js',
    '/logo.png',
    '/mini.png',
    '/assinatura.png'
];

// Instalação: pré-cache de assets essenciais
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.warn('[sw] Pré-cache parcial:', err);
            });
        })
    );
    self.skipWaiting();
});

// Ativação: limpeza de caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
            );
        })
    );
    self.clients.claim();
});

// Fetch: estratégia híbrida
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Ignorar requisições Firebase e APIs externas
    if (
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('gstatic.com') ||
        url.hostname.includes('firestore.googleapis.com') ||
        url.hostname.includes('identitytoolkit.googleapis.com') ||
        url.hostname.includes('unpkg.com') ||
        url.hostname.includes('cdnjs.cloudflare.com') ||
        url.pathname.startsWith('/__/')
    ) {
        return;
    }

    // HTML: Network-First
    if (event.request.destination === 'document' || url.pathname.endsWith('.html')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Assets estáticos: Cache-First
    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request).then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                return response;
            });
        })
    );
});
