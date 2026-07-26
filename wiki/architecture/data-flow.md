---
title: Data Flow
type: architecture
updated: 2026-07-26
---

# Data Flow

## Request cycle

```
Component
  ↓ calls action
Pinia Store (app/stores/lists.ts)
  ↓ $fetch
Nitro API Route (server/api/...)
  ↓ serverSupabaseClient(event)
Supabase Postgres
  ↑ snake_case rows
API Route (objectToCamel)
  ↑ camelCase response
Store (updates state)
  ↑ reactive
Component
```

## Case conversion

All DB columns are `snake_case`. The API boundary converts using `ts-case-convert`:

- **Write**: `objectToSnake(body)` before Supabase insert/update
- **Read**: `objectToCamel(data)` before returning response

**Exception**: The `desc` field on todos is NOT renamed by `objectToSnake`. It stays `desc` in both JS and DB. Any tool or route accepting a `description` input must manually remap: `{ desc: input.description }`. The `update-todo` MCP tool has this fix applied. See [[conventions/gotchas.md]].

## State management

[[stores/lists.md]] owns all shared state. Components do not hold their own copies of todos/lists — they read from the store. Exceptions:

- `TodoDialog.vue` has a local `selectedListId` ref (independent of `currentList`) for the list picker within the dialog. Before calling `addTodo()`, it sets `newTodo.listId = selectedListId.value`.
- `addListId()` in the store falls back to `currentList.id` only when `todo.listId` is not already set.

## Optimistic updates

`addTodo()` uses optimistic updates:
1. Push todo to local state immediately (`optimisticallyUpdateTodos`)
2. POST to API
3. Update the local todo's `id` with the server-assigned id (`updateTodosId`)

`addList()` similarly: push to `this.lists`, POST, then set `id` on the last element.

## Error handling

`showError()` (Nuxt built-in) surfaces errors via the `useError()` state. `app.vue` watches `error` and shows a `v-snackbar` toast. After display, `clearError()` dismisses.

Store actions generally `throw` after calling `showError` so callers know something failed.
