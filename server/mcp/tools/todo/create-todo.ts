import { z } from 'zod';
import { mcpSupabaseClient, mcpUserId } from '../../utils/auth';
import { TaskService } from '~~/server/utils/tasks';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'create_todo',
    description: 'Create a new todo',
    inputSchema: {
        name: z.string().describe('Todo name/title'),
        list_id: z
            .string()
            .optional()
            .describe('List ID to add the todo to (optional, omit to use default list)'),
        parent_id: z.string().optional().describe('Parent todo ID (creates a subtask)'),
        description: z.string().optional(),
        status: z.string().optional(),
        priority: z.string().optional(),
        due_date: z.string().optional().describe('Due date (ISO 8601)'),
        notification_date_time: z.string().optional().describe('Reminder date/time (ISO 8601)'),
        order: z.number().optional(),
        github_branch_name: z.string().optional(),
    },
    handler: async (args) => {
        const event = useEvent();
        await mcpUserId(event);
        const supabase = await mcpSupabaseClient(event);
        const tasks = new TaskService(supabase);
        const elicit = await useMcpElicitation();

        const { description, ...otherArgs } = args;
        const createData = {
            ...otherArgs,
            ...(description && { desc: description }),
        };

        if (elicit.supports('form')) {
            if (!createData.list_id && !createData.due_date) {
                const lists = await callApi<List[]>(`/api/lists`);

                const listNames = lists.map((list) => list.name);

                const result = await elicit.form({
                    message: 'Should this task be in a list?',
                    schema: {
                        list_name: z.enum(listNames),
                    },
                });
                console.log(result);
                if (result.action === 'accept') {
                    const list = lists.find((list) => list.name == result.content?.list_name);
                    createData.list_id = list?.id;
                }
            }
        }

        // Remap description to desc (database column name)

        const { data, error } = await tasks.create(createData as unknown as Task);

        if (error) {
            console.error('Create error:', error);
            return [
                {
                    isError: true,
                    message:
                        (error as unknown as Record<string, unknown>).message || 'Create failed',
                },
            ];
        }

        if (!data || data.length === 0) {
            return [
                {
                    isError: true,
                    message: 'Failed to create todo',
                },
            ];
        }

        return data;
    },
});
