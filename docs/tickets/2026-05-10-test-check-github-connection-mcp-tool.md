---
status: todo
title: Write a test for the 'check-github-connection' MCP tool
created: 2026-05-10
---

# What

Test suite for `check-github-connection` MCP tool — check if user has GitHub account connected, returns boolean.

# Why

GitHub integration for MCP server (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: check connection returns true/false
- Works after connect and disconnect
- Tests pass
