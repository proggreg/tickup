---
status: todo
title: Write a test for the 'connect-github' MCP tool
created: 2026-05-10
---

# What

Test suite for `connect-github` MCP tool — save GitHub App installation ID for user, persists connection.

# Why

GitHub integration for MCP server (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: connect with installation ID saves connection
- Verify connection persists
- Tests pass
