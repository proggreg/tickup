---
title: Lists Store
type: store
file: app/stores/lists.ts
updated: 2026-07-26
---

# Lists Store (`useListsStore`)

The single central Pinia store. Owns virtually all app state. Defined in `app/stores/lists.ts`. Auto-imported everywhere via `@pinia/nuxt`.

## State shape (`listsState`)

```typescript
{
  lists: List[]          // all user lists
  currentList: List      // the list currently being viewed
  newList: List          // draft state for creating a new list
  currentTodo: Task      // the todo currently open in detail/panel
  newTodo: Task          // draft state for creating a new todo
  todos: Task[]          // flat todos (used by search/todos page)
  todaysTodos: Task[]    // todos due today
  overdueTodos: Task[]   // overdue todos
  recentTodos: Task[]    // recently created todos
  view: 'list' | 'board' // current view mode
  panelOpen: boolean     // is the todo detail panel open
}
```

Initial state built by `createNewTodoState()` and `createNewListState()` helpers (imported from `./helpers`).

## Key actions

### List actions
| Action | API call | Notes |
|--------|---------|-------|
| `addList()` | `POST /api/list` | Optimistic: pushes to `lists` first, sets `id` after |
| `updateList(list?)` | `PUT /api/list/:id` | Defaults to `currentList`. Skips if offline |
| `deleteList(id?)` | `DELETE /api/list/:id` | Navigates away if currently viewing that list |
| `getLists()` | `GET /api/lists` | Replaces `lists` array |
| `getList(id)` | `GET /api/list/:id` | Sets `currentList` |
| `getListTodos(id?)` | `GET /api/list/todos` | Updates `list.todos` and `currentList.todos` |
| `setCurrentList(list)` | — | Synchronous setter |

### Todo actions
| Action | API call | Notes |
|--------|---------|-------|
| `addTodo(todo?)` | `POST /api/todo` | Optimistic; uses `newTodo` state if no arg |
| `updateTodo(todo?)` | `PUT /api/todo/:id` | Defaults to `currentTodo` |
| `deleteTodo(id)` | `DELETE /api/todo/:id` | Removes from all state arrays |
| `getTodo(id)` | `GET /api/todo/:id` | Sets `currentTodo` |
| `getTodos()` | `GET /api/todos` | Sets `todos` |
| `getTodaysTodos()` | `GET /api/todos?today=true` | Sets `todaysTodos` |
| `getOverdueTodos()` | `GET /api/todos?overdue=true` | Sets `overdueTodos` |
| `getRecentTodos()` | `GET /api/todos?recent=true` | Sets `recentTodos` |
| `debounceUpdateTodo` | — | Debounced version of `updateTodo` (200ms) |

### Subtask actions
| Action | API call | Notes |
|--------|---------|-------|
| `fetchSubtasks(todoId)` | `GET /api/todo/:id/subtasks` | Sets `currentTodo.subtasks` |
| `addSubtask(name, parentId)` | `POST /api/todo` | Pushes to `currentTodo.subtasks` |
| `deleteSubtask(id)` | `DELETE /api/todo/:id` | Filters from `currentTodo.subtasks` |

## New todo flow

`TodoDialog.vue` sets `newTodo.listId` before calling `addTodo()`. The store's `addListId()` only falls back to `currentList.id` when `todo.listId` is falsy — so the dialog's list picker is independent of the page the user is on.

## Optimistic update pattern

`addTodo()`:
1. `setTodoDetails(todo)` — adds `listId` and `dueDate` defaults
2. `optimisticallyUpdateTodos(todo)` — pushes to `currentList.todos` or `todaysTodos` based on route
3. `$fetch POST /api/todo`
4. `updateTodosId(createdTodo)` — sets `id` on the last element

`addList()`:
1. `this.lists.push(newList)`
2. `$fetch POST /api/list`
3. `this.lists[last].id = list.id`

## Reset

`resetTodo()` → `newTodo = createNewTodoState()`
`resetList()` → `newList = createNewListState()`
`newResetAll()` → both

## Related

- [[architecture/data-flow.md]] — how store interacts with API layer
- [[components/todo-dialog.md]] — primary consumer of `newTodo`
- [[types/global-types.md]] — `Task`, `List`, `listsState` interfaces
