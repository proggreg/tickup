import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import { objectToSnake, objectToCamel } from 'ts-case-convert';
import type { Database } from '~/types/database.types';

const DEFAULT_STATUSES = ['Open', 'In Progress', 'Closed'];

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    delete body.subtasks;
    delete body.edit;

    if (!event.context.params || !event.context.params._id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Todo ID is required',
        });
    }

    if (body.status !== undefined && body.status !== null) {
        const user = await serverSupabaseUser(event);
        const supabase = await serverSupabaseClient<Database>(event);

        let allowedStatuses = DEFAULT_STATUSES;

        if (user?.sub) {
            const { data } = await supabase
                .from('Users')
                .select('statuses')
                .eq('id', user.sub)
                .single();

            const userStatuses = data?.statuses as Array<{ name: string }> | null;
            if (Array.isArray(userStatuses) && userStatuses.length > 0) {
                allowedStatuses = userStatuses.map((s) => s.name);
            }
        }

        if (!allowedStatuses.includes(body.status)) {
            throw createError({
                statusCode: 400,
                statusMessage: `Invalid status "${body.status}". Must be one of: ${allowedStatuses.join(', ')}`,
            });
        }
    }

    const todo = objectToSnake(body);

    const supabase = await serverSupabaseClient(event);

    const { data, error } = await supabase
        .from('Todos')
        .update(todo)
        .eq('id', event.context.params._id)
        .select()
        .single();

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        });
    }

    if (data) {
        return objectToCamel(data);
    }
});
