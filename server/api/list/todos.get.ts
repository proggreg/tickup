import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    try {
        const { listId } = getQuery(event);
        if (listId) {
            const supabase = await serverSupabaseClient(event);
            const { data, error } = await supabase
                .from('Todos')
                .select('*')
                .eq('list_id', listId)
                .is('parent_id', null);

            if (error) {
                throw createError({
                    statusCode: 500,
                    statusMessage: error.message,
                });
            }

            // Transform snake_case fields to camelCase for API response
            return (data || []).map(todo => ({
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
            }));
        }
        return [];
    }
    catch (e) {
        console.error('Error fetching list todos:', e);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch todos',
        });
    }
});
