import { defineEventHandler, createError } from 'h3';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~~/types/database.types';

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const supabase = await serverSupabaseClient<Database>(event);
    const { data, error } = await supabase
        .from('Users')
        .select('vercel_webhook_subscriptions')
        .eq('id', user.sub)
        .single();

    if (error) {
        throw createError({ statusCode: 500, message: error.message });
    }

    const subs = data?.vercel_webhook_subscriptions as {
        webhookId?: string;
        projectIds?: string[];
    } | null;

    return {
        webhookId: subs?.webhookId ?? null,
        projectIds: subs?.projectIds ?? [],
    };
});
