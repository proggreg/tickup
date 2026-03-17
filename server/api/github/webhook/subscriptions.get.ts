import { defineEventHandler, createError } from 'h3';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/database.types';

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const supabase = await serverSupabaseClient<Database>(event);
    const { data: userData, error: userError } = await supabase
        .from('Users')
        .select('github_webhook_subscriptions')
        .eq('id', user.sub)
        .single();

    if (userError) {
        throw createError({ statusCode: 500, message: userError.message });
    }

    const subscriptions = Array.isArray(userData?.github_webhook_subscriptions)
        ? userData.github_webhook_subscriptions.filter((item): item is string => typeof item === 'string')
        : [];

    return { subscriptions };
});
