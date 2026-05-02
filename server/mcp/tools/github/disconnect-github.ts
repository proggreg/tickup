import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'disconnect_github',
    description: 'Disconnect the signed-in user\'s GitHub integration',
    annotations: { destructiveHint: true },
    inputSchema: {},
    handler: async () => {
        return await callApi('/api/github/disconnect', { method: 'POST' });
    },
});
