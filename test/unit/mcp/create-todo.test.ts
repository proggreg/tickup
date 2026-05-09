import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('create_todo MCP tool', () => {
    mcpTest('should list tools and find create_todo', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'create_todo');
        expect(tool).toBeDefined();
    });

    mcpTest('should call create_todo tool', async ({ client }) => {
        const result = await client.callTool({
            name: 'create_todo',
            arguments: {},
        });

        expect(result.content).toBeDefined();
    });

    mcpTest('should create todo with name and description', async ({ client }) => {
        const result = await client.callTool({
            name: 'create_todo',
            arguments: {
                name: 'Build tickup development workflow',
                description:
                    'Create workflow that searches tickup tasks and selects corresponding skills',
            },
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);

        const content = result.content as unknown[];
        const text = content[0] as Record<string, unknown>;

        // Should not have error
        expect(text.isError).not.toBe(true);
    });

    mcpTest('should create todo with parent_id for subtask', async ({ client }) => {
        const result = await client.callTool({
            name: 'create_todo',
            arguments: {
                name: 'Build tickup development workflow',
                description: 'Create workflow that searches tickup tasks',
                parent_id: '2108',
            },
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);

        const content = result.content as unknown[];
        const text = content[0] as Record<string, unknown>;

        // Should not have error
        expect(text.isError).not.toBe(true);
    });
});
