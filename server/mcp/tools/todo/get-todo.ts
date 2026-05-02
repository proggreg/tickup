import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'get_todo',
    description: 'Get a single todo by ID',
    inputSchema: {
        id: z.string().describe('The todo ID'),
    },
    handler: async ({ id }) => {
        return await callApi(`/api/todo/${encodeURIComponent(id)}`);
    },
});
