---
status: todo
title: Write a test for the 'create-list' MCP tool
created: 2026-05-10
---

# What

Test suite for `create-list` MCP tool — create a new list with name, optional properties (type, defaultView), returns created list with ID.

# Why

Core list management for MCP server (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: create list with name returns new list
- Verify list persists and can be retrieved
- Optional properties work (listType, defaultView)
- Tests pass
