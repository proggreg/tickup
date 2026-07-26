import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'list_vercel_projects',
    description: "List Vercel projects accessible to the signed-in user's connected Vercel account",
    inputSchema: {},
    handler: async () => {
        return await callApi('/api/vercel/projects');
    },
});
