export default defineNuxtConfig({
  modules: [
    'vuetify-nuxt-module',
    '@pinia/nuxt',
    '@nuxt/devtools',
    '@vueuse/nuxt',
    'nuxt-mongoose',
    '@nuxtjs/eslint-module',
    'nuxt-bugsnag',
    '@sidebase/nuxt-auth',
    '@nuxtjs/color-mode'
  ],

  experimental: {
    payloadExtraction: false,
    typedPages: false
  },
  pages: true,

  nitro: {
    esbuild: {
      options: {
        target: 'esnext'
      }
    },
    prerender: {
      routes: []
    }
  },

  imports: {
    autoImport: true,
    dirs: ['./stores'],
    presets: [{
      from: 'vuetify',
      imports: ['useDisplay', 'useDate']
    }]
  },

  pinia: {
    storesDirs: ['./stores/**']
  },
  vuetify: {
    vuetifyOptions: {
      defaults: {
        VSheet: {
          elevation: 10,
          width: 300,
          class: 'pa-4',
          rounded: 'xl'
        },
        VBtn: {
          rounded: 'xl'
        },
        VTextField: {
          rounded: 'xl',
          variant: 'outlined',
          density: 'compact'
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
        }

      },
      theme: {
        themes: {
          light: {
            colors: {
              secondary: '#FFFFFF'
            }
          },
          dark: {
            colors: {
              secondary: '#000000'
            }
          }
        }
      }
    }
  },
  typescript: {
    strict: true
  },
  bugsnag: {
    config: {
      apiKey: process.env.BUGSNAG_API_KEY,
      enabledReleaseStages: ['staging', 'production'],
      releaseStage: process.env.NODE_ENV,
    }
  },
  devtools: {
    enabled: true
  },
  runtimeConfig: {
    auth: {
      secret: process.env.NUXT_NEXTAUTH_SECRET,
    },
    github: {
      clientId: process.env.NUXT_GITHUB_CLIENT_ID,
      clientSecret: process.env.NUXT_GITHUB_CLIENT_SECRET
    },
    public: {
      hotjarId: process.env.HOTJAR_ID
    }
  },
  auth: {
    provider: {
      type: "authjs",
    },
    secret: process.env.NUXT_NEXTAUTH_SECRET,
    origin: process.env.VERCEL_URL || "http://localhost:3000",
    globalAppMiddleware: true,
    
  },
  mongoose: {
    devtools: true,
    options: {
      appName: 'Tickup',
    }
  }
})
