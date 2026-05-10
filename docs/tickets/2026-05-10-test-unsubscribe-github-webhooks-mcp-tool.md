---
status: todo
title: Write a test for the 'unsubscribe-github-webhooks' MCP tool
created: 2026-05-10
---

# What

Test suite for `unsubscribe-github-webhooks` MCP tool — unsubscribe from GitHub repo webhooks, removes subscriptions.

# Why

GitHub integration for MCP server (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: unsubscribe from repos removes subscriptions
- Verify repos no longer subscribed
- Multiple repos handled
- Tests pass
