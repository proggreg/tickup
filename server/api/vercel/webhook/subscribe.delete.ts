import { defineEventHandler, createError, readBody } from 'h3';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~~/types/database.types';

type VercelWebhookSubscriptions = {
    webhookId: string;
    secret: string;
    projectIds: string[];
};

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const body = await readBody<{ projectIds?: unknown }>(event);
    const rawProjectIds = body?.projectIds;

    if (!Array.isArray(rawProjectIds)) {
        throw createError({
            statusCode: 400,
            message: 'projectIds must be an array of project ID strings',
        });
    }

    const toRemove = new Set(
        rawProjectIds
            .filter((item): item is string => typeof item === 'string')
            .map((s) => s.trim())
            .filter(Boolean),
    );

    const supabase = await serverSupabaseClient<Database>(event);
    const { data: userData, error: userError } = await supabase
        .from('Users')
        .select('vercel_access_token, vercel_team_id, vercel_webhook_subscriptions')
        .eq('id', user.sub)
        .single();

    if (userError) {
        throw createError({ statusCode: 500, message: userError.message });
    }

    if (!userData?.vercel_access_token) {
        throw createError({ statusCode: 403, message: 'Vercel integration not connected.' });
    }

    const existing = userData.vercel_webhook_subscriptions as VercelWebhookSubscriptions | null;
    if (!existing?.webhookId) {
        return { success: true, projectIds: [] };
    }

    const token = userData.vercel_access_token;
    const teamQuery = userData.vercel_team_id ? `?teamId=${userData.vercel_team_id}` : '';
    const remainingProjectIds = existing.projectIds.filter((id) => !toRemove.has(id));

    try {
        if (remainingProjectIds.length === 0) {
            await fetch(`https://api.vercel.com/v1/webhooks/${existing.webhookId}${teamQuery}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            const { error } = await supabase
                .from('Users')
                .update({ vercel_webhook_subscriptions: null })
                .eq('id', user.sub);
            if (error) throw error;

            return { success: true, projectIds: [] };
        }

        const patchRes = await fetch(
            `https://api.vercel.com/v1/webhooks/${existing.webhookId}${teamQuery}`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    events: ['deployment.succeeded', 'deployment.ready'],
                    projectIds: remainingProjectIds,
                }),
            },
        );
        if (!patchRes.ok) {
            const err = await patchRes.json().catch(() => ({}));
            throw new Error(err?.error?.message || 'Failed to update Vercel webhook');
        }

        const vercel_webhook_subscriptions = {
            ...existing,
            projectIds: remainingProjectIds,
        } as unknown as Database['public']['Tables']['Users']['Update']['vercel_webhook_subscriptions'];

        const { error } = await supabase
            .from('Users')
            .update({ vercel_webhook_subscriptions })
            .eq('id', user.sub);
        if (error) throw error;

        return { success: true, projectIds: remainingProjectIds };
    } catch (error: any) {
        throw createError({
            statusCode: error?.status || 500,
            message: error?.message || 'Failed to unsubscribe Vercel webhook',
        });
    }
});
