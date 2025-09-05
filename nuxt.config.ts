import { defineNuxtConfig } from 'nuxt/config'
import vuetify from './config/vuetify'

export default defineNuxtConfig({
  modules: [
    '@vite-pwa/nuxt',
    'vuetify-nuxt-module',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@vueuse/nuxt',
    'nuxt-mongoose',
    '@sidebase/nuxt-auth',
    '@nuxtjs/color-mode',
    '@nuxt/eslint',
    '@nuxtjs/device',
    '@nuxt/test-utils/module',
    'nuxt-bugsnag' 
  ],

  experimental: {
    payloadExtraction: false,
    typedPages: false,
  },

  pages: true,

  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    prerender: {
      routes: ['/'],
    },
  },

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

  pinia: {
    storesDirs: ['./stores/**'],
  },

  vuetify: vuetify,

  typescript: {
    strict: true,
  },

  bugsnag: {
    disabled: process.env.NODE_ENV === 'development', // Disable in development
    publishRelease: true,
    config: {
      apiKey: process.env.BUGSNAG_API_KEY,
      enabledReleaseStages: ['staging', 'production'],
      releaseStage: process.env.NODE_ENV,
    },
  },

  devtools: {
    enabled: true,
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  runtimeConfig: {
    authOrigin: 'http://localhost:3000',
    auth: {
      secret: process.env.NUXT_NEXTAUTH_SECRET,
    },
    github: {
      clientId: process.env.NUXT_GITHUB_CLIENT_ID,
      clientSecret: process.env.NUXT_GITHUB_CLIENT_SECRET,
      personal: process.env.NUXT_GITHUB_PERSONAL_ACCESS_TOKEN,
    },
    private: {  
      vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
    },
    public: {
      hotjarId: process.env.HOTJAR_ID,
      ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VAPID_KEY: process.env.VAPID_PUBLIC_KEY,
      bugsnag: {
        apiKey: process.env.BUGSNAG_API_KEY,
      },
      auth: {
        origin: 'http://localhost:3000',
      }
    },
  },

  auth: {
    origin: process.env.NUXT_AUTH_ORIGIN || 'http://localhost:3000', 
    enabled: true,
    isEnabled: true,
    provider: {
      type: 'authjs',
    },
    baseURL: process.env.VERCEL_ENV === 'production' ? 'https://tickup.gregfield.dev/api/auth' : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/auth` : 'http://localhost:3000',
    secret: process.env.NUXT_NEXTAUTH_SECRET,
    globalAppMiddleware: true,
    sessionRefresh: {
      enablePeriodically: true,
      enableOnWindowFocus: true,
    },
    pages: {
      signIn: '/login',
    },
  },

  mongoose: {
    devtools: true,
    uri: process.env.MONGODB_URI,
  },

  pwa: {
    disable: true,
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
                cacheWillUpdate: async ({ request, response }) => {
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
          handler: 'CacheFirst',   // A good strategy for these static assets
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
       rollupFormat: 'iife'
    },
  },

  vite: {},
  compatibilityDate: '2024-09-21',
})