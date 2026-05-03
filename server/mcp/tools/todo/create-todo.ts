import { z } from 'zod';
import { mcpSupabaseClient, mcpUserId } from '../../utils/auth';
import { TaskService } from '~~/server/utils/tasks';

export default defineMcpTool({
    name: 'create_todo',
    description: 'Create a new todo. Pass `parentId` to create a subtask.',
    inputSchema: {
        name: z.string().describe('Todo name/title'),
        list_id: z.string().optional().describe('List ID to add the todo to'),
        parent_id: z.string().optional().describe('Parent todo ID (creates a subtask)'),
        description: z.string().optional(),
        status: z.string().optional(),
        priority: z.string().optional(),
        due_date: z.string().optional().describe('Due date (ISO 8601)'),
        notification_date_time: z
            .string()
            .optional()
            .describe('Reminder date/time (ISO 8601)'),
        order: z.number().optional(),
        github_branch_name: z.string().optional(),
    },
    handler: async (args) => {
      const event = useEvent();
        await mcpUserId(event);
        const supabase = await mcpSupabaseClient(event);
        const tasks = new TaskService(supabase);

        const { data, error } = await tasks.create(args as unknown as Task);

        console.error(error)

        if (!data) {
          return [
            {
              isError: true
            }
          ]
        }

        return data
    },
});
