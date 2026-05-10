---
name: tickup-test-creation
description: Guidelines for creating comprehensive tests for tickup MCP tools
---

# Tickup Test Creation Skill

Guidelines for writing tests for MCP tools in the tickup project.

## General Requirements

1. **Use unique identifiers** - Each test run should use unique names/descriptions
   - Use `crypto.randomUUID().substring(0, 8)` for unique test data
   - Prevents test collision and data cleanup issues

2. **Create dependent objects** - Don't hardcode IDs
   - If testing with parent_id, create the parent task first
   - Extract ID from response and verify it's set correctly
   - Allows tests to run independently

3. **Verify expected state** - Check actual results
   - Verify no `isError` flag in response
   - Validate returned objects have expected fields
   - For relationships (parent_id), verify they're set correctly

4. **Error validation** - Test error cases
   - Test invalid parameters
   - Test missing required fields
   - Verify error messages are meaningful

## Example Pattern

```javascript
mcpTest('should create parent and link subtask', async ({ client }) => {
    const uniqueId = crypto.randomUUID().substring(0, 8);
    
    // 1. Create parent
    const parentRes = await client.callTool({
        name: 'create_todo',
        arguments: {
            name: `Parent ${uniqueId}`,
            description: 'Test parent',
        },
    });
    
    const parentId = (parentRes.content[0] as any).id;
    expect(parentId).toBeDefined();
    
    // 2. Create subtask with parent_id
    const subtaskRes = await client.callTool({
        name: 'create_todo',
        arguments: {
            name: `Subtask ${uniqueId}`,
            parent_id: String(parentId),
        },
    });
    
    const subtask = subtaskRes.content[0] as any;
    expect(subtask.parent_id).toBe(parentId);
});
```

## Testing Checklist

- [ ] Use unique IDs for test data
- [ ] Create parent objects if testing relationships
- [ ] Extract and verify IDs from responses
- [ ] Check for error flags in results
- [ ] Validate key fields in response objects
- [ ] Test both success and failure cases
- [ ] Verify relationships are set correctly
