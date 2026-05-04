import { mcpSupabaseClient } from '../../mcp/utils/auth';

export default defineEventHandler(async (event) => {
    if (!event.context.params || !event.context.params._id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Todo ID is required',
        });
    }

    const supabase = await mcpSupabaseClient(event);
    const todoId = parseInt(event.context.params._id, 10);
    const { data, error } = await supabase
        .from('Todos')
        .delete()
        .eq('id', todoId)
        .select();

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        });
    }

    if (!data || data.length === 0) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Todo not found',
        });
    }

    const todo = data[0];
    return {
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
    };
});
