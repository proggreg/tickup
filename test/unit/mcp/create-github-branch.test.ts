import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('create_github_branch MCP tool', () => {
    mcpTest('should list tools and find create_github_branch', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'create_github_branch');
        expect(tool).toBeDefined();
    });

    mcpTest('should call create_github_branch tool', async ({ client }) => {
        const result = await client.callTool({
            name: 'create_github_branch',
            arguments: {},
        });

        expect(result.content).toBeDefined();
    });
});
