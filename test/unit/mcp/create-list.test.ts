import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('create_list MCP tool', () => {
    mcpTest('should list tools and find create_list', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'create_list');
        expect(tool).toBeDefined();
    });

    mcpTest('should call create_list tool', async ({ client }) => {
        const result = await client.callTool({
            name: 'create_list',
            arguments: {},
        });

        expect(result.content).toBeDefined();
    });
});
