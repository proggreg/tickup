---
title: useNotification
type: composable
file: app/composables/useNotification.ts
updated: 2026-07-26
---

# `useNotification()`

Snackbar notification system. Three `useState` singletons: `show`, `message`, `link`.

## API

```typescript
const { show, message, link, notify, dismiss } = useNotification()
```

| Export | Type | Purpose |
|--------|------|---------|
| `show` | `Ref<boolean>` | Controls snackbar visibility |
| `message` | `Ref<string>` | Snackbar text |
| `link` | `Ref<string \| undefined>` | Optional "View" button link |
| `notify(text, options?)` | function | Show notification |
| `dismiss()` | function | Hide immediately |

## `notify` options

```typescript
notify('Todo created!', {
  link: '/todo/123',   // optional — shows "View" button
  timeout: 2000,       // ms; 0 = no auto-dismiss; default 5000
})
```

## Rendering

`app.vue` renders the snackbar:
- Location: `bottom right`
- Default timeout: 2000ms (in template)
- Shows `v-btn` "View" link only when `notificationLink` is set

Note: `app.vue` uses the `show`, `message`, `link` refs directly from `useNotification()`.

## Related

- [[components/app-root.md]] — where snackbar is rendered
