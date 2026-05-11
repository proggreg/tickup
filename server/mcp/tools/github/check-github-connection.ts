import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'check_github_connection',
    description: 'Returns true if the signed-in user has connected their GitHub account',
    inputSchema: {},
    handler: async () => {
        return await callApi('/api/github/check');
    },
});
