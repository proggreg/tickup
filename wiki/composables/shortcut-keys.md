---
title: useShortcutKeys
type: composable
file: app/composables/useShortcutKeys.ts
updated: 2026-07-26
---

# `useShortcutKeys()`

Registers global keyboard shortcuts. Called once in `app.vue`.

## Shortcuts

| Key | Action |
|-----|--------|
| `t` | Open new todo dialog |
| `l` | Open new list dialog |

## Guards

Shortcuts fire only when the active element is NOT:
- Inside a Vuetify overlay (`.v-overlay__content`)
- An `INPUT` element
- A `TEXTAREA` element

This prevents shortcuts firing while the user types in a form.

## Implementation

Uses `@vueuse/core`'s `onKeyDown`. Sets `dialog.value = { open: true, page: 'todo' }` or `{ open: true, page: 'list' }` via [[composables/dialog.md]].

## Related

- [[composables/dialog.md]] — dialog state modified by shortcuts
