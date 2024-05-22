export default defineNuxtConfig({
  modules: [
    'vuetify-nuxt-module',
    '@pinia/nuxt',
    '@nuxt/devtools',
    '@vueuse/nuxt',
    'nuxt-mongoose',
    'nuxt-bugsnag',
    '@sidebase/nuxt-auth',
    '@nuxtjs/color-mode',
     '@nuxt/eslint'
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
      labComponents: true,
      defaults: {
        VAppBar: {
          elevation: 0,
        },
        VSheet: {
          elevation: 10,
          width: 300,
          class: 'pa-4',
          rounded: 'xl'
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
    baseUrl: process.env.NUXT_ENV_VERCEL_URL || 'http://localhost:3000',
    publishRelease: true,    
    config: {
      apiKey: process.env.BUGSNAG_API_KEY,
      enabledReleaseStages: ['development','staging', 'production'],
      releaseStage: process.env.NODE_ENV,

    }
  },
  devtools: {
    enabled: true
  },
   eslint: {
    config: {
      stylistic: true 
    }
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
    uri: process.env.MONGODB_URI,
    
    options: {
      appName: 'Tickup',
      
    }
  }
})
