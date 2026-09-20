import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'list_vercel_webhook_subscriptions',
    description: 'List Vercel webhook subscriptions for the signed-in user',
    inputSchema: {},
    handler: async () => {
        return await callApi('/api/vercel/webhook/subscriptions');
    },
});
