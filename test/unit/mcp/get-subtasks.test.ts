import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('get_subtasks MCP tool', () => {
    mcpTest('should list tools and find get_subtasks', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'get_subtasks');
        expect(tool).toBeDefined();
        expect(tool?.description).toBeDefined();
    });

    mcpTest('should have correct tool input schema', async ({ client }) => {
        const result = await client.listTools();
        const tool = result.tools.find((t: { name: string }) => t.name === 'get_subtasks');

        expect(tool?.inputSchema).toBeDefined();
        const schema = tool?.inputSchema as Record<string, unknown>;

        expect(schema.properties).toBeDefined();
        const properties = schema.properties as Record<string, unknown>;
        expect(properties.id).toBeDefined();
    });

    mcpTest('should call get_subtasks tool without validation error', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_subtasks',
            arguments: {
                id: 'parent-todo-123',
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

    mcpTest('should return content with parent ID parameter', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_subtasks',
            arguments: {
                id: 'parent-todo-456',
            },
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        expect(content.length).toBeGreaterThan(0);
        const textContent = content[0] as Record<string, unknown>;
        expect(textContent.type).toBe('text');
    });

    mcpTest('should accept various parent ID formats', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_subtasks',
            arguments: {
                id: 'uuid-format-parent-id-789',
            },
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        const textContent = content[0] as Record<string, unknown>;
        const text = textContent.text as string;

        // Tool should accept the id parameter without validation error
        expect(text).not.toContain('Input validation error');
        expect(text).not.toContain('invalid_type');
    });

    mcpTest('should handle empty subtask list gracefully', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_subtasks',
            arguments: {
                id: 'parent-with-no-subtasks',
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

    mcpTest('should provide response for any parent ID', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_subtasks',
            arguments: {
                id: '999',
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
