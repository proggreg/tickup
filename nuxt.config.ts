import { defineNuxtConfig } from 'nuxt/config';
import vuetify from './config/vuetify';

export default defineNuxtConfig({
    modules: [
        '@vite-pwa/nuxt',
        'vuetify-nuxt-module',
        '@pinia/nuxt',
        // "pinia-plugin-persistedstate/nuxt",
        '@vueuse/nuxt',
        '@nuxtjs/color-mode',
        '@nuxt/eslint',
        '@nuxtjs/device',
        '@nuxt/test-utils/module',
        'nuxt-bugsnag',
        '@nuxtjs/supabase',
        'nuxt-mcp',
    ],

    pages: true,

    imports: {
        autoImport: true,
        dirs: ['./stores'],
        presets: [
            {
                from: 'vuetify',
                imports: ['useDisplay'],
            },
        ],
    },

    devtools: {
        enabled: true,
    },

    runtimeConfig: {

        aiGatewayApiKey: process.env.NUXT_AI_GATEWAY_API_KEY,

        private: {
            vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
            github: {
                privateKey: process.env.GITHUB_PRIVATE_KEY,
                appId: process.env.GITHUB_APP_ID,
                clientId: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
            },
        },
        public: {
            apiBase: '/api',
            hotjarId: process.env.HOTJAR_ID,
            ENV: process.env.NODE_ENV,
            VERCEL_ENV: process.env.VERCEL_ENV,
            VERCEL_URL: process.env.VERCEL_URL,
            VAPID_KEY: process.env.VAPID_PUBLIC_KEY,
            bugsnag: {
                apiKey: process.env.BUGSNAG_API_KEY,
            },
            supabaseUrl: process.env.SUPABASE_URL,
            supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
            githubAppName: process.env.NUXT_PUBLIC_GITHUB_APP_NAME,
        },
    },

    experimental: {
        payloadExtraction: false,
        typedPages: false,
    },

    nitro: {
        esbuild: {
            options: {
                target: 'esnext',
            },
        },
    },

    vite: {
        server: {
            allowedHosts: ['dev.gregfield.dev'],
        },
    },

    typescript: {
        strict: false,
        typeCheck: false,

    },

    bugsnag: {
        disabled: process.env.NODE_ENV === 'development', // Disable in development
        publishRelease: true,
        config: {
            apiKey: process.env.BUGSNAG_API_KEY,
            enabledReleaseStages: ['staging', 'production'],
            releaseStage: process.env.NUXT_PUBLIC_VERCEL_ENV || 'development',
        },
    },

    eslint: {
        checker: true,
        config: {
            stylistic: {
                semi: true,
                indent: 4,
            },
        },
    },

    pinia: {},

    pwa: {
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
    },

    supabase: {
        redirectOptions: {
            login: '/login',
            callback: '/confirm',
            include: undefined,
            exclude: [],
            saveRedirectToCookie: false,
        },
    },

    vuetify: vuetify,
});
