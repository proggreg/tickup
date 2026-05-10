---
status: todo
title: Write a test for the 'search-todos' MCP tool
created: 2026-05-10
---

# What

Test suite for `search-todos` MCP tool — query todos by name/keyword, returns matching results, pagination works, empty query handled.

# Why

Part of MCP server coverage (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: search by keyword returns matching todos
- Edge cases: empty query, no matches, special characters
- Tests pass
