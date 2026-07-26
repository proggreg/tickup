import { createError, defineEventHandler, readBody } from 'h3';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~~/types/database.types';

interface PushSubscriptionPayload {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const body = await readBody<{ endpoint?: unknown }>(event);
    const endpoint = body?.endpoint;
    if (typeof endpoint !== 'string' || !endpoint) {
        throw createError({ statusCode: 400, message: 'endpoint must be a string' });
    }

    const supabase = await serverSupabaseClient<Database>(event);
    const { data: userData, error: userError } = await supabase
        .from('Users')
        .select('push_subscriptions')
        .eq('id', user.sub)
        .single();

    if (userError && userError.code !== 'PGRST116') {
        throw createError({ statusCode: 500, message: userError.message });
    }

    const existing = Array.isArray(userData?.push_subscriptions)
        ? (userData.push_subscriptions as unknown as PushSubscriptionPayload[])
        : [];

    const pushSubscriptions = existing.filter(
        sub => sub.endpoint !== endpoint,
    ) as unknown as Database['public']['Tables']['Users']['Update']['push_subscriptions'];

    const { error: updateError } = await supabase
        .from('Users')
        .update({ push_subscriptions: pushSubscriptions })
        .eq('id', user.sub);

    if (updateError) {
        throw createError({ statusCode: 500, message: updateError.message });
    }

    return { success: true };
});
