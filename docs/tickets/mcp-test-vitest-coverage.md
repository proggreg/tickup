---
Status: done
taskId: 2381
title: Set up vitest coverage report for MCP tool tests
completed: 2026-05-10
---

# Set up vitest coverage report for MCP tool tests

Configure vitest.config.ts with coverage provider (v8), thresholds for line/branch/function/statement coverage, and generate HTML reports. Integrate with CI pipeline to fail on coverage regressions.

Branch: `claude/kind-wozniak-hohlU`

## Notes

Coverage already configured with:
- v8 provider in vitest.config.ts
- Thresholds: lines 70%, functions 70%, branches 65%, statements 70%
- Multiple reporters: text, text-summary, html, json
- MCP-specific include path: server/mcp/**/*.ts, server/api/**/*.ts
- test:coverage and test:mcp:coverage scripts available
