---
status: todo
title: Write a test for the 'get-list-todos' MCP tool
created: 2026-05-10
---

# What

Test suite for `get-list-todos` MCP tool — fetch all todos in a list, returns array of todos (excludes subtasks).

# Why

Core list management for MCP server (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: get todos for valid list returns array
- Only top-level todos returned (no subtasks)
- Empty list returns empty array, not error
- Tests pass
