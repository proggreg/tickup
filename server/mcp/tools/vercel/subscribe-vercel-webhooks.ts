import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'subscribe_vercel_webhooks',
    description:
        'Register a Vercel deployment webhook for the given project IDs so linked todos auto-update on new production deploys.',
    inputSchema: {
        projectIds: z
            .array(z.string())
            .describe('Vercel project IDs to subscribe to deployment events'),
    },
    handler: async ({ projectIds }) => {
        return await callApi('/api/vercel/webhook/subscribe', {
            method: 'POST',
            body: { projectIds },
        });
    },
});
