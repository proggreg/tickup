import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('get_subtasks MCP tool', () => {
    mcpTest('should list tools and find get_subtasks', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'get_subtasks');
        expect(tool).toBeDefined();
    });

    mcpTest('should call get_subtasks tool', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_subtasks',
            arguments: {},
        });

        expect(result.content).toBeDefined();
    });
});
