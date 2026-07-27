import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

function parseContent(result: unknown): Record<string, unknown> {
    const contentArray = (result as Record<string, unknown>).content as {
        type: string;
        text?: string;
    }[];
    const textContent = contentArray.find(({ type }) => type === 'text');
    if (!textContent?.text) throw new Error('Text content expected');
    return JSON.parse(textContent.text);
}

describe('disconnect_vercel MCP tool', () => {
    mcpTest('is registered with no required input', async ({ client }) => {
        const { tools } = await client.listTools();
        const tool = tools.find(({ name }) => name === 'disconnect_vercel');

        expect(tool).toBeDefined();
        expect(tool?.description?.toLowerCase()).toContain('vercel');
    });

    mcpTest('clears the stored Vercel token for the signed-in user', async ({ client }) => {
        const result = await client.callTool({
            name: 'disconnect_vercel',
            arguments: {},
        });

        expect(parseContent(result)).toMatchObject({ success: true });
    });
});
