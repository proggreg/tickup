---
status: todo
title: Write a test for the 'update-list' MCP tool
created: 2026-05-10
---

# What

Test suite for `update-list` MCP tool — update list properties (name, type, defaultView), returns updated list.

# Why

Core list management for MCP server (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: update list name/properties returns updated list
- Verify changes persisted
- Partial updates work (only update specified fields)
- Tests pass
