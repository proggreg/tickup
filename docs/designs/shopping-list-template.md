# Shopping list template

Tickup: #6859 · Status: approved · 2026-10-17

## Problem

Users who want a shopping list today create a blank list and set it up by hand. There's no quick way to get a list that's ready for shopping, and Claude (via MCP) can't create one in a single step either. The work is a small UX shortcut, but it needs plumbing that's currently missing: `POST /api/list` only saves `name` (`server/api/list/index.post.ts`), and a list's `icon` is never persisted (the `Lists` table has no `icon` column; `icon` only exists in client state, `app/stores/helpers.ts`).

## Goals / Non-goals

**Goals (v1)**
- Add a "Shopping" **list template**: one choice creates a list with preset name, icon and view.
- Make it available from the new-list dialog on desktop and mobile.
- Make it available from the MCP tool `create_list` (e.g. "create a shopping list").
- Build a template registry that makes later templates a one-line addition.

**Non-goals**
- A dedicated shopping UI (quantity fields, tick-to-bottom, "clear ticked"). Shopping lists render with the existing `ListSimple` view.
- Aisle/category grouping.
- Sharing a list with other users.
- Offline sync.
- A separate items table. Items stay as `Todos`.

## User flow

**Desktop**
1. Press `l` (handled by `useShortcutKeys`), or click `new-list-button`. The New List dialog opens (`app/components/List/New.vue`).
2. Below the name field, a chip group shows **Blank** (selected by default) and **Shopping**.
3. Click **Shopping**. If the name field is empty, it fills with "Shopping"; a name the user already typed is kept. The icon preview changes to `mdi-cart`.
4. Click Save or press Enter. The list appears in the nav with the cart icon, and the app navigates to it as it does today.

**Mobile**
- Same dialog, same chip group, full width under the name field. The chips replace nothing; `ListType` is already hidden on `smAndDown`.

**MCP**
- `create_list({ name?: "Shopping", template: "shopping" })` returns the list including `icon`.

## Data model

Migration `supabase/migrations/20261017120000_list_icon.sql`:

```sql
ALTER TABLE "public"."Lists" ADD COLUMN icon text;
```

- Nullable, with no default. The UI keeps falling back to `mdi-format-list-bulleted`, as `app/pages/lists.vue:40` already does.
- RLS: no change. Existing `Lists` row policies cover the new column.
- No template column. A template is applied once at creation time and isn't stored; the result is just a normal list.
- `index.d.ts`: `List.icon` already exists. Add `type ListTemplateKey = 'blank' | 'shopping';`.

**Template registry**: `shared/utils/listTemplates.ts`. Nuxt 4's `shared/` directory is auto-imported by both `app/` and `server/`, so the UI chips and the API read the same source.

```ts
export const LIST_TEMPLATES = {
    blank:    { label: 'Blank',    name: '',         icon: 'mdi-format-list-bulleted', defaultView: 'list' },
    shopping: { label: 'Shopping', name: 'Shopping', icon: 'mdi-cart',                 defaultView: 'list' },
} as const satisfies Record<ListTemplateKey, ListTemplate>;
```

## API

`POST /api/list` (`server/api/list/index.post.ts`)

Request (camelCase):

```ts
{ name?: string; icon?: string; defaultView?: View; template?: ListTemplateKey }
```

- Resolution order for each field: explicit body value, then the template value, then the current default.
- `name` is required **after** the template is resolved. `{ template: 'shopping' }` with no name produces "Shopping".
- An unknown `template` returns `400 "Unknown list template"`.
- Map fields with `objectToSnake` (`default_view`, `icon`). Fix the existing handler, which drops everything except `name`.
- Fix error handling: the outer `catch` currently rewraps the 400 as a 500. Rethrow `H3Error`s unchanged.

Response: the created list in camelCase (`objectToCamel`), now including `icon` and `defaultView`.

`GET /api/lists` (`server/api/lists.get.ts`) and `GET /api/list/[id]` already `select('*')`, so they return `icon` once the column exists. No change needed.

