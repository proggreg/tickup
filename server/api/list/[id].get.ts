import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    try {
        const { id } = event.context.params;

        if (!id) {
            throw createError({
                statusCode: 400,
                message: 'List ID is required',
            });
        }

        const supabase = await serverSupabaseClient(event);

        // Get the list
        const { data: list, error: listError } = await supabase
            .from('Lists')
            .select('*')
            .eq('id', id)
            .single();

        if (listError || !list) {
            throw createError({
                statusCode: 404,
                message: 'List not found',
            });
        }

        // Get todos for this list (using snake_case field name)
        const { data: listTodos, error: todosError } = await supabase
            .from('Todos')
            .select('*')
            .eq('list_id', id)
            .order('order', { ascending: true });

        if (todosError) {
            console.error('Error fetching todos:', todosError);
        }

        // Transform todos snake_case fields to camelCase for API response
        const transformedTodos = (listTodos || []).map(todo => ({
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

        // Transform list fields to camelCase
        const transformedList = {
            ...list,
            userId: list.user_id,
            createdAt: list.created_at,
            updatedAt: list.updated_at,
        };

        // Return list with todos embedded for compatibility with existing frontend code
        return { ...transformedList, todos: transformedTodos };
    }
    catch (error: any) {
    // If it's already a createError, re-throw it
        if (error.statusCode) {
            throw error;
        }

        console.error('List API error:', error);
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch list',
        });
    }
});
