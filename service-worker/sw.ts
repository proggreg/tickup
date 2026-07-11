/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();
self.addEventListener('activate', () => self.clients.claim());

interface PushPayload {
    title?: string;
    message?: string;
    body?: string;
    link?: string;
}

self.addEventListener('push', (event) => {
    let payload: PushPayload = {};
    try {
        payload = event.data?.json() ?? {};
    }
    catch {
        payload = { message: event.data?.text() };
    }

    const title = payload.title ?? 'Tickup';
    const body = payload.body ?? payload.message ?? '';

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            data: { link: payload.link ?? '/' },
        }),
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const link = (event.notification.data as { link?: string } | undefined)?.link ?? '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            for (const client of clients) {
                if (client.url === link && 'focus' in client) {
                    return client.focus();
                }
            }
            return self.clients.openWindow(link);
        }),
    );
});
