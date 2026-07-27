---
title: Global Types
type: type
file: index.d.ts
updated: 2026-07-26
---

# Global Types

Declared in `index.d.ts` at repo root. Available everywhere — no import needed.

## `Task`

Core todo interface.

```typescript
interface Task {
  id?: string
  userId?: string
  name: string                  // required
  status?: string
  dueDate?: Date
  listId?: string
  list?: List
  desc?: string                 // description — note: NOT 'description'
  edit?: boolean
  selected?: boolean
  color?: string
  priorityLev?: string
  githubBranchName?: string
  githubRepo?: string
  githubLink?: string
  githubPrLink?: string
  links?: { id?: string; title: string; url: string }[]
  parentId?: string             // set for subtasks
  subtasks?: Task[]
  attachments?: Attachment[]
  notificationDateTime?: string | Date
  notificationSent?: boolean
  createdAt?: string
  updatedAt?: string
}
```

**Gotcha**: description field is `desc`, not `description`. See [[conventions/gotchas.md]].

## `List`

```typescript
interface List {
  id?: string
  name: string
  todos?: Task[]
  image?: string
  listType: ListType            // 'simple' | 'table' | ''
  icon?: string
  githubRepo?: string
  defaultView?: View
}
```

## `Status`

Custom todo status (configurable per user in settings).

```typescript
interface Status {
  name: string
  color: string
  todos?: Task[]
  Edit?: boolean
}
```

## `listsState`

Pinia store state shape — see [[stores/lists.md]].

## `ViewType`

`'list' | 'board'`

## `ListType`

`'simple' | 'table' | ''`

## `PendingChange` / `OptimisticUpdate`

Used by the offline sync system (`useOfflineSync`). Tracks pending API calls when offline.

```typescript
interface PendingChange {
  id: string | number
  action: string
  endpoint: string
  method: string
  data: any
  timestamp: number
  synced: boolean
  retryCount: number
  syncedAt?: number
  tempId?: string
  listId?: string
  todoId?: string
  optimisticUpdate?: OptimisticUpdate
}

interface OptimisticUpdate {
  type: 'list' | 'todo' | 'delete_list' | 'delete_todo'
  tempId?: string
  id?: string
  listId?: string
  todoId?: string
  list?: any
  todo?: any
  index?: number
  updates?: any
}
```

## `Settings`

```typescript
interface Settings {
  statuses: Status[]
}
```

## Related

- [[stores/lists.md]] — uses these types
- [[conventions/gotchas.md]] — `desc` vs `description` pitfall
