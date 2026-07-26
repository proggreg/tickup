# Wiki Index

Catalog of all wiki pages. LLM reads this first on any query to find relevant pages.

## Overview

- [Architecture Overview](overview.md) — Stack, source layout, data flow, key pages, modules

## Architecture

- [Data Flow](architecture/data-flow.md) — Request cycle, case conversion, optimistic updates, error handling
- [Auth System](architecture/auth.md) — Browser sessions vs MCP bearer tokens, auth utilities
- [MCP Server](architecture/mcp.md) — MCP tool inventory, auth middleware, structure

## Stores

- [Lists Store](stores/lists.md) — Central Pinia store: state shape, all actions, new-todo flow

## Composables

- [useDialog](composables/dialog.md) — Singleton dialog open/close state
- [useNotification](composables/notification.md) — Snackbar notifications
- [useShortcutKeys](composables/shortcut-keys.md) — Global keyboard shortcuts (t/l)
- [useAppLayout](composables/app-layout.md) — Layout selection by route + device

## API

- [API Routes](api/routes.md) — Full Nitro route map (todo, list, github, other)

## Types

- [Global Types](types/global-types.md) — Task, List, Status, listsState, PendingChange interfaces

## Conventions

- [Styling](conventions/styling.md) — No custom CSS, Vuetify utilities, defaults, fonts
- [Testing](conventions/testing.md) — E2e (Playwright) and unit/MCP (Vitest) conventions
- [Gotchas](conventions/gotchas.md) — desc/description, dialog system, optimistic update fragility, auth quirks
