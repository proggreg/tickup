import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('get_list_todos MCP tool', () => {
    mcpTest('should list tools and find get_list_todos', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'get_list_todos');
        expect(tool).toBeDefined();
        expect(tool?.description).toBeDefined();
    });

    mcpTest('should have correct tool input schema', async ({ client }) => {
        const result = await client.listTools();
        const tool = result.tools.find((t: { name: string }) => t.name === 'get_list_todos');

        expect(tool?.inputSchema).toBeDefined();
        const schema = tool?.inputSchema as Record<string, unknown>;

        expect(schema.properties).toBeDefined();
        const properties = schema.properties as Record<string, unknown>;
        expect(properties.listId).toBeDefined();
    });

    mcpTest('should call get_list_todos tool without validation error', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_list_todos',
            arguments: {
                listId: 'test-list-id-123',
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

    mcpTest('should return content with list ID parameter', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_list_todos',
            arguments: {
                listId: 'test-list-123',
            },
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        expect(content.length).toBeGreaterThan(0);
        const textContent = content[0] as Record<string, unknown>;
        expect(textContent.type).toBe('text');
    });

    mcpTest('should accept various list ID formats', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_list_todos',
            arguments: {
                listId: 'uuid-format-list-123',
            },
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        const textContent = content[0] as Record<string, unknown>;
        const text = textContent.text as string;

        // Tool should accept the listId parameter without validation error
        expect(text).not.toContain('Input validation error');
        expect(text).not.toContain('invalid_type');
    });

    mcpTest('should handle empty list gracefully', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_list_todos',
            arguments: {
                listId: 'empty-list-123',
            },
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        expect(Array.isArray(content)).toBe(true);
        expect(content.length).toBeGreaterThan(0);

        // Response should be text type
        const textContent = content[0] as Record<string, unknown>;
        expect(textContent.type).toBe('text');
    });

    mcpTest('should provide response for any list ID', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_list_todos',
            arguments: {
                listId: '999',
            },
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        expect(Array.isArray(content)).toBe(true);
        expect(content.length).toBeGreaterThan(0);

        // Response should have valid content type
        const textContent = content[0] as Record<string, unknown>;
        expect(textContent.type).toBe('text');
    });
});
