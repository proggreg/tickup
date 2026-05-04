import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('list_github_repos MCP tool', () => {
    mcpTest('should list tools and find list_github_repos', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'list_github_repos');
        expect(tool).toBeDefined();
    });

    mcpTest('should call list_github_repos tool', async ({ client }) => {
        const result = await client.callTool({
            name: 'list_github_repos',
            arguments: {},
        });

        expect(result.content).toBeDefined();
    });
});
