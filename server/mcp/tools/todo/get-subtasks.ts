import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'get_subtasks',
    description: 'Get the subtasks (child todos) of a todo',
    inputSchema: {
        id: z.string().describe('Parent todo ID'),
    },
    handler: async ({ id }) => {
        return await callApi(`/api/todo/${encodeURIComponent(id)}/subtasks`);
    },
});
