import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'subscribe_github_webhooks',
    description:
        'Sync the user\'s GitHub webhook subscriptions to the given list of repository full names. Repos in the list are subscribed; repos previously subscribed but not in the list are unsubscribed.',
    inputSchema: {
        subscriptions: z
            .array(z.string())
            .describe('Repository full names (owner/repo) to subscribe to'),
    },
    handler: async ({ subscriptions }) => {
        return await callApi('/api/github/webhook/subscribe', {
            method: 'POST',
            body: { subscriptions },
        });
    },
});
