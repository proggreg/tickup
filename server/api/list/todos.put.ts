import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const supabase = await serverSupabaseClient(event);

        // Process each update individually since Supabase doesn't have bulkWrite like MongoDB
        const updatePromises = body.orderedItems.map(async (item) => {
            const { data, error } = await supabase
                .from('Todos')
                .update({ order: item.order })
                .eq('id', item._id)
                .select();

            if (error) {
                console.error('Error updating todo order:', error);
                throw error;
            }
            return data;
        });

        const results = await Promise.all(updatePromises);

        // Transform results to camelCase for API response
        const transformedResults = results.map(result =>
            result
                ? result.map(todo => ({
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
                    }))
                : result,
        );

        return { modified: results.length, results: transformedResults };
    }
    catch (e) {
        console.error('Error updating todo orders:', e);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update todo orders',
        });
    }
});
