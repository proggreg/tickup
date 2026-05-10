import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';
import { apiTest } from '../fixtures/api';

describe('get_todo MCP tool', () => {
    mcpTest('should list tools and find get_todo', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'get_todo');
        expect(tool).toBeDefined();
    });

    mcpTest('should call get_todo tool', async ({ client, createTodo }) => {
        const newTodo = await createTodo({
            name: 'test',
        });

        const result = await client.callTool({
            name: 'get_todo',
            arguments: {
                id: String(newTodo.id),
            },
        });

        const text = result.content[0].text;

        expect(text).toContain(newTodo.id);
        expect(text).toContain(newTodo.name);
    });
});
