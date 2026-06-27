import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('reorder_list_todos MCP tool', () => {
    mcpTest('should list tools and find reorder_list_todos', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'reorder_list_todos');
        expect(tool).toBeDefined();
        expect(tool?.description).toBeDefined();
    });

    mcpTest('should have correct tool input schema', async ({ client }) => {
        const result = await client.listTools();
        const tool = result.tools.find((t: { name: string }) => t.name === 'reorder_list_todos');

        expect(tool?.inputSchema).toBeDefined();
        const schema = tool?.inputSchema as Record<string, unknown>;

        expect(schema.properties).toBeDefined();
        const properties = schema.properties as Record<string, unknown>;
        expect(properties.orderedItems).toBeDefined();
    });

    mcpTest('should call reorder_list_todos tool without validation error', async ({ client }) => {
        const result = await client.callTool({
            name: 'reorder_list_todos',
            arguments: {
                orderedItems: [
                    { _id: 'todo-1', order: 1 },
                    { _id: 'todo-2', order: 2 },
                ],
            },
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);

        const content = result.content as unknown[];
        const textContent = content[0] as Record<string, unknown>;

        // Should not have validation errors
        const text = textContent.text as string;
        expect(text).not.toContain('Input validation error');
        expect(text).not.toContain('invalid_type');
    });

    mcpTest('should accept ordered items array', async ({ client }) => {
        const result = await client.callTool({
            name: 'reorder_list_todos',
            arguments: {
                orderedItems: [
                    { _id: 'todo-1', order: 10 },
                    { _id: 'todo-2', order: 20 },
                    { _id: 'todo-3', order: 30 },
                ],
            },
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        expect(content.length).toBeGreaterThan(0);
        const textContent = content[0] as Record<string, unknown>;
        expect(textContent.type).toBe('text');
    });

    mcpTest('should handle various order value formats', async ({ client }) => {
        const result = await client.callTool({
            name: 'reorder_list_todos',
            arguments: {
                orderedItems: [
                    { _id: 'item-1', order: 100 },
                    { _id: 'item-2', order: 200 },
                ],
            },
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        const textContent = content[0] as Record<string, unknown>;
        const text = textContent.text as string;

        // Should accept order values
        expect(text).not.toContain('Input validation error');
    });

    mcpTest('should provide response for reorder operation', async ({ client }) => {
        const result = await client.callTool({
            name: 'reorder_list_todos',
            arguments: {
                orderedItems: [
                    { _id: 'a', order: 1 },
                    { _id: 'b', order: 2 },
                ],
            },
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        expect(Array.isArray(content)).toBe(true);
        expect(content.length).toBeGreaterThan(0);

        const textContent = content[0] as Record<string, unknown>;
        expect(textContent.type).toBe('text');
    });

    mcpTest('should handle multiple items in ordered array', async ({ client }) => {
        const result = await client.callTool({
            name: 'reorder_list_todos',
            arguments: {
                orderedItems: [
                    { _id: 'todo-1', order: 1 },
                    { _id: 'todo-2', order: 2 },
                    { _id: 'todo-3', order: 3 },
                    { _id: 'todo-4', order: 4 },
                    { _id: 'todo-5', order: 5 },
                ],
            },
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        expect(content.length).toBeGreaterThan(0);

        const textContent = content[0] as Record<string, unknown>;
        expect(textContent.type).toBe('text');
    });
});
