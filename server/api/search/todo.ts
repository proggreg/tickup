import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    try {
        const { q, id } = getQuery(event);
        const supabase = await serverSupabaseClient(event);

        // Use ilike for case-insensitive search in Supabase with snake_case fields
        const { data, error } = await supabase
            .from('Todos')
            .select('*')
            .eq('user_id', id)
            .ilike('name', `%${q}%`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Search error:', error);
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
    catch (error) {
        console.error('Todo search error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Search failed',
        });
    }
});
