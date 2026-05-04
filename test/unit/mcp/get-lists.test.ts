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

    mcpTest('should call get_lists tool', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_lists',
            arguments: {},
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
    });
});
