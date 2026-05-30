import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'list_github_repos',
    description: 'List repositories accessible to the user\'s GitHub App installation',
    inputSchema: {},
    handler: async () => {
        return await callApi('/api/github/repos');
    },
});
