---
status: todo
title: Write a test for the 'reorder-list-todos' MCP tool
created: 2026-05-10
---

# What

Test suite for `reorder-list-todos` MCP tool — reorder todos in a list by providing new order array, persists order.

# Why

Core list management for MCP server (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: reorder todos updates order
- Verify order persisted when list re-fetched
- Partial reorder (subset of todos) works
- Tests pass
