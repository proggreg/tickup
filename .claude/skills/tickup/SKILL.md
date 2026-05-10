---
name: tick-up
description: Workflow for developing the tickup app. Use tickup MCP server to fetch tasks and subtasks for autonomous execution.
---

# Tickup Skill

Workflow for tickup app development using the connected MCP server.

## MCP Server Integration

Use the tickup MCP server to interact with tasks:

**Server**: `https://tickup-git-implement-mcp-tool-tests-greg-fields-projects.vercel.app/mcp`

### Available Tools

| Tool | Purpose | Args |
|------|---------|------|
| `get_todo` | Fetch task by ID | `{ id: string }` |
| `get_subtasks` | Fetch task subtasks | `{ id: string }` |
| `get_lists` | Fetch all lists | `{}` |
| `get_list_todos` | Fetch todos in a list | `{ listId: string }` |
| `search_todos` | Search todos by query | `{ query: string }` |
| `update_todo` | Update task | `{ id: string, status?: string, completed_date?: string, ... }` |
| `create_todo` | Create new todo | `{ name: string, description?: string, list_id: string, ... }` |

## Fetching Tasks

When executing a task:

1. **Get task**: Call `get_todo(id)` to fetch task details
2. **Get subtasks**: Call `get_subtasks(id)` to fetch child tasks
3. **Read description**: Use task name and description to understand what to do
4. **Execute**: Build, test, fix, write, deploy, etc. based on description
5. **Mark done**: Call `update_todo(id, { status: "completed", completed_date: now })` when finished

## Example: Execute a Task

```
Task ID: 507f1f77bcf86cd799439011

1. fetch: get_todo("507f1f77bcf86cd799439011")
   → { name: "Fix auth bug", description: "Login fails with special chars", status: "todo" }

2. fetch: get_subtasks("507f1f77bcf86cd799439011")
   → [{ name: "Reproduce bug", ... }, { name: "Write test", ... }, { name: "Fix code", ... }]

3. execute: Based on description "Login fails with special chars"
   - Reproduce the issue
   - Write regression test
   - Fix input validation
   - Run tests to verify

4. mark done: update_todo("507f1f77bcf86cd799439011", { status: "completed" })
```

## Key Conventions

- Task description is your specification — read carefully
- Subtasks provide breakdown of work
- Always verify work before marking done
- Use project tools (`pnpm`, etc.) as needed
- Follow project style and architecture guides
- Commit meaningful changes
- Report progress clearly
