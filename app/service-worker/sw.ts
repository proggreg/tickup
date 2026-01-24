import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope & {
    __WB_MANIFEST: string[];
};

// Precache build assets
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(({ url }) => url.pathname == '/'
    || url.pathname.startsWith('/list')
    || url.pathname.startsWith('/todo'),
new StaleWhileRevalidate({
    cacheName: 'pages',
}),
);

// Dynamic todo/list APIs: network first so new/updated todos appear without refresh.
// Cache is only used when offline. Must be registered before the generic /api/ route.
registerRoute(
    ({ url }) => {
        const p = url.pathname;
        return p === '/api/todos' || p === '/api/lists' || p === '/api/list/todos'
            || p.startsWith('/api/todo/')
            || (p.startsWith('/api/list/') && p !== '/api/list/todos');
    },
    new NetworkFirst({
        cacheName: 'api-cache',
    }),
);

// Other API requests: stale-while-revalidate
registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new StaleWhileRevalidate({
        cacheName: 'api-cache',
    }),
);

// // Runtime cache for images
registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: 'image-cache',
    // You can add plugins here for expiration, etc.
    }),
);

// Function to request persistent storage
async function requestPersistentStorage() {
    if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persisted();
        if (!isPersisted) {
            const granted = await navigator.storage.persist();
            if (granted) {
                console.log('Persistent storage granted!');
            }
            else {
                console.log('Persistent storage not granted.');
            }
        }
        else {
            console.log('Storage is already persistent.');
        }
    }
}

self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    // Call the persistence function here, but don't await it.
    // The 'install' event should complete quickly.
    event.waitUntil(
        (async () => {
            // It's also a good idea to perform the persistence request here
            // as part of the installation process.
            await requestPersistentStorage();
            self.skipWaiting();
        })(),
    );
});

self.addEventListener('push', (event: PushEvent) => {
    let data: any = {};
    if (event.data) {
        try {
            data = event.data.json();
        }
        catch {
            data = { body: event.data.text() };
        }
    }
    self.registration.showNotification(data.title || 'Tickup', {
        body: data.body || '',
        icon: 'img/icons/android-chrome-192x192.png',
    });
});
