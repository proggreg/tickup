---
title: useDialog
type: composable
file: app/composables/dialog.ts
updated: 2026-07-26
---

# `useDialog()`

Single dialog open/close mechanism for the entire app. Uses `useState` to create a singleton.

```typescript
const dialog = useDialog()
// dialog.value = { page: string, open: boolean }
```

## State

| Field | Type | Purpose |
|-------|------|---------|
| `page` | `string` | Which dialog to show (`'todo'`, `'list'`, `''`) |
| `open` | `boolean` | Whether dialog is open |

## Usage

```typescript
// Open todo dialog
dialog.value = { open: true, page: 'todo' }

// Open list dialog
dialog.value = { open: true, page: 'list' }

// Close
dialog.value = { open: false, page: '' }
```

## Consumers

- `useShortcutKeys()` — sets dialog on `t` / `l` keypresses
- `TodoDialog.vue` — reads `open` and `page === 'todo'` to show itself
- `List/New.vue` — reads `page === 'list'` to show new list dialog
- `AppDialog.vue` — wrapper component that delegates to page-specific dialogs

## Architecture note

`TodoDialog.vue` and the new-list dialog consume `useDialog()` directly without going through `AppDialog`. `AppDialog` exists for other dialog types that use the `page` prop pattern.

## Related

- [[components/todo-dialog.md]] — primary dialog consumer
- [[composables/shortcut-keys.md]] — dialog keyboard triggers
