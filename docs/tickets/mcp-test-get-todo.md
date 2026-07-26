---
Status: done
taskId: 2133
title: Write a test for the 'get-todo' MCP tool
priority: high
completed: 2026-05-10
---

# Write a test for the 'get-todo' MCP tool

Create comprehensive test suite for the get-todo MCP tool. Test should cover:
- Fetching todo by ID
- Returning all todo metadata
- Error handling for invalid/non-existent todo IDs
- Verify data structure

Branch: `write-a-test-for-the-'get-todo'-mcp-tool`

## Notes

Test suite with 5 tests covering:
- Tool discovery and presence in tool list
- Tool invocation with todo ID parameter
- Fetching by name parameter
- Fetching by githubBranchName parameter
- Error handling for non-existent todo IDs (graceful response)
