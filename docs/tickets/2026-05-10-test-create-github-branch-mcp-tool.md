---
status: todo
title: Write a test for the 'create-github-branch' MCP tool
created: 2026-05-10
---

# What

Test suite for `create-github-branch` MCP tool — create branch in GitHub repo, returns branch details.

# Why

GitHub integration for MCP server (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: create branch returns branch details
- Branch name validation works
- Tests pass
