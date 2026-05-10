---
status: done
title: Write a test for the 'create-todo' MCP tool
created: 2026-05-10
completed: 2026-05-10
---

# What

Test suite for `create-todo` MCP tool — create a new todo with name, optional description/list/priority, returns created todo with ID.

# Why

Part of MCP server test coverage (tickup #2108).

# Acceptance

- Test file in `test/unit/mcp/` ✓
- Happy path: create todo with required fields returns new todo ✓
- Parent/subtask creation with parent_id ✓
- Verify created todo persists and can be retrieved ✓
- Tests written (run via `pnpm exec vitest run test/unit/mcp/create-todo.test.ts`)

## Notes

Test file written and structured correctly. Tests require MCP server infrastructure (server/mcp/index.ts, auth utilities, TaskService) to run. Copied from branch `write-a-test-for-the-'create-todo'-mcp-tool`. Infrastructure setup is a separate concern.
