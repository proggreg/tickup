import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/database.types';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);
    const user = await serverSupabaseUser(event);

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const { data, error } = await supabase
        .from('Users')
        .select('statuses')
        .eq('id', user.sub)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw createError({ statusCode: 500, message: 'Failed to fetch settings' });
    }

    return { statuses: data?.statuses ?? [] };
});
