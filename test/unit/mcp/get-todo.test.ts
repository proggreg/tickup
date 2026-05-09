import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

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

        const content = result.content as { type: string; text?: string }[];

        const textContent = content.filter(({ type }) => type === 'text')[0];
        if (!textContent || !textContent.text) {
            throw Error('Text content is expected');
        }

        const text: Task = JSON.parse(textContent.text);

        expect(text.id).toBe(newTodo.id);
        expect(text.name).toBe(newTodo.name);
    });

    mcpTest('should fetch todo by name', async ({ client, createTodo }) => {
        const todoName = 'fetch-by-name-test';
        const newTodo = await createTodo({
            name: todoName,
        });

        const result = await client.callTool({
            name: 'get_todo',
            arguments: {
                name: todoName,
            },
        });

        const content = result.content as { type: string; text?: string }[];

        const textContent = content.filter(({ type }) => type === 'text')[0];
        if (!textContent || !textContent.text) {
            throw Error('Text content is expected');
        }

        const text: Task = JSON.parse(textContent.text);

        expect(text.id).toBe(newTodo.id);
        expect(text.name).toBe(todoName);
    });

    mcpTest('should fetch todo by github branch name', async ({ client, createTodo }) => {
        const branchName = 'feat/test-branch-123';
        const newTodo = await createTodo({
            name: 'test-with-branch',
            githubBranchName: branchName,
        });

        const result = await client.callTool({
            name: 'get_todo',
            arguments: {
                githubBranchName: branchName,
            },
        });

        const content = result.content as { type: string; text?: string }[];

        const textContent = content.filter(({ type }) => type === 'text')[0];
        if (!textContent || !textContent.text) {
            throw Error('Text content is expected');
        }

        const text: Task = JSON.parse(textContent.text);

        expect(text.id).toBe(newTodo.id);
        expect(text.githubBranchName).toBe(branchName);
    });
});
