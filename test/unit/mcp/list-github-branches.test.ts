import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('list_github_branches MCP tool', () => {
    mcpTest('should list tools and find list_github_branches', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'list_github_branches');
        expect(tool).toBeDefined();
        expect(tool?.description).toBe('List all branches for a GitHub repository');
    });

    mcpTest('should have correct input schema', async ({ client }) => {
        const result = await client.listTools();
        const tool = result.tools.find((t: { name: string }) => t.name === 'list_github_branches');

        expect(tool?.inputSchema).toBeDefined();
        const schema = tool?.inputSchema as Record<string, unknown>;
        expect(schema.properties).toBeDefined();

        const properties = schema.properties as Record<string, unknown>;
        expect(properties.owner).toBeDefined();
        expect(properties.repo).toBeDefined();
    });

    mcpTest('should require owner and repo fields', async ({ client }) => {
        const result = await client.listTools();
        const tool = result.tools.find((t: { name: string }) => t.name === 'list_github_branches');

        const schema = tool?.inputSchema as Record<string, unknown>;
        const required = schema.required as string[];
        expect(required).toContain('owner');
        expect(required).toContain('repo');
    });

    mcpTest('should return content array when called with valid arguments', async ({ client }) => {
        const result = await client.callTool({
            name: 'list_github_branches',
            arguments: {
                owner: 'proggreg',
                repo: 'tickup',
            },
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);

        const content = result.content as unknown[];
        expect(content.length).toBeGreaterThan(0);

        const textContent = content[0] as Record<string, unknown>;
        expect(textContent.type).toBe('text');

        // No schema validation error — tool accepted the input structure
        const text = textContent.text as string;
        expect(text).not.toContain('Input validation error');
        expect(text).not.toContain('invalid_type');
    });
});
