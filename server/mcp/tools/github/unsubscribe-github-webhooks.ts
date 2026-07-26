import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'unsubscribe_github_webhooks',
    description:
        'Replace the user\'s GitHub webhook subscription list. Repos previously subscribed but not in `subscriptions` will be unsubscribed.',
    annotations: { destructiveHint: true },
    inputSchema: {
        subscriptions: z
            .array(z.string())
            .describe('The new full set of subscribed repository full names'),
    },
    handler: async ({ subscriptions }) => {
        return await callApi('/api/github/webhook/subscribe', {
            method: 'DELETE',
            body: { subscriptions },
        });
    },
});
