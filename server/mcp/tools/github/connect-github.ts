import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'connect_github',
    description: 'Save a GitHub App installation ID for the signed-in user',
    inputSchema: {
        installationId: z.string().describe('GitHub App installation ID'),
        code: z.string().optional().describe('OAuth code, used to fetch the GitHub username'),
    },
    handler: async ({ installationId, code }) => {
        return await callApi('/api/github/connect', {
            method: 'POST',
            body: { installation_id: installationId, code },
        });
    },
});
