import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('create_github_branch MCP tool', () => {
    mcpTest('should list tools and find create_github_branch', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'create_github_branch');
        expect(tool).toBeDefined();
        expect(tool?.description).toBe(
            'Create a new branch in a GitHub repository. If the branch already exists it is returned as-is.',
        );
    });

    mcpTest('should have correct input schema', async ({ client }) => {
        const result = await client.listTools();
        const tool = result.tools.find((t: { name: string }) => t.name === 'create_github_branch');

        expect(tool?.inputSchema).toBeDefined();
        const schema = tool?.inputSchema as Record<string, unknown>;
        expect(schema.properties).toBeDefined();

        const properties = schema.properties as Record<string, unknown>;
        expect(properties.branchName).toBeDefined();
        expect(properties.repo).toBeDefined();
        expect(properties.sha).toBeDefined();
    });

    mcpTest('should require branchName and repo fields', async ({ client }) => {
        const result = await client.listTools();
        const tool = result.tools.find((t: { name: string }) => t.name === 'create_github_branch');

        const schema = tool?.inputSchema as Record<string, unknown>;
        const required = schema.required as string[];
        expect(required).toContain('branchName');
        expect(required).toContain('repo');
    });

    mcpTest('should return content array when called with valid arguments', async ({ client }) => {
        const result = await client.callTool({
            name: 'create_github_branch',
            arguments: {
                branchName: 'test-branch',
                repo: {
                    name: 'tickup',
                    full_name: 'proggreg/tickup',
                    default_branch: 'main',
                },
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
