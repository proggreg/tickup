---
name: MCP Tool Input Schema Conventions
description: MCP tools in this project mix snake_case and camelCase input fields; desc/description DB mismatch is a recurring gotcha
type: project
---

MCP tools under `server/mcp/tools/` use `defineMcpTool`. The `inputSchema` field naming is inconsistent across tools: `create-todo.ts` uses all snake_case (`list_id`, `parent_id`, `due_date`), while `update-todo.ts` mixes camelCase and snake_case (`listId`, `dueDate`, `priority_lev`). Both conventions currently coexist.

The DB column `desc` does not correspond to any camelCase name that `objectToSnake` would produce, so `description` must be manually remapped to `desc` after the `objectToSnake()` call. This is a known one-off exception documented with a comment in `update-todo.ts`.

**Why:** The Supabase DB uses `desc` as the column name (presumably to avoid a SQL keyword collision with `DESCRIPTION`), while the frontend `Task` interface and MCP tool both use `description` as the human-readable name.

**How to apply:** Any future MCP tool or API route that writes to the `desc` column must manually remap from `description` after `objectToSnake()`.
