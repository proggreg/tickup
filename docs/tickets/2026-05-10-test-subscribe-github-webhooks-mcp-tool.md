---
status: todo
title: Write a test for the 'subscribe-github-webhooks' MCP tool
created: 2026-05-10
---

# What

Test suite for `subscribe-github-webhooks` MCP tool — subscribe to webhooks for GitHub repos, persists subscriptions.

# Why

GitHub integration for MCP server (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: subscribe to repos returns confirmation
- Subscriptions persisted
- Multiple repos handled
- Tests pass
