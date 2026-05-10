import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('create_list MCP tool', () => {
    mcpTest('should list tools and find create_list', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'create_list');
        expect(tool).toBeDefined();
        expect(tool?.description).toBe('Create a new list for the signed-in user');
    });

    mcpTest('should have correct tool input schema', async ({ client }) => {
        const result = await client.listTools();
        const createListTool = result.tools.find((t: { name: string }) => t.name === 'create_list');

        expect(createListTool?.inputSchema).toBeDefined();
        const schema = createListTool?.inputSchema as Record<string, unknown>;

        // Should require name parameter
        expect(schema.properties).toBeDefined();
        const properties = schema.properties as Record<string, unknown>;
        expect(properties.name).toBeDefined();

        // Verify name is required
        const required = schema.required as string[];
        expect(required).toContain('name');
    });

    mcpTest('should call create_list tool with valid name', async ({ client }) => {
        const listName = `Test List ${Date.now()}`;
        const result = await client.callTool({
            name: 'create_list',
            arguments: {
                name: listName,
            },
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
    });

    mcpTest('should validate name is required', async ({ client }) => {
        const result = await client.callTool({
            name: 'create_list',
            arguments: {
                // Missing name parameter
            },
        });

        expect(result.content).toBeDefined();
        const contentArray = result.content as unknown[];
        const content = contentArray[0] as Record<string, unknown>;
        const text = content.text as string;

        // Should have validation error
        expect(text.toLowerCase()).toContain('error');
    });

    mcpTest('should accept various string values for name', async ({ client }) => {
        const testNames = [
            'Simple List',
            'List & Special (Chars) [Here]',
            `Timestamp ${Date.now()}`,
        ];

        for (const listName of testNames) {
            const result = await client.callTool({
                name: 'create_list',
                arguments: {
                    name: listName,
                },
            });

            expect(result.content).toBeDefined();
            expect(Array.isArray(result.content)).toBe(true);
        }
    });

    mcpTest('should return response with content for valid calls', async ({ client }) => {
        const listName = `Fields Test ${Date.now()}`;
        const result = await client.callTool({
            name: 'create_list',
            arguments: {
                name: listName,
            },
        });

        expect(result.content).toBeDefined();
        const contentArray = result.content as unknown[];
        expect(contentArray.length).toBeGreaterThan(0);

        const content = contentArray[0] as Record<string, unknown>;
        expect(content.type).toBeDefined();
        expect(content.text).toBeDefined();
    });
});
