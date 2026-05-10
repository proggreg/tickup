---
status: todo
title: Write a test for the 'get-lists' MCP tool
created: 2026-05-10
---

# What

Test suite for `get-lists` MCP tool — fetch all lists for user, returns array with correct properties (id, name, type, defaultView, etc.).

# Why

Core list management for MCP server (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: get lists returns array with all properties
- Empty lists handled gracefully
- Tests pass
