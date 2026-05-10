---
status: todo
title: Write a test for the 'get-url-metadata' MCP tool
created: 2026-05-10
---

# What

Test suite for `get-url-metadata` MCP tool — fetch page titles for URLs, returns metadata (title, description, etc.).

# Why

Utility feature for MCP server (tickup #2108).

# Acceptance

- Test file in `mcp/tests/tools/`
- Happy path: fetch metadata for valid URLs returns titles
- Invalid URLs handled gracefully
- Tests pass
