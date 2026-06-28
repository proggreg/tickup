import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'delete_github_webhook',
    description: 'Delete a single GitHub webhook by its hook ID',
    annotations: { destructiveHint: true },
    inputSchema: {
        id: z.number().describe('GitHub webhook hook ID'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
    },
    handler: async ({ id, owner, repo }) => {
        return await callApi(`/api/github/webhook/${id}`, {
            method: 'DELETE',
            query: { owner, repo },
        });
    },
});
