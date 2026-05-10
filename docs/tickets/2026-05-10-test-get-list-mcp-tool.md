---
status: todo
title: Write a test for the 'get-list' MCP tool
created: 2026-05-10
---

# What

Test suite for `get-list` MCP tool — fetch a list by ID, returns list with all properties (name, type, defaultView, todos count, etc.).

# Why

Core list management for MCP server (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: get valid list returns all properties
- Invalid list ID handled gracefully
- Tests pass
