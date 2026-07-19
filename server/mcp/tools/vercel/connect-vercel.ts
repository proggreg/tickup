import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'connect_vercel',
    description:
        'Exchange a Vercel OAuth code and save the resulting access token for the signed-in user',
    inputSchema: {
        code: z.string().describe('OAuth code from the Vercel Integration install flow'),
    },
    handler: async ({ code }) => {
        return await callApi('/api/vercel/connect', {
            method: 'POST',
            body: { code },
        });
    },
});
