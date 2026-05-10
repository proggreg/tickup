import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('update_list MCP tool', () => {
    mcpTest('should list tools and find update_list', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'update_list');
        expect(tool).toBeDefined();
        expect(tool?.description).toBeDefined();
    });

    mcpTest('should have correct tool input schema', async ({ client }) => {
        const result = await client.listTools();
        const tool = result.tools.find((t: { name: string }) => t.name === 'update_list');

        expect(tool?.inputSchema).toBeDefined();
        const schema = tool?.inputSchema as Record<string, unknown>;

        expect(schema.properties).toBeDefined();
        const properties = schema.properties as Record<string, unknown>;
        expect(properties.id).toBeDefined();
    });

    mcpTest('should call update_list tool without validation error', async ({ client }) => {
        const result = await client.callTool({
            name: 'update_list',
            arguments: {
                id: 'test-list-id',
                name: 'Updated List Name',
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

    mcpTest('should accept list ID and update fields', async ({ client }) => {
        const result = await client.callTool({
            name: 'update_list',
            arguments: {
                id: 'list-123',
                name: 'New Name',
            },
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        expect(content.length).toBeGreaterThan(0);
        const textContent = content[0] as Record<string, unknown>;
        expect(textContent.type).toBe('text');
    });

    mcpTest('should handle partial updates', async ({ client }) => {
        const result = await client.callTool({
            name: 'update_list',
            arguments: {
                id: 'list-456',
                name: 'Updated Name Only',
            },
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        const textContent = content[0] as Record<string, unknown>;
        const text = textContent.text as string;

        // Should accept partial update
        expect(text).not.toContain('Input validation error');
    });

    mcpTest('should accept various update field combinations', async ({ client }) => {
        const result = await client.callTool({
            name: 'update_list',
            arguments: {
                id: 'list-789',
                name: 'Updated List',
                githubRepo: 'owner/repo',
                listType: 'project',
            },
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        expect(Array.isArray(content)).toBe(true);
        expect(content.length).toBeGreaterThan(0);

        const textContent = content[0] as Record<string, unknown>;
        expect(textContent.type).toBe('text');
    });

    mcpTest('should provide response for list update', async ({ client }) => {
        const result = await client.callTool({
            name: 'update_list',
            arguments: {
                id: '999',
                name: 'Test Update',
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
