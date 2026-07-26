---
name: Task Type and DB Column Mapping
description: Global Task interface is camelCase; DB is snake_case; priority column is priority_lev in DB; desc column does not round-trip through objectToSnake
type: project
---

The global `Task` interface (defined in `index.d.ts`) uses camelCase: `priorityLev`, `desc`, `parentId`, `dueDate`, `notificationDateTime`.

DB column names (snake_case via Supabase `Todos` table): `priority_lev`, `desc`, `parent_id`, `due_date`, `notification_date_time`.

`objectToSnake` from `ts-case-convert` handles the camelCase → snake_case conversion at API boundaries, but `description` → `desc` is a special case that must be done manually (it's not a case conversion, it's a rename).

The `create-todo.ts` MCP tool accepts `description` as input and presumably relies on the create API route (`index.post.ts`) to handle the `desc` column mapping — though that route does not appear to explicitly remap it either (potential latent bug in create path).

**How to apply:** When writing MCP tools or API routes that touch the description/desc field, always verify the remapping is explicit.
