import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/database.types';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);
    const user = await serverSupabaseUser(event);

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const body = await readBody(event);

    if (!body || !Array.isArray(body.statuses)) {
        throw createError({ statusCode: 400, message: 'statuses must be an array' });
    }

    const { error } = await supabase
        .from('Users')
        .upsert({ id: user.sub, statuses: body.statuses });

    if (error) {
        throw createError({ statusCode: 500, message: 'Failed to update settings' });
    }

    return { statuses: body.statuses };
});
