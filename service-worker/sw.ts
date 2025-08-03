
declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: string[];
};

import { createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies'

// Precache build assets
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(({ url }) => url.pathname == '/' || url.pathname.startsWith('/list') || url.pathname.startsWith('/todo'), new StaleWhileRevalidate({
  cacheName: "pages"
}))

// Runtime cache for API requests
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
  })
)


// // Runtime cache for images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    // You can add plugins here for expiration, etc.
  })
)


self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('push', (event: PushEvent) => {
  let data: any = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }
  self.registration.showNotification(data.title || 'Tickup', {
    body: data.body || '',
    icon: 'img/icons/android-chrome-192x192.png',
  });
});