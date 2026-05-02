import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'update_todo',
    description: 'Update a todo. Any provided fields are merged into the existing todo.',
    inputSchema: {
        id: z.string().describe('Todo ID to update'),
        name: z.string().optional(),
        description: z.string().optional(),
        status: z.string().optional(),
        priority: z.string().optional(),
        listId: z.string().optional(),
        parentId: z.string().optional(),
        dueDate: z.string().nullable().optional(),
        completedDate: z.string().nullable().optional(),
        notificationDateTime: z.string().nullable().optional(),
        notificationSent: z.boolean().optional(),
        order: z.number().optional(),
        githubBranchName: z.string().nullable().optional(),
    },
    handler: async (args) => {
        const { id, ...body } = args;
        return await callApi(`/api/todo/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body,
        });
    },
});
