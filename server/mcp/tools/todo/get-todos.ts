import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'get_todos',
    description:
        "Get todos. Pass `today` for today's todos, `overdue` for overdue todos, otherwise pass a `userId` to get all top-level todos for that user.",
    inputSchema: {
        today: z.boolean().optional().describe('If true, return only todos due today'),
        overdue: z.boolean().optional().describe('If true, return only overdue todos'),
        userId: z
            .string()
            .optional()
            .describe('User ID (used when neither today nor overdue is set)'),
    },
    handler: async (args) => {
        const query: Record<string, string> = {};
        if (args.today) query.today = '1';
        if (args.overdue) query.overdue = '1';
        if (args.userId) query.id = args.userId;
        return await callApi('/api/todos', { query });
    },
});
