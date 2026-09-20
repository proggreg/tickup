import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('list_vercel_projects MCP tool', () => {
    mcpTest('is registered with no required input', async ({ client }) => {
        const { tools } = await client.listTools();
        const tool = tools.find(({ name }) => name === 'list_vercel_projects');

        expect(tool).toBeDefined();
        expect(tool?.description?.toLowerCase()).toContain('vercel');
    });

    mcpTest('returns an error when Vercel is not connected', async ({ client }) => {
        const result = await client.callTool({
            name: 'list_vercel_projects',
            arguments: {},
        });

        const content = result.content as { type: string; text?: string }[];
        const textContent = content.find(({ type }) => type === 'text');
        expect(textContent?.text).toBeDefined();
        expect(textContent!.text!.toLowerCase()).toMatch(/not connected|error/);
    });
});
