import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('get_lists MCP tool', () => {
    mcpTest('should list tools and find get_lists', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const getListsTool = result.tools.find((t: { name: string }) => t.name === 'get_lists');
        expect(getListsTool).toBeDefined();
        expect(getListsTool?.description).toBe('Get all lists for the signed-in user');
    });

    mcpTest('should have correct tool input schema', async ({ client }) => {
        const result = await client.listTools();
        const getListsTool = result.tools.find((t: { name: string }) => t.name === 'get_lists');

        expect(getListsTool?.inputSchema).toBeDefined();
        const schema = getListsTool?.inputSchema as Record<string, unknown>;
        // Should have properties field (even if empty for no-arg tool)
        expect(schema.properties).toBeDefined();
    });

    mcpTest('should call get_lists tool and return array', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_lists',
            arguments: {},
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);

        const content = result.content as unknown[];
        expect(content.length).toBeGreaterThan(0);
        const textContent = content[0] as Record<string, unknown>;
        expect(textContent.type).toBe('text');
    });

    mcpTest('should return JSON array of lists', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_lists',
            arguments: {},
        });

        const content = result.content as unknown[];
        const textContent = content[0] as Record<string, unknown>;
        const text = textContent.text as string;

        // Response should be parseable as JSON array
        const lists = JSON.parse(text);
        expect(Array.isArray(lists)).toBe(true);
    });

    mcpTest('should return lists with proper structure', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_lists',
            arguments: {},
        });

        const content = result.content as unknown[];
        const textContent = content[0] as Record<string, unknown>;
        const text = textContent.text as string;
        const lists = JSON.parse(text);

        // Each list should have basic properties
        if (lists.length > 0) {
            const firstList = lists[0] as Record<string, unknown>;
            expect(firstList.id).toBeDefined();
            expect(firstList.name).toBeDefined();
        }
    });

    mcpTest('should handle empty lists scenario', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_lists',
            arguments: {},
        });

        const content = result.content as unknown[];
        const textContent = content[0] as Record<string, unknown>;
        const text = textContent.text as string;

        // Should parse successfully even if empty
        const lists = JSON.parse(text);
        expect(Array.isArray(lists)).toBe(true);
        expect(lists.length).toBeGreaterThanOrEqual(0);
    });
});
