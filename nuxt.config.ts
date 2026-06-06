import type { ModuleOptions as McpToolkitOptions } from '@nuxtjs/mcp-toolkit';
import { defineNuxtConfig } from 'nuxt/config';
import { app, pwa, runtimeConfig, vuetify } from './config/index';

export default defineNuxtConfig({
    modules: [
        '@vite-pwa/nuxt',
        'vuetify-nuxt-module',
        '@pinia/nuxt',
        '@vueuse/nuxt',
        '@nuxtjs/color-mode',
        '@nuxt/eslint',
        '@nuxtjs/device',
        '@nuxt/test-utils/module',
        'nuxt-bugsnag',
        '@nuxtjs/supabase',
        '@nuxtjs/mcp-toolkit',
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

    app: {
        head: {
            link: [
                {
                    rel: 'preconnect',
                    href: 'https://fonts.googleapis.com',
                },
                {
                    rel: 'preconnect',
                    href: 'https://fonts.gstatic.com',
                    crossorigin: '',
                },
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Inter:wght@400;500;600&display=swap',
                },
            ],
        },
    },

    runtimeConfig,

    ignore: [
        '**/.claude',
        'e2e',
        'e2e-screenshots',
        'playwright',
        'playwright-report',
        'test',
        'test-results',
    ],

    experimental: {
        payloadExtraction: false,
        typedPages: false,
        asyncContext: true,
    },

    compatibilityDate: '2026-02-28',
    nitro: {
        esbuild: {
            options: {
                target: 'esnext',
            },
        },
        typescript: {
            tsConfig: {
                include: ['../index.d.ts', '../types/**/*.ts'],
            },
        },
        experimental: {
            asyncContext: true,
            websocket: true,
        },
    },
    vite: {
        server: {
            allowedHosts: ['dev.gregfield.dev'],
            // hmr: {
            //   protocol: 'wss',
            //   host: 'localhost',
            //   clientPort: 443
            // }
        },
    },

    typescript: {
        strict: false,
        typeCheck: false,
        tsConfig: {
            include: ['../types/**/*.ts'],
        },
    },

    bugsnag: {
        // disabled: process.env.NODE_ENV === 'development', // Disable in development
        publishRelease: true,
        config: {
            apiKey: process.env.BUGSNAG_API_KEY,
            enabledReleaseStages: ['preview', 'production'],
            releaseStage: process.env.VERCEL_ENV || 'development',
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

    mcp: {
        name: 'Tickup',
        description: 'Tickup MCP server — tools and resources for the todo app.',
        sessions: true,
    } as McpToolkitOptions,

    pinia: {},

    pwa,

    supabase: {
        redirectOptions: {
            login: '/login',
            callback: '/confirm',
            include: undefined,
            exclude: ['/oauth/consent'],
            saveRedirectToCookie: false,
        },
    },

    vuetify: vuetify,
});
