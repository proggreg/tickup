---
status: todo
title: Write a test for the 'list-github-repos' MCP tool
created: 2026-05-10
---

# What

Test suite for `list-github-repos` MCP tool — list repos accessible to GitHub App installation, returns array of repo objects.

# Why

GitHub integration for MCP server (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: list repos returns array
- Each repo has name, full_name, URL
- Tests pass
