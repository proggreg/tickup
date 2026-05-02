import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'create_github_branch',
    description:
        'Create a new branch in a GitHub repository. If the branch already exists it is returned as-is.',
    inputSchema: {
        branchName: z.string().describe('Name of the branch to create'),
        repo: z
            .object({
                name: z.string(),
                full_name: z.string().describe('owner/repo'),
                default_branch: z.string(),
            })
            .describe('Target repository'),
        sha: z
            .string()
            .optional()
            .describe('Optional base commit SHA. Defaults to the tip of the default branch.'),
    },
    handler: async (args) => {
        return await callApi('/api/github/branch', {
            method: 'POST',
            body: args,
        });
    },
});
