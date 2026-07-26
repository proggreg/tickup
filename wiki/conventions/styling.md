---
title: Styling Conventions
type: convention
updated: 2026-07-26
---

# Styling Conventions

## Core rule

No custom CSS classes. Use Vuetify component props, slots, and the `:deep()` scoped override pattern only when a Vuetify prop is insufficient.

## Vuetify utilities to use

| Need | Use |
|------|-----|
| Spacing | `pa-4`, `ma-2`, `px-3`, etc. |
| Color | `color="primary"`, `color="error"` |
| Layout | `v-row`, `v-col`, `v-container` |
| Typography | `class="text-h6 font-weight-bold"` |
| Flex | `d-flex align-center` |

## Global Vuetify defaults (`config/vuetify.ts`)

| Component | Defaults |
|-----------|---------|
| `VBtn` | `variant: 'plain'` |
| `VTextField` | `variant: 'outlined'`, `density: 'compact'` |

Override per-component as needed via props.

## CSS custom properties

Defined in `app.vue` `<style>`:

```css
--color-background: #f7f9fb
--color-surface-lowest: #ffffff
--color-surface-low: #f0f4f7
--color-primary: #005ac2
--color-primary-container: #dce8ff
--color-on-primary-container: #004eaa
--color-tertiary: #ba1b24
```

## Scrollbar hidden globally

```css
* { scrollbar-width: none; }
*::-webkit-scrollbar { display: none; }
```

## Layout transition

`layout-enter-active` / `layout-leave-active` use `filter: grayscale(1)` transition (0.4s).

## Fonts

Loaded from Google Fonts:
- `Manrope` (700, 800) — headings
- `Inter` (400, 500, 600) — body

## `:deep()` pattern

When Vuetify props don't expose what you need:

```vue
<style scoped>
:deep(.v-list-item__content) {
  padding: 0;
}
</style>
```

Use sparingly — prefer Vuetify props first.
