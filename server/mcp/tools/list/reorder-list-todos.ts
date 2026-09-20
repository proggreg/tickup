import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'reorder_list_todos',
    description: 'Update the display order of todos within a list',
    inputSchema: {
        orderedItems: z
            .array(
                z.object({
                    _id: z.string().describe('Todo ID'),
                    order: z.number().describe('New order index'),
                }),
            )
            .describe('Array of todos with their new order values'),
    },
    handler: async ({ orderedItems }) => {
        return await callApi('/api/list/todos', {
            method: 'PUT',
            body: { orderedItems },
        });
    },
});
