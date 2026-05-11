import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

const BASE_URL = 'http://localhost:3001';

function parseListContent(result: unknown): Record<string, unknown> {
    const content = (result as { content: { text: string }[] }).content;
    return JSON.parse(content[0].text);
}

async function deleteListViaApi(id: unknown): Promise<void> {
    if (id) {
        await fetch(`${BASE_URL}/api/list/${id}`, { method: 'DELETE' }).catch(() => {});
    }
}

describe('create_list MCP tool', () => {
    mcpTest('creates list and returns id, name, and userId', async ({ client }) => {
        const listName = `Test List ${crypto.randomUUID()}`;
        const result = await client.callTool({
            name: 'create_list',
            arguments: { name: listName },
        });

        expect((result as { isError?: boolean }).isError).toBeFalsy();
        const list = parseListContent(result);
        expect(list).toMatchObject({
            id: expect.anything(),
            name: listName,
            userId: expect.any(String),
        });

        await deleteListViaApi(list.id);
    });

    mcpTest('rejects missing name with isError', async ({ client }) => {
        const result = await client.callTool({
            name: 'create_list',
            arguments: {},
        });

        expect((result as { isError?: boolean }).isError).toBe(true);
    });

    mcpTest('rejects empty string name', async ({ client }) => {
        const result = await client.callTool({
            name: 'create_list',
            arguments: { name: '' },
        });

        expect((result as { isError?: boolean }).isError).toBe(true);
    });

    mcpTest('accepts special characters in name', async ({ client }) => {
        const specialName = `List & Special (Chars) [Here] ${crypto.randomUUID()}`;
        const result = await client.callTool({
            name: 'create_list',
            arguments: { name: specialName },
        });

        expect((result as { isError?: boolean }).isError).toBeFalsy();
        const list = parseListContent(result);
        expect(list).toMatchObject({
            id: expect.anything(),
            name: specialName,
            userId: expect.any(String),
        });

        await deleteListViaApi(list.id);
    });

    mcpTest('creates a list with a name', async ({ client }) => {
        const testListName = `crud-list-${crypto.randomUUID()}`;

        const createResult = await client.callTool({
            name: 'create_list',
            arguments: { name: testListName },
        });
        expect((createResult as { isError?: boolean }).isError).toBeFalsy();
        const { name, id } = parseListContent(createResult);

        expect(name).toBe(name);
        expect(id).toBeTruthy();

        await deleteListViaApi(id);
    });
});
