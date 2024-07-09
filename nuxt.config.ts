export default defineNuxtConfig({
  modules: [
    '@vite-pwa/nuxt',
    'vuetify-nuxt-module',
    '@pinia/nuxt',
    '@nuxt/devtools',
    '@vueuse/nuxt',
    'nuxt-mongoose',
    'nuxt-bugsnag',
    '@sidebase/nuxt-auth',
    '@nuxtjs/color-mode',
    '@nuxt/eslint',
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
        imports: ['useDisplay', 'useDate'],
      },
    ],
  },

  pinia: {
    storesDirs: ['./stores/**'],
  },
  vuetify: {
    vuetifyOptions: {
      labComponents: true,
      defaults: {
        VAppBar: {
          elevation: 0,
        },
        VSheet: {
          elevation: 10,
          width: 300,
          class: 'pa-4',
          rounded: 'xl',
        },
        VBtn: {
          rounded: 'xl',
          elevation: 0,
        },
        VTextField: {
          rounded: 'xl',
          variant: 'outlined',
          density: 'compact',
          hideDetails: 'auto',
        },
        VTextarea: {
          rounded: 'xl',
          variant: 'outlined',
        },
        VListItem: {
          rounded: 'xl',
        },
        VList: {
          rounded: 'xl',
        },
        VMenu: {
          rounded: 'xl',
        },
        VCard: {
          rounded: 'xl',
        },
      },
      theme: {
        themes: {
          light: {
            colors: {
              secondary: '#FFFFFF',
            },
          },
          dark: {
            colors: {
              secondary: '#000000',
            },
          },
        },
      },
    },
  },
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
      hotjarId: process.env.HOTJAR_ID,
    },
  },
  auth: {
    enabled: true,
    provider: {
      type: 'authjs',
    },
    baseURL: process.env.NUXT_ENV_VERCEL_URL
      ? 'https://' + process.env.NUXT_ENV_VERCEL_URL + '/api/auth'
      : 'http://localhost:3000/api/auth',
    secret: process.env.NUXT_NEXTAUTH_SECRET,
    globalAppMiddleware: true,
  },
  mongoose: {
    devtools: true,
    uri: process.env.MONGODB_URI,
  },
  pwa: {
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
})
