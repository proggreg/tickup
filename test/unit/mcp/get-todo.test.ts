import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

function parseContent(result: unknown): Record<string, unknown> {
    const contentArray = (result as Record<string, unknown>).content as {
        type: string;
        text?: string;
    }[];
    const textContent = contentArray.find(({ type }) => type === 'text');
    if (!textContent?.text) throw new Error('Text content expected');
    return JSON.parse(textContent.text);
}

describe('get_todo MCP tool', () => {
    mcpTest('fetches todo by ID with correct structure', async ({ client, createTodo }) => {
        const newTodo = await createTodo({ name: `test-todo-${crypto.randomUUID()}` });

        const result = await client.callTool({
            name: 'get_todo',
            arguments: { id: String(newTodo.id) },
        });

        const todo = parseContent(result);
        expect(todo).toMatchObject({
            id: newTodo.id,
            name: newTodo.name,
            status: null,
            userId: expect.any(String),
        });
    });

    mcpTest('fetches todo by name', async ({ client, createTodo }) => {
        const name = `fetch-by-name-${crypto.randomUUID()}`;
        const newTodo = await createTodo({ name });

        const result = await client.callTool({
            name: 'get_todo',
            arguments: { name },
        });

        const todo = parseContent(result);
        expect(todo).toMatchObject({
            id: newTodo.id,
            name,
            status: null,
            userId: expect.any(String),
        });
    });

    mcpTest('returns error for name that matches no todo', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_todo',
            arguments: { name: `no-such-todo-${crypto.randomUUID()}` },
        });

        const contentArray = (result as Record<string, unknown>).content as {
            type: string;
            text?: string;
        }[];
        const textContent = contentArray.find(({ type }) => type === 'text');
        expect(textContent?.text).toBeDefined();
        expect(textContent!.text!.toLowerCase()).toMatch(/not found|error/);
    });

    mcpTest('fetches todo by github branch name', async ({ client, createTodo }) => {
        const branchName = `feat/test-${crypto.randomUUID()}`;
        const newTodo = await createTodo({
            name: `test-with-branch-${crypto.randomUUID()}`,
            githubBranchName: branchName,
        });

        const result = await client.callTool({
            name: 'get_todo',
            arguments: { githubBranchName: branchName },
        });

        const todo = parseContent(result);
        expect(todo).toMatchObject({
            id: newTodo.id,
            githubBranchName: branchName,
            status: null,
            userId: expect.any(String),
        });
    });

    mcpTest('returns error for githubBranchName that matches no todo', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_todo',
            arguments: { githubBranchName: `feat/no-such-branch-${crypto.randomUUID()}` },
        });

        const contentArray = (result as Record<string, unknown>).content as {
            type: string;
            text?: string;
        }[];
        const textContent = contentArray.find(({ type }) => type === 'text');
        expect(textContent?.text).toBeDefined();
        expect(textContent!.text!.toLowerCase()).toMatch(/not found|error/);
    });

    mcpTest('returns error when called with no arguments', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_todo',
            arguments: {},
        });

        const contentArray = (result as Record<string, unknown>).content as {
            type: string;
            text?: string;
        }[];
        const textContent = contentArray.find(({ type }) => type === 'text');
        expect(textContent?.text).toContain('Must provide either id, name, or githubBranchName');
    });

    mcpTest('returns error for nonexistent ID', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_todo',
            arguments: { id: '999999999' },
        });

        const contentArray = (result as Record<string, unknown>).content as {
            type: string;
            text?: string;
        }[];
        const textContent = contentArray.find(({ type }) => type === 'text');
        expect(textContent?.text).toBeDefined();
        expect(textContent!.text!.toLowerCase()).toMatch(/not found|error/);
    });

    mcpTest('returns error for non-numeric ID that cannot match any todo', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_todo',
            arguments: { id: `non-numeric-id-${crypto.randomUUID()}` },
        });

        const content = result.content as { type: string; text?: string }[];
        const textContent = content.filter(({ type }) => type === 'text')[0];
        expect(textContent?.text).toBeDefined();
        expect(textContent!.text!.toLowerCase()).toMatch(/not found|error|invalid/);
    });
});
