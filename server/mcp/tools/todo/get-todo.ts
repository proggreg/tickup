import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'get_todo',
    description: 'Get a single todo by ID, name, or GitHub branch name',
    inputSchema: {
        id: z.string().optional().describe('The todo ID'),
        name: z.string().optional().describe('The todo name'),
        githubBranchName: z.string().optional().describe('The GitHub branch name'),
    },
    handler: async ({ id, name, githubBranchName }) => {
        try {
            if (id) {
                return await callApi(`/api/todo/${encodeURIComponent(id)}`);
            }
            if (name) {
                return await callApi(`/api/todo/search?name=${encodeURIComponent(name)}`);
            }
            if (githubBranchName) {
                return await callApi(
                    `/api/todo/search?githubBranchName=${encodeURIComponent(githubBranchName)}`,
                );
            }
            throw new Error('Must provide either id, name, or githubBranchName');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to retrieve todo';
            return { text: message };
        }
    },
});
