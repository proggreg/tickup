import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'get_vercel_deployment',
    description: 'Get the latest production deployment for a Vercel project',
    inputSchema: {
        projectId: z.string().describe('Vercel project ID'),
    },
    handler: async ({ projectId }) => {
        return await callApi('/api/vercel/deployment', { query: { projectId } });
    },
});
