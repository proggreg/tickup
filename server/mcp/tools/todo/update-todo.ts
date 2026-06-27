import { z } from 'zod';
import { mcpSupabaseClient, mcpUserId } from '../../utils/auth';
import { TaskService } from '../../../utils/tasks';

export default defineMcpTool({
    name: 'update_todo',
    description: 'Update a todo. Any provided fields are merged into the existing todo.',
    inputSchema: {
        id: z.string().describe('Todo ID to update'),
        name: z.string().optional(),
        description: z.string().optional(),
        status: z.string().optional(),
        priority_lev: z.enum(['high', 'medium', 'low']).optional(),
        list_id: z.string().optional(),
        parent_id: z
            .union([z.string(), z.number()])
            .optional()
            .describe('Parent todo ID for subtasks'),
        due_date: z.string().nullable().optional(),
        completed_date: z.string().nullable().optional(),
        notification_date_time: z.string().nullable().optional(),
        notification_sent: z.boolean().optional(),
        order: z.number().optional(),
        github_branch_name: z.string().nullable().optional(),
    },
    handler: async (args) => {
        const event = useEvent();
        await mcpUserId(event);

        const { id, description, ...rest } = args;

        // Coerce parent_id to number if it's a string
        if (rest.parent_id !== undefined) {
            rest.parent_id =
                typeof rest.parent_id === 'string' ? parseInt(rest.parent_id, 10) : rest.parent_id;
        }

        // DB column is `desc`, not `description`
        const updates: Partial<Task> = rest as unknown as Partial<Task>;
        if (description !== undefined) {
            (updates as Record<string, unknown>).desc = description;
        }

        const supabase = await mcpSupabaseClient(event);
        const tasks = new TaskService(supabase);

        const { data, error } = await tasks.update(id, updates);

        if (error) {
            console.error('Update error:', error);
            return [
                {
                    isError: true,
                    message:
                        (error as unknown as Record<string, unknown>).message || 'Update failed',
                },
            ];
        }

        if (!data) {
            return [
                {
                    isError: true,
                    message: 'Todo not found',
                },
            ];
        }

        return [data];
    },
});
