import { defineEventHandler, createError, getRequestURL, readBody } from 'h3';
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

    const projectIds = Array.from(
        new Set(
            rawProjectIds
                .filter((item): item is string => typeof item === 'string')
                .map((s) => s.trim())
                .filter(Boolean),
        ),
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

    const requestUrl = getRequestURL(event);
    const webhookUrl = `${requestUrl.origin}/api/vercel/webhook?userId=${user.sub}`;
    const token = userData.vercel_access_token;
    const teamQuery = userData.vercel_team_id ? `?teamId=${userData.vercel_team_id}` : '';

    const existing = userData.vercel_webhook_subscriptions as VercelWebhookSubscriptions | null;

    let webhookId = existing?.webhookId ?? null;
    let secret = existing?.secret ?? null;

    try {
        if (webhookId) {
            const checkRes = await fetch(
                `https://api.vercel.com/v1/webhooks/${webhookId}${teamQuery}`,
                { headers: { Authorization: `Bearer ${token}` } },
            );

            if (checkRes.status === 404) {
                webhookId = null;
                secret = null;
            } else if (checkRes.ok) {
                const patchRes = await fetch(
                    `https://api.vercel.com/v1/webhooks/${webhookId}${teamQuery}`,
                    {
                        method: 'PATCH',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            events: ['deployment.succeeded', 'deployment.ready'],
                            projectIds: projectIds.length ? projectIds : undefined,
                        }),
                    },
                );
                if (!patchRes.ok) {
                    const err = await patchRes.json().catch(() => ({}));
                    throw new Error(err?.error?.message || 'Failed to update Vercel webhook');
                }
            }
        }

        if (!webhookId) {
            const createRes = await fetch(`https://api.vercel.com/v1/webhooks${teamQuery}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: webhookUrl,
                    events: ['deployment.succeeded', 'deployment.ready'],
                    ...(projectIds.length ? { projectIds } : {}),
                }),
            });
            const createData = await createRes.json();
            if (!createRes.ok) {
                throw new Error(createData?.error?.message || 'Failed to create Vercel webhook');
            }
            webhookId = createData.id;
            secret = createData.secret;
        }

        const vercel_webhook_subscriptions = {
            webhookId,
            secret,
            projectIds,
        } as unknown as Database['public']['Tables']['Users']['Update']['vercel_webhook_subscriptions'];

        const { error: updateError } = await supabase
            .from('Users')
            .update({ vercel_webhook_subscriptions })
            .eq('id', user.sub);

        if (updateError) {
            throw updateError;
        }
    } catch (error: any) {
        throw createError({
            statusCode: error?.status || 500,
            message: error?.message || 'Failed to sync Vercel webhook subscriptions',
        });
    }

    return { success: true, webhookUrl, projectIds };
});
