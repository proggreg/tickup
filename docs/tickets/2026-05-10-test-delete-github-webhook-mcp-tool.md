---
status: todo
title: Write a test for the 'delete-github-webhook' MCP tool
created: 2026-05-10
---

# What

Test suite for `delete-github-webhook` MCP tool — delete webhook by hook ID, returns success.

# Why

GitHub integration for MCP server (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: delete webhook by ID succeeds
- Webhook no longer active after delete
- Tests pass
