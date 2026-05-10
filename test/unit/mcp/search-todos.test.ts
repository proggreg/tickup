import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('search_todos MCP tool', () => {
    mcpTest('should list tools and find search_todos', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const searchTodosTool = result.tools.find(
            (t: { name: string }) => t.name === 'search_todos',
        );
        expect(searchTodosTool).toBeDefined();
        expect(searchTodosTool?.description).toBe(
            'Search todos by name (case-insensitive substring match)',
        );
    });

    mcpTest('should have correct tool input schema', async ({ client }) => {
        const result = await client.listTools();
        const searchTodosTool = result.tools.find(
            (t: { name: string }) => t.name === 'search_todos',
        );

        expect(searchTodosTool?.inputSchema).toBeDefined();
        const schema = searchTodosTool?.inputSchema as Record<string, unknown>;

        // Should accept query parameter
        expect(schema.properties).toBeDefined();
        const properties = schema.properties as Record<string, unknown>;
        expect(properties.query).toBeDefined();
    });

    mcpTest('should call search_todos tool without validation error', async ({ client }) => {
        // Test that search_todos accepts query parameter and doesn't throw validation error
        const searchResult = await client.callTool({
            name: 'search_todos',
            arguments: {
                query: 'test search',
            },
        });

        expect(searchResult.content).toBeDefined();
        expect(Array.isArray(searchResult.content)).toBe(true);

        const contentArray = searchResult.content as unknown[];
        const content = contentArray[0] as Record<string, unknown>;
        const text = content.text as string;

        // Should not have schema validation error
        expect(text).not.toContain('Input validation error');
        expect(text).not.toContain('invalid_type');
    });
});
