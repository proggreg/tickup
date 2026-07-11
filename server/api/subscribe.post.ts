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

function isValidSubscription(value: unknown): value is PushSubscriptionPayload {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const sub = value as Record<string, unknown>;
    if (typeof sub.endpoint !== 'string' || !sub.endpoint) {
        return false;
    }
    const keys = sub.keys as Record<string, unknown> | undefined;
    return !!keys && typeof keys.p256dh === 'string' && typeof keys.auth === 'string';
}

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const body = await readBody<{ subscription?: unknown }>(event);
    if (!isValidSubscription(body?.subscription)) {
        throw createError({ statusCode: 400, message: 'subscription must be a valid PushSubscription' });
    }
    const subscription = body!.subscription as PushSubscriptionPayload;

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

    const pushSubscriptions = [
        ...existing.filter(sub => sub.endpoint !== subscription.endpoint),
        subscription,
    ] as unknown as Database['public']['Tables']['Users']['Update']['push_subscriptions'];

    const { error: updateError } = await supabase
        .from('Users')
        .upsert({ id: user.sub, push_subscriptions: pushSubscriptions }, { onConflict: 'id' });

    if (updateError) {
        throw createError({ statusCode: 500, message: updateError.message });
    }

    return { success: true };
});
