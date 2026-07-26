import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

function parseTodos(result: unknown): Record<string, unknown>[] {
    const contentArray = (result as Record<string, unknown>).content as unknown[];
    const content = contentArray[0] as Record<string, unknown>;
    return JSON.parse(content.text as string);
}

describe('get_todos MCP tool', () => {
    mcpTest('returns empty array when user has no todos', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_todos',
            arguments: { today: true },
        });

        const todos = parseTodos(result);
        expect(Array.isArray(todos)).toBe(true);
        expect(todos).toHaveLength(0);
    });

    mcpTest(
        'returns created todo with correct structure including dueDate',
        async ({ client, createTodo }) => {
            const name = `test-todo-${crypto.randomUUID()}`;
            const dueDate = new Date();
            dueDate.setHours(12, 0, 0, 0);

            await createTodo({ name, dueDate: dueDate.toISOString() });

            const result = await client.callTool({
                name: 'get_todos',
                arguments: { today: true },
            });

            const todos = parseTodos(result);
            expect(Array.isArray(todos)).toBe(true);

            const found = todos.find((t) => t.name === name);
            expect(found).toBeDefined();
            expect(found).toMatchObject({
                id: expect.anything(),
                name,
                status: null,
                dueDate: expect.any(String),
            });
        },
    );

    mcpTest(
        'overdue filter returns empty array for new user with no overdue todos',
        async ({ client }) => {
            const result = await client.callTool({
                name: 'get_todos',
                arguments: { overdue: true },
            });

            const todos = parseTodos(result);
            expect(Array.isArray(todos)).toBe(true);
            expect(todos).toHaveLength(0);
        },
    );

    mcpTest('returns error content for invalid argument type', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_todos',
            arguments: { today: 'yes' as unknown as boolean },
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);

        const contentArray = result.content as unknown[];
        const content = contentArray[0] as Record<string, unknown>;
        const text = content.text as string;
        expect(text).toContain('invalid_type');
    });

    mcpTest(
        'userId param returns top-level todos for that user',
        async ({ client, userId, createTodo }) => {
            const name = `test-todo-${crypto.randomUUID()}`;
            await createTodo({ name });

            const result = await client.callTool({
                name: 'get_todos',
                arguments: { userId },
            });

            const todos = parseTodos(result);
            expect(Array.isArray(todos)).toBe(true);

            const found = todos.find((t) => t.name === name);
            expect(found).toBeDefined();
            expect(found).toMatchObject({
                id: expect.anything(),
                name,
                status: null,
            });
        },
    );
});
