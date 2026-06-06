import type { ModuleOptions as VitePwaModuleOptions } from '@vite-pwa/nuxt';

const pwa: Partial<VitePwaModuleOptions> = {
    disable: false,
    registerType: 'autoUpdate',
    manifest: {
        name: 'Tickup',
        short_name: 'Tickup',
        theme_color: '#000000',
        icons: [
            {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
            {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
            },
        ],
    },
    workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        runtimeCaching: [
            {
                urlPattern: ({ request }) => request.mode === 'navigate',
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'navigation-cache',
                    plugins: [
                        {
                            // This plugin will ensure that if a navigation request fails,
                            // it falls back to the offline.html page.
                            cacheWillUpdate: async ({ response }) => {
                                if (!response || response.status === 404) {
                                    return caches.match('/offline.html');
                                }
                                return response;
                            },
                        },
                    ],
                },
            },
            {
                urlPattern: '/_nuxt/.*', // Match all files in the _nuxt directory
                handler: 'CacheFirst', // A good strategy for these static assets
                options: {
                    cacheName: 'nuxt-chunks-cache',
                    expiration: {
                        maxEntries: 100,
                        maxAgeSeconds: 60 * 60 * 24 * 365, // Cache for a year
                    },
                    cacheableResponse: {
                        statuses: [0, 200], // Cache opaque responses and OK responses
                    },
                },
            },
        ],
        navigateFallback: '/offline.html', // Fallback for navigation requests
    },
    client: {
        installPrompt: true,
    },
    devOptions: {
        enabled: true,
        suppressWarnings: false,
        navigateFallback: '/', // Keep this for dev, but workbox.navigateFallback takes precedence for build
        navigateFallbackAllowlist: [/^\/$/],
        type: 'module',
    },
    // add this to handle sw within the app
    srcDir: 'service-worker',
    filename: 'sw.ts',
    // add this to handle push notifications
    strategies: 'injectManifest',
    injectManifest: {
        rollupFormat: 'iife',
    },
};

export default pwa;
