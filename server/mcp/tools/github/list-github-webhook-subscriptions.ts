import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'list_github_webhook_subscriptions',
    description: 'List GitHub webhook subscriptions for the signed-in user',
    inputSchema: {},
    handler: async () => {
        return await callApi('/api/github/webhook/subscriptions');
    },
});
