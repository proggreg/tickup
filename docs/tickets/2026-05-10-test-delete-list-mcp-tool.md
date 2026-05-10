---
status: todo
title: Write a test for the 'delete-list' MCP tool
created: 2026-05-10
---

# What

Test suite for `delete-list` MCP tool — delete a list by ID, returns success, list no longer retrievable.

# Why

Core list management for MCP server (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: delete valid list returns success
- Deleted list cannot be retrieved after
- Deleting non-existent list handled gracefully
- Tests pass
