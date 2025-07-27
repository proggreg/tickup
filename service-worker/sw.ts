
declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: string[];
};

// import { precacheAndRoute } from 'workbox-precaching'

// precacheAndRoute(self.__WB_MANIFEST)

console.log('Service Worker Loaded');

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