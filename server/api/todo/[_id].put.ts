import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (!event.context.params || !event.context.params._id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Todo ID is required',
        });
    }

    const supabase = await serverSupabaseClient(event);

    // Transform camelCase fields to snake_case for database, excluding undefined values
    const updateData: any = {
        updated_at: new Date(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.desc !== undefined) updateData.desc = body.desc;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.dueDate !== undefined) updateData.due_date = body.dueDate;
    if (body.completedDate !== undefined) updateData.completed_date = body.completedDate;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.userId !== undefined) updateData.user_id = body.userId;
    if (body.listId !== undefined) updateData.list_id = body.listId;
    if (body.githubBranchName !== undefined) updateData.github_branch_name = body.githubBranchName;
    if (body.notificationDateTime !== undefined) updateData.notification_date_time = body.notificationDateTime;
    if (body.notificationSent !== undefined) updateData.notification_sent = body.notificationSent;
    if (body.attachments !== undefined) updateData.attachments = body.attachments;

    const { data, error } = await supabase
        .from('Todos')
        .update(updateData)
        .eq('id', event.context.params._id)
        .select()
        .single();

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        });
    }

    // Transform snake_case fields back to camelCase for API response
    if (data) {
        return {
            ...data,
            dueDate: data.due_date,
            completedDate: data.completed_date,
            userId: data.user_id,
            listId: data.list_id,
            githubBranchName: data.github_branch_name,
            notificationDateTime: data.notification_date_time,
            notificationSent: data.notification_sent,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }

    return data;
});
