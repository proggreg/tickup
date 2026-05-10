---
status: todo
title: Write a test for the 'list-github-webhook-subscriptions' MCP tool
created: 2026-05-10
---

# What

Test suite for `list-github-webhook-subscriptions` MCP tool — list subscribed repos, returns array of subscription objects.

# Why

GitHub integration for MCP server (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: list subscriptions returns array
- Shows correct repos
- Tests pass
