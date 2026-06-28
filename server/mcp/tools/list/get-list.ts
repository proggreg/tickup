import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'get_list',
    description: 'Get a single list by ID along with its top-level todos',
    inputSchema: {
        id: z.string().describe('The list ID'),
    },
    handler: async ({ id }) => {
        return await callApi(`/api/list/${encodeURIComponent(id)}`);
    },
});
