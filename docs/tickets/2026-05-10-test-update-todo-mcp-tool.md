---
status: todo
title: Write a test for the 'update-todo' MCP tool
created: 2026-05-10
---

# What

Test suite for `update-todo` MCP tool — update todo properties (name, status, description, priority, due date), returns updated todo.

# Why

Core todo management for MCP server (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: update todo returns updated todo
- Partial updates work (only specified fields)
- Status transitions handled correctly
- Tests pass
