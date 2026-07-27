---
title: useAppLayout
type: composable
file: app/composables/useAppLayout.ts
updated: 2026-07-26
---

# `useAppLayout()`

Returns a computed layout name based on current route and device type. Used in `app.vue` as `<NuxtLayout :name="useAppLayout()">`.

## Layout selection logic

| Condition | Layout |
|-----------|--------|
| Route is `login`, `register`, or contains `consent` | `login-register` |
| `isMobile` (from `useDevice()`) | `mobile` |
| Route is `todo-id` | `todo` |
| Otherwise | `default` |

## Layouts

| Name | File | Purpose |
|------|------|---------|
| `default` | `app/layouts/default.vue` | Desktop with nav sidebar |
| `mobile` | `app/layouts/mobile.vue` | Mobile layout |
| `todo` | `app/layouts/todo.vue` | Full-screen todo detail |
| `login-register` | `app/layouts/login-register.vue` | Auth pages, no nav |

## Related

- [[overview.md]] — app structure
