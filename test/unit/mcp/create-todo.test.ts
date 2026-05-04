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
});
