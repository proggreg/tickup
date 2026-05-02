import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'create_todo',
    description: 'Create a new todo. Pass `parentId` to create a subtask.',
    inputSchema: {
        name: z.string().describe('Todo name/title'),
        listId: z.string().optional().describe('List ID to add the todo to'),
        parentId: z.string().optional().describe('Parent todo ID (creates a subtask)'),
        description: z.string().optional(),
        status: z.string().optional(),
        priority: z.string().optional(),
        dueDate: z.string().optional().describe('Due date (ISO 8601)'),
        notificationDateTime: z
            .string()
            .optional()
            .describe('Reminder date/time (ISO 8601)'),
        order: z.number().optional(),
        githubBranchName: z.string().optional(),
    },
    handler: async (args) => {
        return await callApi('/api/todo', {
            method: 'POST',
            body: args,
        });
    },
});
