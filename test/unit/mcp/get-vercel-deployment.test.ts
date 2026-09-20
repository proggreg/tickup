import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('get_vercel_deployment MCP tool', () => {
    mcpTest('is registered with a required projectId input', async ({ client }) => {
        const { tools } = await client.listTools();
        const tool = tools.find(({ name }) => name === 'get_vercel_deployment');

        expect(tool).toBeDefined();
        expect(tool?.description?.toLowerCase()).toContain('vercel');
        expect(tool?.inputSchema.required).toContain('projectId');
    });

    mcpTest('returns an error when Vercel is not connected', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_vercel_deployment',
            arguments: { projectId: 'prj_test123' },
        });

        const content = result.content as { type: string; text?: string }[];
        const textContent = content.find(({ type }) => type === 'text');
        expect(textContent?.text).toBeDefined();
        expect(textContent!.text!.toLowerCase()).toMatch(/not connected|error/);
    });
});
