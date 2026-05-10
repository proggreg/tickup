---
status: todo
title: Write a test for the 'get-todo' MCP tool
created: 2026-05-10
---

# What

A test suite that verifies the `get-todo` MCP tool works correctly — retrieves a single todo by ID, returns all expected fields (id, name, status, description, etc.), and handles error cases (missing ID, invalid ID).

# Why

MCP tool tests ensure the tickup MCP server exposes correct interfaces and data. See tickup #2108 (implement mcp tool tests).

# Acceptance

- Test file created in `mcp/tests/tools/` (follow existing pattern)
- Covers happy path: get a valid todo returns all fields
- Covers error cases: missing ID, invalid ID
- Uses vitest, can run with `pnpm test`
- Tests pass
