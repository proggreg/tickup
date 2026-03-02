import { z } from 'zod';
import { tool } from 'ai';
import type { H3Event } from 'h3';
import { serverSupabaseClient } from '#supabase/server';

export const getTodosTool = (event: H3Event) => tool({
    description: 'Get all todos',
    inputSchema: z.object({}),
    execute: async () => {
        const supabase = await serverSupabaseClient(event);

        const { data, error } = await supabase
            .from('Todos')
            .select('*')
            .is('parent_id', null)
            .order('due_date', { ascending: false });

        if (error) throw new Error(error.message);

        return {
            todos: (data || []).map(todo => ({
                ...todo,
                dueDate: todo.due_date,
                completedDate: todo.completed_date,
                userId: todo.user_id,
                listId: todo.list_id,
                githubBranchName: todo.github_branch_name,
                notificationDateTime: todo.notification_date_time,
                notificationSent: todo.notification_sent,
                createdAt: todo.created_at,
                updatedAt: todo.updated_at,
            })),
        };
    },
});
