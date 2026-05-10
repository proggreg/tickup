---
status: todo
title: Write a test for the 'disconnect-github' MCP tool
created: 2026-05-10
---

# What

Test suite for `disconnect-github` MCP tool — remove GitHub integration for user, connection no longer valid.

# Why

GitHub integration for MCP server (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: disconnect removes connection
- Verify connection deleted
- Tests pass
