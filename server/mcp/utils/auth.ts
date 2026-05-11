import type { H3Event } from 'h3';
import { getHeader } from 'h3';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

export async function mcpUserId(event: H3Event): Promise<string> {
    const fromBearer = event.context.user?.id as string | undefined;
    if (fromBearer) return fromBearer;

    const claims = await serverSupabaseUser(event);
    if (claims?.sub) return claims.sub as string;

    throw createError({ statusCode: 401, statusMessage: 'Not signed in' });
}

export async function mcpSupabaseClient(event: H3Event): Promise<SupabaseClient> {
    // First try event context
    let bearer = event.context.bearerToken as string | undefined;

    // Fall back to Authorization header from request
    if (!bearer) {
        const authHeader = getHeader(event, 'authorization') || '';
        if (authHeader.startsWith('Bearer ')) {
            bearer = authHeader.substring(7);
        }
    }

    if (!bearer) return serverSupabaseClient(event);

    const { url, key } = useRuntimeConfig(event).public.supabase as { url: string; key: string };
    return createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${bearer}` } },
    });
}
