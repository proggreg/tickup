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
        parentId: z.union([z.string(), z.number()]).optional().describe('Parent todo ID for subtasks'),
        dueDate: z.string().nullable().optional(),
        completedDate: z.string().nullable().optional(),
        notificationDateTime: z.string().nullable().optional(),
        notificationSent: z.boolean().optional(),
        order: z.number().optional(),
        githubBranchName: z.string().nullable().optional(),
    },
    handler: async (args) => {
        const { id, parentId, ...rest } = args;
        const body: Record<string, unknown> = rest;
        // Coerce parentId to number if it's a string
        if (parentId !== undefined) {
            const numericParentId = typeof parentId === 'string' ? parseInt(parentId, 10) : parentId;
            body.parentId = numericParentId;
        }
        return await callApi(`/api/todo/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body,
        });
    },
});
