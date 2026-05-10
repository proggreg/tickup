---
status: todo
title: Write a test for the 'list-github-branches' MCP tool
created: 2026-05-10
---

# What

Test suite for `list-github-branches` MCP tool — list all branches in a GitHub repo, returns array of branch objects.

# Why

GitHub integration for MCP server (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: list branches returns array
- Each branch has name and commit info
- Tests pass
