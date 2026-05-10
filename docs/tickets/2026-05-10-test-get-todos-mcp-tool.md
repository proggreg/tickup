---
status: todo
title: Write a test for the 'get-todos' MCP tool
created: 2026-05-10
---

# What

Test suite for `get-todos` MCP tool — fetch all todos or filtered by user/date/status, returns array of todos with all fields.

# Why

Part of MCP server test coverage (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: get all todos returns array
- Filters work: by user, by due date, by status
- Empty results handled gracefully
- Tests pass
