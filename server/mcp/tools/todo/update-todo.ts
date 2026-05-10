import { z } from 'zod';
import { objectToSnake } from 'ts-case-convert';
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
        listId: z.string().optional(),
        parentId: z
            .union([z.string(), z.number()])
            .optional()
            .describe('Parent todo ID for subtasks'),
        dueDate: z.string().nullable().optional(),
        completedDate: z.string().nullable().optional(),
        notificationDateTime: z.string().nullable().optional(),
        notificationSent: z.boolean().optional(),
        order: z.number().optional(),
        githubBranchName: z.string().nullable().optional(),
    },
    handler: async (args) => {
        const event = useEvent();
        await mcpUserId(event);

        const { id, ...updateFields } = args;

        // Coerce parentId to number if it's a string
        if (updateFields.parentId !== undefined) {
            updateFields.parentId =
                typeof updateFields.parentId === 'string'
                    ? parseInt(updateFields.parentId, 10)
                    : updateFields.parentId;
        }

        // Convert camelCase to snake_case
        const updates = objectToSnake(updateFields) as Partial<Task>;

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
