import { createError, defineEventHandler } from 'h3';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/database.types';

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const supabase = await serverSupabaseClient<Database>(event);
    const { data, error } = await supabase
        .from('Users')
        .select('github_webhook_subscriptions')
        .eq('id', user.sub)
        .single();

    if (error) {
        throw createError({ statusCode: 500, message: error.message });
    }

    const subscriptions = Array.isArray(data?.github_webhook_subscriptions)
        ? data.github_webhook_subscriptions.filter((item): item is string => typeof item === 'string')
        : [];

    return { subscriptions };
});
