import { getMcpServer } from './server';
import { transport } from './transport';

export default defineEventHandler(async (event) => {
    const server = getMcpServer();

    await server.connect(transport);
    const body = await readBody(event);
    await transport.handleRequest(event.node.req, event.node.res, body);
});
