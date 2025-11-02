import { createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: string[]
}

// Precache build assets
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(({ url }) => url.pathname == '/'
  || url.pathname.startsWith('/list')
  || url.pathname.startsWith('/todo'),
  new StaleWhileRevalidate({
    cacheName: 'pages',
  }),
)

// Runtime cache for API requests
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
  }),
)

// // Runtime cache for images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    // You can add plugins here for expiration, etc.
  }),
)

// Function to request persistent storage
async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persisted()
    if (!isPersisted) {
      const granted = await navigator.storage.persist()
      if (granted) {
        console.log('Persistent storage granted!')
      }
 else {
        console.log('Persistent storage not granted.')
      }
    }
 else {
      console.log('Storage is already persistent.')
    }
  }
}

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  // Call the persistence function here, but don't await it.
  // The 'install' event should complete quickly.
  event.waitUntil(
    (async () => {
      // It's also a good idea to perform the persistence request here
      // as part of the installation process.
      await requestPersistentStorage()
      self.skipWaiting()
    })(),
  )
})

self.addEventListener('push', (event: PushEvent) => {
  let data: any = {}
  if (event.data) {
    try {
      data = event.data.json()
    }
 catch (e) {
      data = { body: event.data.text() }
    }
  }
  self.registration.showNotification(data.title || 'Tickup', {
    body: data.body || '',
    icon: 'img/icons/android-chrome-192x192.png',
  })
})
