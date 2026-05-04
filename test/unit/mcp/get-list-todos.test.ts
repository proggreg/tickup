import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('get_list_todos MCP tool', () => {
    mcpTest('should list tools and find get_list_todos', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'get_list_todos');
        expect(tool).toBeDefined();
    });

    mcpTest('should call get_list_todos tool', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_list_todos',
            arguments: {},
        });

        expect(result.content).toBeDefined();
    });
});
