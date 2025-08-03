declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: string[];
};

import { createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies'

// The URL to your fallback page. This page should be a simple HTML file that
// is precached and provides a custom offline message to the user.
const offlinePage = '/offline.html';

// Precache all assets, including your offline page
precacheAndRoute(self.__WB_MANIFEST.concat([
  { url: offlinePage, revision: null }
]))

// Use a navigation route to handle all navigations.
// This is the crucial part that's missing from your original code.
// It will serve a precached offline page if a navigation request fails.
const navigationRoute = new NavigationRoute(
  createHandlerBoundToURL(offlinePage),
  {
    // You can also define which paths should NOT be handled by this route.
    // For example, if you have a special admin section that you don't want to cache.
    // allowlist: [/^\/(list|todo)/],
    // denylist: [ /^\/admin/ ]
  }
)
registerRoute(navigationRoute)

// Runtime cache for API requests. You might consider using a NetworkOnly strategy
// with a fallback for API requests if you need to gracefully handle failed API calls.
// For now, StaleWhileRevalidate is fine for online use.
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
  })
)

// Runtime cache for images
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