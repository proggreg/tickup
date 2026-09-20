---
Status: done
taskId: 2129
title: Write a test for the 'create-todo' MCP tool
priority: high
completed: 2026-05-10
---

# Write a test for the 'create-todo' MCP tool

Create comprehensive test suite for the create-todo MCP tool. Test should cover:
- Creating todo with required fields (name, list_id)
- Creating todo with optional fields (description, due_date, priority)
- Parent task and subtask creation
- Validation of input
- Error handling for invalid input
- Verify todo is properly stored

Branch: `write-a-test-for-the-'create-todo'-mcp-tool`

## Notes

Test suite expanded to 7 passing tests covering:
- Tool discovery and correct description
- Input schema validation (name, list_id, description, parent_id fields present)
- Tool invocation with required name field
- Optional field handling: description, due_date, priority_lev
- Parent task and subtask creation with parent_id parameter
- Multiple optional fields together
- Response structure verification with proper field mapping (desc, priority_lev)
