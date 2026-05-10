import { describe, expect } from 'vitest';
import { mcpTest } from '../fixtures/mcp';

describe('get_todos MCP tool', () => {
    mcpTest('should list tools and find get_todos', async ({ client }) => {
        const result = await client.listTools();
        expect(result.tools).toBeDefined();
        expect(Array.isArray(result.tools)).toBe(true);

        const tool = result.tools.find((t: { name: string }) => t.name === 'get_todos');
        expect(tool).toBeDefined();
        expect(tool?.description).toBeDefined();
    });

    mcpTest('should have correct tool input schema', async ({ client }) => {
        const result = await client.listTools();
        const tool = result.tools.find((t: { name: string }) => t.name === 'get_todos');

        expect(tool?.inputSchema).toBeDefined();
        const schema = tool?.inputSchema as Record<string, unknown>;
        expect(schema.properties).toBeDefined();
    });

    mcpTest('should call get_todos tool without validation error', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_todos',
            arguments: {},
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);

        const content = result.content as unknown[];
        const textContent = content[0] as Record<string, unknown>;

        // Should not have validation errors
        const text = textContent.text as string;
        expect(text).not.toContain('Input validation error');
        expect(text).not.toContain('invalid_type');
    });

    mcpTest('should return content for user todos', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_todos',
            arguments: {},
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        expect(content.length).toBeGreaterThan(0);
        const textContent = content[0] as Record<string, unknown>;
        expect(textContent.type).toBe('text');
    });

    mcpTest('should handle tool invocation without parameters', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_todos',
            arguments: {},
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        expect(Array.isArray(content)).toBe(true);
        expect(content.length).toBeGreaterThan(0);

        // Response should be text type
        const textContent = content[0] as Record<string, unknown>;
        expect(textContent.type).toBe('text');
    });

    mcpTest('should provide valid response for todos request', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_todos',
            arguments: {},
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        const textContent = content[0] as Record<string, unknown>;
        const text = textContent.text as string;

        // Response should be defined and not error
        expect(text).toBeDefined();
        expect(text.length).toBeGreaterThan(0);
    });

    mcpTest('should return todos list data', async ({ client }) => {
        const result = await client.callTool({
            name: 'get_todos',
            arguments: {},
        });

        expect(result.content).toBeDefined();
        const content = result.content as unknown[];
        expect(content.length).toBeGreaterThan(0);

        // Check response structure
        const textContent = content[0] as Record<string, unknown>;
        expect(textContent.type).toBe('text');
        expect(textContent.text).toBeDefined();
    });
});
