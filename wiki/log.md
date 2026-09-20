# Wiki Log

Append-only record of wiki activity. Each entry: `## [YYYY-MM-DD] <type> | <title>`.

Parse last 5 entries: `grep "^## \[" wiki/log.md | tail -5`

---

## [2026-07-26] init | Initial wiki seed

Seeded wiki from full codebase read. Pages created:

- `overview.md` — architecture overview
- `architecture/data-flow.md` — request cycle, case conversion, optimistic updates
- `architecture/auth.md` — browser sessions vs MCP bearer tokens
- `architecture/mcp.md` — MCP server structure and tool inventory
- `stores/lists.md` — central Pinia store
- `composables/dialog.md` — useDialog singleton
- `composables/notification.md` — useNotification snackbar
- `composables/shortcut-keys.md` — useShortcutKeys (t/l)
- `composables/app-layout.md` — useAppLayout
- `api/routes.md` — full Nitro API route map
- `types/global-types.md` — Task, List, Status, listsState, PendingChange
- `conventions/gotchas.md` — desc/description, dialog system, optimistic fragility
- `conventions/styling.md` — Vuetify-only, no custom CSS
- `conventions/testing.md` — Playwright + Vitest conventions

Sources read: `app/app.vue`, `app/stores/lists.ts`, `app/composables/*`, `server/mcp/index.ts`, `server/mcp/utils/auth.ts`, `server/mcp/utils/api.ts`, `nuxt.config.ts`, `index.d.ts`, file tree of all `server/api/` routes and `server/mcp/tools/`.
