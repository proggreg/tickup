import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';
import { randomUUID } from 'crypto';

describe('get_list MCP tool', () => {
    mcpTest('should list tools and find get_list', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'get_list');
        expect(tool).toBeDefined();
        expect(tool?.description).toBeDefined();
    });

    mcpTest('should have correct tool input schema', async ({ client }) => {
        const result = await client.listTools();
        const tool = result.tools.find((t: { name: string }) => t.name === 'get_list');

        expect(tool?.inputSchema).toBeDefined();
        const schema = tool?.inputSchema as Record<string, unknown>;

        expect(schema.properties).toBeDefined();
        const properties = schema.properties as Record<string, unknown>;
        expect(properties.id).toBeDefined();
    });

    mcpTest('should call get_list tool without validation error', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_list',
            arguments: {
                id: 'test-list-123',
            },
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);

        const content = result.content as unknown[];
        const textContent = content[0] as Record<string, unknown>;

        // Should not have schema validation error
        expect(textContent.type).toBe('text');
        const text = textContent.text as string;
        expect(text).not.toContain('Input validation error');
        expect(text).not.toContain('invalid_type');
    });

    mcpTest('should handle list ID parameter correctly', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_list',
            arguments: {
                id: '999',
            },
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        expect(Array.isArray(content)).toBe(true);
        expect(content.length).toBeGreaterThan(0);
    });

    mcpTest('should accept various ID formats', async ({ client }) => {
        // Test with different ID formats
        const result = await client.callTool({
            name: 'get_list',
            arguments: {
                id: 'uuid-string-format-123',
            },
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        const textContent = content[0] as Record<string, unknown>;
        const text = textContent.text as string;

        // Tool should accept the ID parameter
        expect(text).not.toContain('Input validation error');
    });

    mcpTest('should get a list with a todo', async ({ client, createList, createTodo }) => {
        // Test with different ID formats
        const listName = `List ${randomUUID()}`;
        const list = await createList({
            name: listName,
        });

        const todo = await createTodo({
            name: `Todo ${listName}`,
            list_id: list.id,
        });
        const result = await client.callTool({
            name: 'get_list',
            arguments: {
                id: list.id.toString(),
            },
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        const textContent = content[0] as Record<string, unknown>;
        const text = textContent.text as string;

        const json = JSON.parse(text);
        const todos = json.todos;
        expect(todos.length).toBe(1);

        // Tool should accept the ID parameter
        expect(text).not.toContain('Input validation error');
    });
});
