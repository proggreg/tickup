import { createHmac } from 'node:crypto';
import { defineEventHandler, getQuery, readRawBody, createError } from 'h3';
import { serverSupabaseServiceRole } from '#supabase/server';
import type { Database } from '~~/types/database.types';
import { handleDeploymentReady } from './events';

type VercelWebhookSubscriptions = {
    webhookId: string;
    secret: string;
    projectIds: string[];
};

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseServiceRole<Database>(event);
    const { userId } = getQuery(event);

    if (typeof userId !== 'string') {
        throw createError({ statusCode: 400, statusMessage: 'Missing userId query parameter' });
    }

    const { data: userData } = await supabase
        .from('Users')
        .select('vercel_webhook_subscriptions')
        .eq('id', userId)
        .single();

    const subs = userData?.vercel_webhook_subscriptions as VercelWebhookSubscriptions | null;

    if (!subs?.secret) {
        throw createError({ statusCode: 403, statusMessage: 'No webhook configuration found' });
    }

    const rawBody = await readRawBody(event);
    if (!rawBody) {
        throw createError({ statusCode: 400, statusMessage: 'Empty request body' });
    }

    const signature = event.headers.get('x-vercel-signature');
    const expectedSig = createHmac('sha1', subs.secret).update(rawBody).digest('hex');
    if (signature !== expectedSig) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid webhook signature' });
    }

    let body: any;
    try {
        body = JSON.parse(rawBody);
    } catch {
        throw createError({ statusCode: 400, statusMessage: 'Invalid JSON body' });
    }

    const eventType: string = body.type ?? '';
    const deployment = body.payload?.deployment;
    const projectId: string = body.payload?.project?.id ?? '';

    if (
        (eventType === 'deployment.succeeded' || eventType === 'deployment.ready') &&
        deployment?.url &&
        projectId
    ) {
        const deploymentUrl = `https://${deployment.url}`;
        const state = deployment.readyState ?? deployment.state ?? 'READY';
        await handleDeploymentReady(supabase, projectId, deploymentUrl, state, userId);
        return { status: 'success', message: `${eventType} processed` };
    }

    return { status: 'ignored', message: `Unhandled Vercel event: ${eventType}` };
});
