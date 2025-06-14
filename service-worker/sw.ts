
// declare const self: ServiceWorkerGlobalScope & {
//   __WB_MANIFEST: string[];
// };

// import { precacheAndRoute } from 'workbox-precaching'

// precacheAndRoute(self.__WB_MANIFEST)

// console.log('Service Worker Loaded');

// self.addEventListener('install', () => {
//   self.skipWaiting();
// });

// self.addEventListener('push', (event: PushEvent) => {
//   const data = event.data
//   console.log('Push Recieved... changed', data);
//   self.registration.showNotification('hello', {
//     body: 'greg',
//     icon: 'img/icons/android-chrome-192x192.png',
//   });
// });