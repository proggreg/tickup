import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('get_url_metadata MCP tool', () => {
    mcpTest('should list tools and find get_url_metadata', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'get_url_metadata');
        expect(tool).toBeDefined();
    });

    mcpTest('should call get_url_metadata tool', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_url_metadata',
            arguments: {},
        });

        expect(result.content).toBeDefined();
    });
});
