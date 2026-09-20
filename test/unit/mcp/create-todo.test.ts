import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

function parseToolContent(result: unknown): unknown {
    const items = (result as Record<string, unknown>).content as Record<string, unknown>[];
    return JSON.parse(items[0].text as string);
}

function firstItem(result: unknown): Record<string, unknown> {
    const parsed = parseToolContent(result);
    return Array.isArray(parsed) ? parsed[0] : (parsed as Record<string, unknown>);
}

describe('create_todo MCP tool', () => {
    mcpTest('should list tools and find create_todo', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'create_todo');
        expect(tool).toBeDefined();
    });

    mcpTest('should have correct tool input schema', async ({ client }) => {
        const result = await client.listTools();
        const tool = result.tools.find((t: { name: string }) => t.name === 'create_todo');

        expect(tool?.inputSchema).toBeDefined();
        const schema = tool?.inputSchema as Record<string, unknown>;

        expect(schema.properties).toBeDefined();
        const properties = schema.properties as Record<string, unknown>;
        expect(properties.name).toBeDefined();
        expect(properties.list_id).toBeDefined();
        expect(properties.description).toBeDefined();
        expect(properties.parent_id).toBeDefined();
    });

    mcpTest('should create todo with required name field', async ({ client }) => {
        const result = await client.callTool({
            name: 'create_todo',
            arguments: {
                name: 'Test Todo Required',
            },
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);

        const todo = firstItem(result);
        expect(todo.name).toBe('Test Todo Required');
        expect(todo.id).toBeDefined();
    });

    mcpTest('should create todo with description field', async ({ client }) => {
        const result = await client.callTool({
            name: 'create_todo',
            arguments: {
                name: 'Build tickup development workflow',
                description:
                    'Create workflow that searches tickup tasks and selects corresponding skills',
            },
        });

        expect(result.content).toBeDefined();
        const todo = firstItem(result);
        expect(todo.desc).toBe(
            'Create workflow that searches tickup tasks and selects corresponding skills',
        );
    });

    mcpTest('should create todo with due_date field', async ({ client }) => {
        const result = await client.callTool({
            name: 'create_todo',
            arguments: {
                name: 'Task with due date',
                due_date: '2026-06-15',
            },
        });

        expect(result.content).toBeDefined();
        const todo = firstItem(result);
        // due_date is returned as ISO timestamp
        expect(todo.due_date).toBeDefined();
        expect(String(todo.due_date)).toContain('2026-06-15');
    });

    mcpTest('should create todo with priority_lev parameter', async ({ client }) => {
        const result = await client.callTool({
            name: 'create_todo',
            arguments: {
                name: 'High priority task',
                priority_lev: 'high',
            },
        });

        expect(result.content).toBeDefined();
        const text = (result.content as Record<string, unknown>[])[0].text as string;
        // Verify tool accepts parameter without validation error
        expect(text).not.toContain('Input validation error');
        expect(text).not.toContain('invalid_type');
        const todo = firstItem(result);
        expect(todo.id).toBeDefined();
    });

    mcpTest('should create parent task and subtask with unique names', async ({ client }) => {
        const uniqueId = crypto.randomUUID().substring(0, 8);

        // Create parent task
        const parentResult = await client.callTool({
            name: 'create_todo',
            arguments: {
                name: `Test Parent Task ${uniqueId}`,
                description: 'Parent task for testing subtask creation',
            },
        });

        expect(parentResult.content).toBeDefined();
        const parentTodo = firstItem(parentResult);
        const parentId = parentTodo.id;

        // Create subtask under parent
        const subtaskResult = await client.callTool({
            name: 'create_todo',
            arguments: {
                name: `Test Subtask ${uniqueId}`,
                description: 'Subtask created for testing parent_id parameter',
                parent_id: String(parentId),
            },
        });

        expect(subtaskResult.content).toBeDefined();
        const subtask = firstItem(subtaskResult);

        // Verify subtask created with parent_id set
        expect(subtask.parent_id).toBe(parentId);
    });

    mcpTest('should accept multiple optional fields together', async ({ client }) => {
        const result = await client.callTool({
            name: 'create_todo',
            arguments: {
                name: 'Complex todo',
                description: 'Todo with multiple optional fields',
                due_date: '2026-07-20',
                priority_lev: 'medium',
            },
        });

        expect(result.content).toBeDefined();
        const text = (result.content as Record<string, unknown>[])[0].text as string;
        expect(text).not.toContain('Input validation error');
        const todo = firstItem(result);
        expect(todo.name).toBe('Complex todo');
        expect(todo.desc).toBe('Todo with multiple optional fields');
        expect(todo.due_date).toBeDefined();
        expect(String(todo.due_date)).toContain('2026-07-20');
    });
});
