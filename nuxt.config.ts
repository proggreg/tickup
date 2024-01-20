const myCustomLightTheme = {
  dark: false,
  colors: {
    primary: '#0000FF'
  }
}
const myCustomDarkTheme = {
  dark: true,
  colors: {
    primary: '#FF0000'
  }
}

export default defineNuxtConfig({
  modules: [
    'vuetify-nuxt-module',
    '@pinia/nuxt',
    '@nuxt/devtools',
    '@vueuse/nuxt',
    'nuxt-mongoose',
    '@nuxtjs/eslint-module',
    "@sidebase/nuxt-auth"
  ],

  experimental: {
    payloadExtraction: false,
    typedPages: false
  },

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
      theme: {
        themes: {
          myCustomDarkTheme,
          myCustomLightTheme
        }
      }
    }
  },
  typescript: {
    strict: true
  },
  devtools: {
    enabled: true
  },
  runtimeConfig: {
    NUXT_NEXTAUTH_SECRET: process.env.NUXT_NEXTAUTH_SECRET,
    github: {
      clientId: process.env.NUXT_GITHUB_CLIENT_ID,
      clientSecret: process.env.NUXT_GITHUB_CLIENT_SECRET
    }
  },
  auth: {
    provider: {
      type: "authjs",
    },
    origin: process.env.VERCEL_URL || "http://localhost:3000",
    globalAppMiddleware: true
  }
})
