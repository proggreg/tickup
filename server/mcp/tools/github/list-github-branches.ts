import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'list_github_branches',
    description: 'List all branches for a GitHub repository',
    inputSchema: {
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
    },
    handler: async ({ owner, repo }) => {
        return await callApi('/api/github/branches', { query: { owner, repo } });
    },
});
