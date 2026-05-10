import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('get_subtasks MCP tool', () => {
    mcpTest('should list tools and find get_subtasks', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'get_subtasks');
        expect(tool).toBeDefined();
        expect(tool?.description).toBe('Get the subtasks (child todos) of a todo');
    });

    mcpTest('should have correct tool input schema', async ({ client }) => {
        const result = await client.listTools();
        const tool = result.tools.find((t: { name: string }) => t.name === 'get_subtasks');

        expect(tool?.inputSchema).toBeDefined();
        const schema = tool?.inputSchema as Record<string, unknown>;

        expect(schema.properties).toBeDefined();
        const properties = schema.properties as Record<string, unknown>;
        expect(properties.id).toBeDefined();
    });

    mcpTest('should call get_subtasks with parent ID and return array', async ({ client }) => {
        // Create parent todo via API
        const parentCreateRes = await fetch('http://localhost:3000/api/todo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Parent Todo' }),
        });
        expect(parentCreateRes.ok).toBe(true);
        const parentTodo = await parentCreateRes.json();
        const parentId = parentTodo.id;

        // Create child todos via API
        const child1Res = await fetch('http://localhost:3000/api/todo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Child Todo 1', parentId }),
        });
        expect(child1Res.ok).toBe(true);

        const child2Res = await fetch('http://localhost:3000/api/todo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Child Todo 2', parentId }),
        });
        expect(child2Res.ok).toBe(true);

        // Call get_subtasks
        const subtasksResult = await client.callTool({
            name: 'get_subtasks',
            arguments: { id: String(parentId) },
        });

        expect(subtasksResult.content).toBeDefined();
        expect(Array.isArray(subtasksResult.content)).toBe(true);

        const contentArray = subtasksResult.content as unknown[];
        const content = contentArray[0] as Record<string, unknown>;
        const text = content.text as string;

        expect(text).not.toContain('Input validation error');
        expect(text).not.toContain('invalid_type');

        const subtasks = JSON.parse(text);
        expect(Array.isArray(subtasks)).toBe(true);
        expect(subtasks.length).toBeGreaterThanOrEqual(2);
        expect(subtasks[0].parentId).toBe(parentId);
    });

    mcpTest('should return empty array for todo with no subtasks', async ({ client }) => {
        // Create parent todo with no children via API
        const parentCreateRes = await fetch('http://localhost:3000/api/todo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Parent Todo No Children' }),
        });
        expect(parentCreateRes.ok).toBe(true);
        const parentTodo = await parentCreateRes.json();
        const parentId = parentTodo.id;

        // Call get_subtasks
        const subtasksResult = await client.callTool({
            name: 'get_subtasks',
            arguments: { id: String(parentId) },
        });

        expect(subtasksResult.content).toBeDefined();
        const contentArray = subtasksResult.content as unknown[];
        const content = contentArray[0] as Record<string, unknown>;
        const text = content.text as string;

        const subtasks = JSON.parse(text);
        expect(Array.isArray(subtasks)).toBe(true);
        expect(subtasks.length).toBe(0);
    });
});
