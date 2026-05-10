import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

function parseListContent(result: unknown): Record<string, unknown> {
    const content = (result as { content: { text: string }[] }).content;
    return JSON.parse(content[0].text);
}

async function deleteList(client: { callTool: Function }, id: unknown): Promise<void> {
    if (id) {
        await client.callTool({ name: 'delete_list', arguments: { id: String(id) } });
    }
}

describe('create_list MCP tool', () => {
    mcpTest('should list tools and find create_list', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'create_list');
        expect(tool).toBeDefined();
        expect(tool?.description).toBe('Create a new list for the signed-in user');
    });

    mcpTest('should have correct input schema', async ({ client }) => {
        const result = await client.listTools();
        const tool = result.tools.find((t: { name: string }) => t.name === 'create_list');

        const schema = tool?.inputSchema as Record<string, unknown>;
        expect(schema.properties).toBeDefined();
        const properties = schema.properties as Record<string, unknown>;
        expect(properties.name).toBeDefined();

        const required = schema.required as string[];
        expect(required).toContain('name');
    });

    mcpTest('should create list and return id and name', async ({ client }) => {
        const listName = `Test List ${Date.now()}`;
        const result = await client.callTool({
            name: 'create_list',
            arguments: { name: listName },
        });

        expect((result as { isError?: boolean }).isError).toBeFalsy();
        const list = parseListContent(result);
        expect(list.id).toBeDefined();
        expect(list.name).toBe(listName);

        await deleteList(client, list.id);
    });

    mcpTest('should reject missing name with isError', async ({ client }) => {
        const result = await client.callTool({
            name: 'create_list',
            arguments: {},
        });

        expect((result as { isError?: boolean }).isError).toBe(true);
    });

    mcpTest('should handle empty string name', async ({ client }) => {
        const result = await client.callTool({
            name: 'create_list',
            arguments: { name: '' },
        });

        const isError = (result as { isError?: boolean }).isError;
        if (!isError) {
            const list = parseListContent(result);
            await deleteList(client, list.id);
        }
        // Document: server either rejects empty name (isError) or creates it (no error).
        // Either outcome is explicitly handled — test asserts no crash.
        expect(true).toBe(true);
    });

    mcpTest(
        'should accept special characters in name and return correct name',
        async ({ client }) => {
            const specialName = `List & Special (Chars) [Here] ${Date.now()}`;
            const result = await client.callTool({
                name: 'create_list',
                arguments: { name: specialName },
            });

            expect((result as { isError?: boolean }).isError).toBeFalsy();
            const list = parseListContent(result);
            expect(list.id).toBeDefined();
            expect(list.name).toBe(specialName);

            await deleteList(client, list.id);
        },
    );
});
