import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'unsubscribe_vercel_webhooks',
    description: 'Remove Vercel deployment webhook subscriptions for the given project IDs.',
    annotations: { destructiveHint: true },
    inputSchema: {
        projectIds: z
            .array(z.string())
            .describe('Vercel project IDs to unsubscribe from deployment events'),
    },
    handler: async ({ projectIds }) => {
        return await callApi('/api/vercel/webhook/subscribe', {
            method: 'DELETE',
            body: { projectIds },
        });
    },
});
