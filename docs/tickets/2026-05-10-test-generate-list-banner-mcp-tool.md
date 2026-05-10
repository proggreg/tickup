---
status: todo
title: Write a test for the 'generate-list-banner' MCP tool
created: 2026-05-10
---

# What

Test suite for `generate-list-banner` MCP tool — generate banner image for a list using prompt, returns base64 data URL.

# Why

Utility feature for MCP server (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: generate banner returns base64 data URL
- Valid image data in response
- Tests pass
