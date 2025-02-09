import vuetifyOptions from './config/vuetify'

export default defineNuxtConfig({
  modules: [
    'vuetify-nuxt-module',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@vueuse/nuxt',
    'nuxt-mongoose',
    'nuxt-bugsnag',
    '@sidebase/nuxt-auth',
    '@nuxtjs/color-mode',
    '@nuxt/eslint',
    '@nuxtjs/device',
    '@vite-pwa/nuxt',
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
      routes: [],
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

  vuetify: vuetifyOptions,

  typescript: {
    strict: true,
  },

  bugsnag: {
    baseUrl: process.env.NUXT_ENV_VERCEL_URL || 'http://localhost:3000',
    publishRelease: true,
    config: {
      apiKey: process.env.BUGSNAG_API_KEY,
      enabledReleaseStages: ['development', 'staging', 'production'],
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
    auth: {
      secret: process.env.NUXT_NEXTAUTH_SECRET,
    },
    github: {
      clientId: process.env.NUXT_GITHUB_CLIENT_ID,
      clientSecret: process.env.NUXT_GITHUB_CLIENT_SECRET,
    },
    public: {
      github: process.env.NUXT_GITHUB_PERSONAL_ACCESS_TOKEN,

      hotjarId: process.env.HOTJAR_ID,
      ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
  },

  auth: {
    enabled: false,
    provider: {
      type: 'authjs',
    },
    baseURL: process.env.VERCEL_ENV === 'production' ? 'https://tickup.gregfield.dev/api/auth' : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/auth` : undefined,
    secret: process.env.NUXT_NEXTAUTH_SECRET,
    globalAppMiddleware: true,
  },

  mongoose: {
    devtools: true,
    uri: process.env.MONGODB_URI,
  },

  pwa: {
    disable: false,
    strategies: 'generateSW',
    srcDir: undefined,
    filename: undefined,
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
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
      // you don't need to include this: only for testing purposes
      // if enabling periodic sync for update use 1 hour or so (periodicSyncForUpdates: 3600)
      periodicSyncForUpdates: 20,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },

  vite: {},
  compatibilityDate: '2024-09-21',
})
