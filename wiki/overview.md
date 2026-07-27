---
title: Architecture Overview
type: overview
updated: 2026-07-26
---

# Tickup — Architecture Overview

Tickup is a personal todo/task management app. It's a Nuxt 4 application with Vuetify 3, Pinia, Supabase, and an MCP server for LLM integrations.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 4 (source in `app/`) |
| UI | Vuetify 3 |
| State | Pinia (one central store) |
| Backend | Nitro (under `server/`) |
| Database | Supabase (Postgres) |
| Auth | @nuxtjs/supabase |
| MCP | @nuxtjs/mcp-toolkit |
| PWA | @vite-pwa/nuxt |
| Testing | Playwright (e2e), Vitest (unit) |
| Deployment | Vercel |
| Error tracking | Bugsnag |

## Source layout

```
app/                   # Nuxt 4 app source
  app.vue              # root: snackbars, TodoDialog, NuxtLayout, shortcut keys
  pages/               # file-based routing
  components/          # Vue components (see components/)
  composables/         # shared composables (see composables/)
  stores/              # Pinia store (lists.ts is the main one)
  layouts/             # default, mobile, todo, login-register
server/
  api/                 # Nitro API routes
  mcp/                 # MCP server (tools, resources, prompts, utils)
  middleware/          # supabase session middleware
  utils/               # github, oauth, tasks helpers
index.d.ts             # global TypeScript types (Task, List, Status, listsState)
config/
  vuetify.ts           # global Vuetify component defaults
e2e/                   # Playwright tests
test/unit/             # Vitest unit + MCP integration tests
```

## Data flow

```
User action
  → Component calls Store action
    → Store calls $fetch to Nitro API
      → API route reads/writes Supabase via serverSupabaseClient
        → Returns camelCase response (objectToCamel from ts-case-convert)
      → Store updates local state
    → Component reactively re-renders
```

DB column names are `snake_case`. API boundary converts: `objectToSnake` on write, `objectToCamel` on read.

## Auth

Two auth paths:
1. **Browser sessions**: Supabase cookie-based (`sb-*-auth-token`). `@nuxtjs/supabase` handles redirect to `/login` for protected pages. Callback at `/confirm`.
2. **MCP bearer tokens**: OAuth flow. Token verified in `server/mcp/index.ts` middleware via `verifySupabaseAccessToken`. Stored in `event.context.bearerToken` and `event.context.user`.

See [[architecture/auth.md]] and [[architecture/mcp.md]].

## Key pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `pages/index.vue` | Dashboard (today/overdue/recent todos) |
| `/lists` | `pages/lists.vue` | All lists |
| `/list/[id]` | `pages/list/[id].vue` | Single list view |
| `/todo/[id]` | `pages/todo/[id].vue` | Todo detail (todo layout) |
| `/search` | `pages/search.vue` | Search |
| `/chat` | `pages/chat.vue` | Chat (MCP client) |
| `/login` | `pages/login.vue` | Auth |
| `/(settings)/` | `pages/(settings)/` | Settings pages |

## Modules

- `@vite-pwa/nuxt` — PWA with push notifications and service worker
- `vuetify-nuxt-module` — Vuetify 3 integration
- `@pinia/nuxt` — auto-import stores
- `@vueuse/nuxt` — auto-import VueUse composables
- `@nuxtjs/color-mode` — dark/light mode
- `@nuxtjs/device` — mobile detection
- `nuxt-bugsnag` — error tracking
- `@nuxtjs/supabase` — auth + DB client
- `@nuxtjs/mcp-toolkit` — MCP server
- `@nuxt/test-utils/module` — testing support

## Related pages

- [[architecture/data-flow.md]] — detailed data flow and casing conventions
- [[architecture/auth.md]] — auth system detail
- [[architecture/mcp.md]] — MCP server architecture
- [[stores/lists.md]] — the central Pinia store
- [[conventions/gotchas.md]] — known pitfalls
