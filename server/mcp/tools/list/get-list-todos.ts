import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'get_list_todos',
    description: 'Get top-level todos for a list (excludes subtasks)',
    inputSchema: {
        listId: z.string().describe('The list ID'),
    },
    handler: async ({ listId }) => {
        return await callApi('/api/list/todos', { query: { listId } });
    },
});
