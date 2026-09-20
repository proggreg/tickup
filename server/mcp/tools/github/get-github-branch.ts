import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'get_github_branch',
    description: 'Get a single branch from a GitHub repository',
    inputSchema: {
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        branch: z.string().describe('Branch name'),
    },
    handler: async ({ owner, repo, branch }) => {
        return await callApi('/api/github/branch', { query: { owner, repo, branch } });
    },
});
