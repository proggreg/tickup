import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'delete_todo',
    description: 'Delete a todo by ID',
    annotations: { destructiveHint: true },
    inputSchema: {
        id: z.string().describe('Todo ID to delete'),
    },
    handler: async ({ id }) => {
        return await callApi(`/api/todo/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        });
    },
});
