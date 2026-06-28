import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'create_list',
    description: 'Create a new list for the signed-in user',
    inputSchema: {
        name: z.string().describe('The name of the list'),
    },
    handler: async ({ name }) => {
        return await callApi('/api/list', {
            method: 'POST',
            body: { name },
        });
    },
});
