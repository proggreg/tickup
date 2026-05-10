import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('delete_list MCP tool', () => {
    mcpTest('should list tools and find delete_list', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'delete_list');
        expect(tool).toBeDefined();
        expect(tool?.description).toBeDefined();
    });

    mcpTest('should have correct tool input schema', async ({ client }) => {
        const result = await client.listTools();
        const tool = result.tools.find((t: { name: string }) => t.name === 'delete_list');

        expect(tool?.inputSchema).toBeDefined();
        const schema = tool?.inputSchema as Record<string, unknown>;

        expect(schema.properties).toBeDefined();
        const properties = schema.properties as Record<string, unknown>;
        expect(properties.id).toBeDefined();
    });

    mcpTest('should call delete_list tool with ID parameter', async ({ client }) => {
        const result = await client.callTool({
            name: 'delete_list',
            arguments: {
                id: 'test-list-id-123',
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

    mcpTest('should accept various ID formats', async ({ client }) => {
        const result = await client.callTool({
            name: 'delete_list',
            arguments: {
                id: 'uuid-format-string-12345',
            },
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        expect(content.length).toBeGreaterThan(0);
        expect((content[0] as Record<string, unknown>).type).toBe('text');
    });

    mcpTest('should handle deletion response gracefully', async ({ client }) => {
        const result = await client.callTool({
            name: 'delete_list',
            arguments: {
                id: '999',
            },
        });

        const content = result.content as unknown[];
        const textContent = content[0] as Record<string, unknown>;
        const text = textContent.text as string;

        // Response should be valid JSON or error message
        expect(text).toBeDefined();
        expect(text.length).toBeGreaterThan(0);
    });

    mcpTest('should handle non-existent list ID', async ({ client }) => {
        const result = await client.callTool({
            name: 'delete_list',
            arguments: {
                id: 'non-existent-list-id',
            },
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        const textContent = content[0] as Record<string, unknown>;

        // Tool should handle gracefully without crashing
        expect(textContent.type).toBe('text');
        expect(result.isError).not.toBe(true);
    });
});
