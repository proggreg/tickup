import { randomUUID } from 'crypto';
import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

type SupabaseListResponse = {
    data: {
        id: string;
        name: string;
        github_repo: string | null;
        list_type: string | null;
        default_view: string | null;
    }[];
    error: null | { message: string };
};

function parseContent(result: unknown): unknown {
    const content = (result as { content: { text: string }[] }).content;
    return JSON.parse(content[0].text);
}

async function createList(client: { callTool: Function }, name: string): Promise<string> {
    const result = await client.callTool({ name: 'create_list', arguments: { name } });
    expect((result as { isError?: boolean }).isError).toBeFalsy();
    const list = parseContent(result) as { id: unknown };
    return String(list.id);
}

async function deleteList(client: { callTool: Function }, id: string): Promise<void> {
    await client.callTool({ name: 'delete_list', arguments: { id } });
}

describe('update_list MCP tool', () => {
    mcpTest(
        'should list tools and find update_list with correct description',
        async ({ client }) => {
            const result = await client.listTools();
            const tool = result.tools.find((t: { name: string }) => t.name === 'update_list');
            expect(tool).toBeDefined();
            expect(tool?.description).toBe(
                'Update a list (name, github repo, list type, default view)',
            );
        },
    );

    mcpTest('should have correct input schema', async ({ client }) => {
        const result = await client.listTools();
        const tool = result.tools.find((t: { name: string }) => t.name === 'update_list');
        const schema = tool?.inputSchema as Record<string, unknown>;
        const properties = schema.properties as Record<string, unknown>;

        expect(properties.id).toBeDefined();
        expect(properties.name).toBeDefined();
        expect(properties.githubRepo).toBeDefined();
        expect(properties.listType).toBeDefined();
        expect(properties.defaultView).toBeDefined();

        const required = schema.required as string[];
        expect(required).toContain('id');
        expect(required).not.toContain('name');
        expect(required).not.toContain('githubRepo');
    });

    mcpTest('should reject call with missing required id field', async ({ client }) => {
        const result = await client.callTool({
            name: 'update_list',
            arguments: { name: 'No ID' },
        });
        expect((result as { isError?: boolean }).isError).toBe(true);
    });

    mcpTest('should update list name and return updated list', async ({ client }) => {
        const id = await createList(client, `Original ${randomUUID()}`);
        const newName = `Updated ${randomUUID()}`;

        const result = await client.callTool({
            name: 'update_list',
            arguments: { id, name: newName },
        });

        expect((result as { isError?: boolean }).isError).toBeFalsy();
        const response = parseContent(result) as SupabaseListResponse;
        expect(response.data).toHaveLength(1);
        expect(response.data[0].name).toBe(newName);

        await deleteList(client, id);
    });

    mcpTest('should return empty data for non-existent list id', async ({ client }) => {
        const result = await client.callTool({
            name: 'update_list',
            arguments: { id: '999999999', name: 'Ghost' },
        });

        expect((result as { isError?: boolean }).isError).toBeFalsy();
        const response = parseContent(result) as SupabaseListResponse;
        expect(response.data).toHaveLength(0);
    });

    mcpTest('should update only name without affecting other fields', async ({ client }) => {
        const id = await createList(client, `Partial ${randomUUID()}`);
        const newName = `Renamed ${randomUUID()}`;

        const result = await client.callTool({
            name: 'update_list',
            arguments: { id, name: newName },
        });

        expect((result as { isError?: boolean }).isError).toBeFalsy();
        const response = parseContent(result) as SupabaseListResponse;
        const updated = response.data[0];
        expect(updated.name).toBe(newName);
        expect(updated.github_repo).toBeNull();
        expect(updated.list_type).toBeNull();
        // default_view defaults to 'list' on new lists
        expect(updated.default_view).toBe('list');

        await deleteList(client, id);
    });
});