`PUT /api/list/[id]`: accept `icon`, so the icon can be edited later (this is the persistence half of #1466). Small change, in the same slice.

## MCP

`server/mcp/tools/list/create-list.ts`:

```ts
inputSchema: {
    name: z.string().optional().describe('The name of the list. Defaults to the template name.'),
    template: z.enum(['blank', 'shopping']).optional()
        .describe('Preset to apply. "shopping" creates a shopping list.'),
},
```

- Pass `template` through to `POST /api/list`.
- `name` becomes optional only when `template` is set. With neither, the call returns `isError`, keeping the existing "rejects missing name" test in `test/unit/mcp/create-list.test.ts` passing.
- There's no `description` field, so the `desc` remapping doesn't apply.
- Per CLAUDE.md, the change ships on the `create_list` tool's paired test branch, with a regression test.

## State

`app/stores/lists.ts`
- Add `newListTemplate: ListTemplateKey` to state, defaulting to `'blank'`.
- Add `applyListTemplate(key)`: sets `newList.icon` and `newList.defaultView`, and sets `newList.name` only if it's empty.
- `addList()`: include `template: this.newListTemplate` in the POST body. `resetList()` resets the template to `'blank'`.
- The optimistic push already includes `newList.icon`, so the nav shows the cart icon immediately.

## UI

- `app/components/List/New.vue`: add a `v-chip-group` (`mandatory`, `selected-class="text-primary"`) under the name field, built from `LIST_TEMPLATES`. Each chip shows its `prepend-icon` and has `data-testid="list-template-<key>"`.
- `app/components/App/Nav/Items.vue`: the list rows don't render an icon today. Add `list.icon || 'mdi-format-list-bulleted'` to each row.
- `app/pages/lists.vue:40`: already falls back correctly. No change.
- Styling: Vuetify props and utility classes only, no new CSS classes.

## Edge cases & failure modes

| Case | Behaviour |
|---|---|
| User types a name, then picks Shopping | The typed name is kept and only the icon/view change |
| Picks Shopping, then clears the name | Save is disabled, as today |
| Picks Shopping, then switches back to Blank | Icon resets; name stays "Shopping" if the template filled it (accepted, keeps things simple) |
| Several lists called "Shopping" | Allowed. Names aren't unique today |
| Unknown template from MCP | Rejected by the zod enum, so `isError` |
| Unknown template sent directly to the API | 400 |
| Existing lists with `icon = NULL` | UI fallback icon, no backfill |

## Test plan

**API e2e** (`e2e/api/lists/create-list-template.spec.ts`)
- `{ template: 'shopping' }` returns name "Shopping", icon `mdi-cart` and defaultView `list`.
- `{ name: 'Weekly shop', template: 'shopping' }`: the name override wins.
- `{ template: 'nope' }` returns 400 (a regression test for the 400→500 rewrap).
- `{ name: 'x', icon: 'mdi-star' }`: the icon persists and round-trips through `GET /api/list/[id]`.

**MCP unit** (`test/unit/mcp/create-list.test.ts`)
- `template: 'shopping'` with no name returns a list with the shopping name and icon.
- An invalid enum value returns `isError`.
- The existing missing-name test still passes.

**UI e2e** (`e2e/lists/create-list-template.spec.ts`, using `listAPI` cleanup from `e2e/fixtures/index.ts`)
- Desktop: open with `l`, click `list-template-shopping`, press Enter. The nav item `[data-list-id]` shows the `mdi-cart` icon.
- Mobile: same flow on the mobile project.
- A typed name is preserved after picking the template.

## Rollout

1. Run the migration first. It's additive and nullable, so it's safe ahead of the code.
2. Deploy the API, then MCP and UI in any order.
3. No feature flag and no backfill needed.

## Decisions

1. **Starter items**: deferred. The Shopping template seeds no items, since staples overlap with recurring items (a future feature).
2. **`defaultSort`**: not set by the template. Manual order fits how people shop.
3. **#1466 "Replace list type with icons"**: kept separate. This feature adds the icon persistence that #1466 can build on.
4. **MCP branch**: subtask 3 branches from subtask 2, because it needs the API changes. It doesn't use the paired `create_list` test branch.

## Task breakdown

| # | Subtask | Depends on | Branch from | Done when |
|---|---|---|---|---|
| 1 | Add `icon` column to Lists + list template registry | — | parent | Migration applied locally; `shared/utils/listTemplates.ts` + `ListTemplateKey` type exist; `pnpm build` passes |
| 2 | Support templates and icon in list create/update API | 1 | #1 branch | `POST /api/list` resolves template, persists icon/defaultView, returns 400 for unknown template; `PUT` accepts icon; API e2e specs green |
| 3 | Add `template` param to `create_list` MCP tool | 2 | #2 branch | MCP unit tests green, including missing-name regression |
| 4 | Template picker in new-list dialog + list icons in nav | 2 | #2 branch | Store sends template; chips on desktop+mobile; nav shows icon; UI e2e green |
