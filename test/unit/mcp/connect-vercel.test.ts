import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('connect_vercel MCP tool', () => {
    mcpTest('is registered with a code input', async ({ client }) => {
        const { tools } = await client.listTools();
        const tool = tools.find(({ name }) => name === 'connect_vercel');

        expect(tool).toBeDefined();
        expect(tool?.description?.toLowerCase()).toContain('vercel');
        expect(tool?.inputSchema.required).toContain('code');
    });

    mcpTest('rejects a call missing the required code', async ({ client }) => {
        const result = await client.callTool({
            name: 'connect_vercel',
            arguments: {},
        });

        expect(result.isError).toBeTruthy();
    });
});
