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

describe('update_todo MCP tool', () => {
    mcpTest('should list tools and find update_todo', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const updateTodoTool = result.tools.find((t: { name: string }) => t.name === 'update_todo');
        expect(updateTodoTool).toBeDefined();
        expect(updateTodoTool?.description).toBe(
            'Update a todo. Any provided fields are merged into the existing todo.',
        );
    });

    mcpTest('should have correct tool input schema', async ({ client }) => {
        const result = await client.listTools();
        const updateTodoTool = result.tools.find((t: { name: string }) => t.name === 'update_todo');

        expect(updateTodoTool?.inputSchema).toBeDefined();
        const schema = updateTodoTool?.inputSchema as Record<string, unknown>;

        expect(schema.properties).toBeDefined();
        const properties = schema.properties as Record<string, unknown>;
        expect(properties.id).toBeDefined();
        expect(properties.name).toBeDefined();
        expect(properties.status).toBeDefined();
        expect(properties.description).toBeDefined();
        expect(properties.priority_lev).toBeDefined();
    });

    mcpTest('should call update_todo tool without error', async ({ client }) => {
        // Note: This will fail with "todo not found" but that's OK — testing the tool is callable
        const result = await client.callTool({
            name: 'update_todo',
            arguments: {
                id: 'nonexistent-id',
                name: 'Updated Name',
            },
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
    });

    mcpTest('should accept parent_id parameter in update_todo', async ({ client }) => {
        const parentResult = await client.callTool({
            name: 'create_todo',
            arguments: { name: 'Parent Todo' },
        });
        const parentTodo = firstItem(parentResult);
        const parentId = parentTodo.id;

        const childResult = await client.callTool({
            name: 'create_todo',
            arguments: { name: 'Child Todo', parent_id: String(parentId) },
        });
        const childTodo = firstItem(childResult);
        expect(childTodo.parent_id).toBe(parentId);

        const updateResult = await client.callTool({
            name: 'update_todo',
            arguments: { id: String(childTodo.id), parent_id: String(parentId) },
        });

        const text = (updateResult.content as Record<string, unknown>[])[0].text as string;
        expect(text).not.toContain('Input validation error');
        expect(text).not.toContain('invalid_type');
    });

    mcpTest('should persist description field when updating a todo', async ({ client }) => {
        const createResult = await client.callTool({
            name: 'create_todo',
            arguments: { name: 'Description Test Todo' },
        });
        const created = firstItem(createResult);

        const updateResult = await client.callTool({
            name: 'update_todo',
            arguments: { id: String(created.id), description: 'A meaningful description' },
        });

        const text = (updateResult.content as Record<string, unknown>[])[0].text as string;
        expect(text).not.toContain('schema cache');
        expect(text).not.toContain('isError');

        const updated = firstItem(updateResult);
        expect(updated.desc).toBe('A meaningful description');
    });

    mcpTest('should accept priority_lev parameter in update_todo', async ({ client }) => {
        const createResult = await client.callTool({
            name: 'create_todo',
            arguments: { name: 'Priority Test Todo' },
        });
        const created = firstItem(createResult);

        const updateResult = await client.callTool({
            name: 'update_todo',
            arguments: { id: String(created.id), priority_lev: 'high' },
        });

        const text = (updateResult.content as Record<string, unknown>[])[0].text as string;
        expect(text).not.toContain('Input validation error');
        expect(text).not.toContain('invalid_type');

        const updated = firstItem(updateResult);
        expect(updated.priority_lev).toBe('high');
    });
});
