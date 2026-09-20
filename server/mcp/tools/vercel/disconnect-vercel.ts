import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'disconnect_vercel',
    description: "Disconnect the signed-in user's Vercel integration",
    annotations: { destructiveHint: true },
    inputSchema: {},
    handler: async () => {
        return await callApi('/api/vercel/disconnect', { method: 'POST' });
    },
});
