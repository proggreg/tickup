import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const body = await readBody<Todo>(event);
    const supabase = await serverSupabaseClient(event);

    delete body.edit;
    delete body.userId;

    const todo = {
        list_id: body.listId,
        name: body.name,
        desc: body.desc,
        status: body.status,
        links: body.links,
        attachments: body.attachments,
        color: body.color,
        due_date: body.dueDate,

    };
    try {
    // Transform camelCase fields to snake_case for database

        const { data, error } = await supabase.from('Todos').insert([todo]).select();

        if (error) {
            console.error('Supabase error:', error);
            throw createError({
                statusCode: 500,
                statusMessage: error.message,
            });
        }

        // Transform snake_case fields back to camelCase for API response
        const result = data[0];
        if (result) {
            return {
                ...result,
                dueDate: result.due_date,
                completedDate: result.completed_date,
                userId: result.user_id,
                listId: result.list_id,
                githubBranchName: result.github_branch_name,
                notificationDateTime: result.notification_date_time,
                notificationSent: result.notification_sent,
                createdAt: result.created_at,
                updatedAt: result.updated_at,
            };
        }

        return result;
    }
    catch (e) {
        console.error('error', e);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create todo',
        });
    }
});
