---
status: todo
title: Write a test for the 'get-subtasks' MCP tool
created: 2026-05-10
---

# What

Test suite for `get-subtasks` MCP tool — fetch subtasks for a parent todo, returns array of subtasks with correct parent relationship.

# Why

Part of MCP server test coverage (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: get subtasks of a parent returns array
- Each subtask has correct parent ID
- No subtasks returns empty array, not error
- Tests pass
