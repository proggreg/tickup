import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';

export function getMcpServer(): McpServer {
    const mcpServer = new McpServer({
        name: 'Tickup Mcp Server',
        version: '0.0.1',
    });

    return mcpServer;
}
