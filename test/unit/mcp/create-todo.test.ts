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
        const parentContent = Array.isArray(parentResult.content) && parentResult.content[0];
        const textContent = (parentContent as Record<string, unknown>).text as string;
        const parentTodos = JSON.parse(textContent);

        const parentId = parentTodos[0]?.id;
        expect(parentId).toBeDefined();

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
        const subtaskContent = Array.isArray(subtaskResult.content) && subtaskResult.content[0];
        const subtaskTodos = JSON.parse((subtaskContent as Record<string, unknown>).text as string);
        const subtask = subtaskTodos[0];

        // Verify subtask created with parent_id set
        expect(subtask.parent_id).toBe(parentId);
    });
});
