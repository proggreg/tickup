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

    mcpTest('CRUD chain: create → get → update → delete', async ({ client }) => {
        const name = `crud-list-${crypto.randomUUID()}`;

        const createResult = await client.callTool({
            name: 'create_list',
            arguments: { name },
        });
        expect((createResult as { isError?: boolean }).isError).toBeFalsy();
        const created = parseListContent(createResult);
        const id = String(created.id);

        const getResult = await client.callTool({
            name: 'get_list',
            arguments: { id },
        });
        expect((getResult as { isError?: boolean }).isError).toBeFalsy();
        const fetched = parseListContent(getResult);
        expect(fetched.name).toBe(name);

        const updatedName = `updated-${crypto.randomUUID()}`;
        const updateResult = await client.callTool({
            name: 'update_list',
            arguments: { id, name: updatedName },
        });
        expect((updateResult as { isError?: boolean }).isError).toBeFalsy();
        const updated = parseListContent(updateResult);
        expect(updated.name).toBe(updatedName);

        await deleteListViaApi(id);
    });
});
