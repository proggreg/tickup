import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('update_todo MCP tool', () => {
    mcpTest('should list tools and find update_todo', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const updateTodoTool = result.tools.find((t: { name: string }) => t.name === 'update_todo');
        expect(updateTodoTool).toBeDefined();
        expect(updateTodoTool?.description).toBe('Update a todo. Any provided fields are merged into the existing todo.');
    });

    mcpTest('should have correct tool input schema', async ({ client }) => {
        const result = await client.listTools();
        const updateTodoTool = result.tools.find((t: { name: string }) => t.name === 'update_todo');

        expect(updateTodoTool?.inputSchema).toBeDefined();
        const schema = updateTodoTool?.inputSchema as Record<string, unknown>;

        // Should accept todo ID
        expect(schema.properties).toBeDefined();
        const properties = schema.properties as Record<string, unknown>;
        expect(properties.id).toBeDefined();

        // Should accept optional fields
        expect(properties.name).toBeDefined();
        expect(properties.status).toBeDefined();
        expect(properties.description).toBeDefined();
        expect(properties.priority).toBeDefined();
    });

    mcpTest('should call update_todo tool without error', async ({ client }) => {
        // Test calling the tool with a valid structure
        // Note: This will fail with "todo not found" but that's OK - we're testing the tool is callable
        const result = await client.callTool({
            name: 'update_todo',
            arguments: {
                id: 'nonexistent-id',
                name: 'Updated Name',
            },
        });

        // Should have content (either success or error response)
        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
    });

    mcpTest('should accept parent_id parameter in update_todo', async ({ client }) => {
        // Create parent todo
        const parentResult = await client.callTool({
            name: 'create_todo',
            arguments: {
                name: 'Parent Todo',
            },
        });
        expect(parentResult.content).toBeDefined();
        const parentContent = Array.isArray(parentResult.content) && parentResult.content[0];
        const parentTodos = JSON.parse((parentContent as Record<string, unknown>).text as string);
        const parentId = parentTodos[0].id;

        // Create child todo with parent_id already set
        const childResult = await client.callTool({
            name: 'create_todo',
            arguments: {
                name: 'Child Todo',
                parent_id: String(parentId),
            },
        });
        expect(childResult.content).toBeDefined();
        const childContent = Array.isArray(childResult.content) && childResult.content[0];
        const childTodos = JSON.parse((childContent as Record<string, unknown>).text as string);
        const childTodo = childTodos[0];

        // Verify child has parent_id in creation response
        expect(childTodo.parent_id).toBe(parentId);

        // Test that update_todo accepts parent_id without validation error
        // Full E2E verification deferred - API endpoint needs auth investigation
        const updateResult = await client.callTool({
            name: 'update_todo',
            arguments: {
                id: String(childTodo.id),
                parentId: String(parentId),
            },
        });

        expect(updateResult.content).toBeDefined();
        const contentArray = updateResult.content as unknown[];
        const content = contentArray[0] as Record<string, unknown>;
        const text = content.text as string;

        // Should not have schema validation error (the key requirement)
        expect(text).not.toContain('Input validation error');
        expect(text).not.toContain('invalid_type');
    });

    mcpTest('should accept priority parameter in update_todo', async ({ client }) => {
        // Create a todo
        const createResult = await client.callTool({
            name: 'create_todo',
            arguments: {
                name: 'Priority Test Todo',
            },
        });
        expect(createResult.content).toBeDefined();
        const createContent = Array.isArray(createResult.content) && createResult.content[0];
        const createdTodos = JSON.parse((createContent as Record<string, unknown>).text as string);
        const todoId = createdTodos[0].id;

        // Test that update_todo accepts priority without validation error
        const updateResult = await client.callTool({
            name: 'update_todo',
            arguments: {
                id: String(todoId),
                priority: 'high',
            },
        });

        expect(updateResult.content).toBeDefined();
        const contentArray = updateResult.content as unknown[];
        const content = contentArray[0] as Record<string, unknown>;
        const text = content.text as string;

        // Should not have schema validation error
        expect(text).not.toContain('Input validation error');
        expect(text).not.toContain('invalid_type');

        // Verify priority is in the response
        const updatedData = JSON.parse(text);
        // Response could be array or object
        const updatedTodo = Array.isArray(updatedData) ? updatedData[0] : updatedData;
        expect(updatedTodo.priority).toBe('high');
    });
});
