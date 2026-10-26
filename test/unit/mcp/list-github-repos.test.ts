import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('list_github_repos MCP tool', () => {
    mcpTest('should list tools and find list_github_repos', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'list_github_repos');
        expect(tool).toBeDefined();
        expect(tool?.description).toBe(
            "List repositories accessible to the user's GitHub App installation",
        );
    });

    mcpTest('should have input schema with properties field', async ({ client }) => {
        const result = await client.listTools();
        const tool = result.tools.find((t: { name: string }) => t.name === 'list_github_repos');

        expect(tool?.inputSchema).toBeDefined();
        const schema = tool?.inputSchema as Record<string, unknown>;
        expect(schema.properties).toBeDefined();
    });

    mcpTest('should call list_github_repos and return content array', async ({ client }) => {
        const result = await client.callTool({
            name: 'list_github_repos',
            arguments: {},
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);

        const content = result.content as unknown[];
        expect(content.length).toBeGreaterThan(0);

        const textContent = content[0] as Record<string, unknown>;
        expect(textContent.type).toBe('text');
    });

    mcpTest('should not return a validation error', async ({ client }) => {
        const result = await client.callTool({
            name: 'list_github_repos',
            arguments: {},
        });

        const content = result.content as unknown[];
        const textContent = content[0] as Record<string, unknown>;
        const text = textContent.text as string;

        expect(text).not.toContain('Input validation error');
        expect(text).not.toContain('invalid_type');
    });
});
