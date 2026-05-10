---
status: todo
title: Write a test for the 'get-github-branch' MCP tool
created: 2026-05-10
---

# What

Test suite for `get-github-branch` MCP tool — fetch single branch details by name, returns branch object with commit info.

# Why

GitHub integration for MCP server (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: get branch returns details
- Commit SHA included
- Invalid branch handled gracefully
- Tests pass
