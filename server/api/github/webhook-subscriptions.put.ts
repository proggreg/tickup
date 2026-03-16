import { App } from 'octokit';
import { createError, defineEventHandler, getRequestURL, readBody } from 'h3';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/database.types';

function toRepoParts(fullName: string): { owner: string; repo: string } {
    const [owner, repo] = fullName.split('/');
    if (!owner || !repo) {
        throw createError({ statusCode: 400, message: `Invalid repository full name: ${fullName}` });
    }

    return { owner, repo };
}

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const body = await readBody<{ subscriptions?: unknown }>(event);
    const rawSubscriptions = body?.subscriptions;

    if (!Array.isArray(rawSubscriptions)) {
        throw createError({ statusCode: 400, message: 'subscriptions must be an array of repository full names' });
    }

    const subscriptions = Array.from(new Set(
        rawSubscriptions
            .filter((item): item is string => typeof item === 'string')
            .map(item => item.trim())
            .filter(Boolean),
    ));

    const supabase = await serverSupabaseClient<Database>(event);
    const { data: userData, error: userError } = await supabase
        .from('Users')
        .select('github_installation_id')
        .eq('id', user.sub)
        .single();

    // if (userError) {
    //     throw createError({ statusCode: 500, message: userError.message });
    // }

    // if (!userData?.github_installation_id) {
    //     throw createError({ statusCode: 403, message: 'GitHub integration not connected.' });
    // }

    // const previousSubscriptions = Array.isArray(userData.github_webhook_subscriptions)
    //     ? userData.github_webhook_subscriptions.filter((item): item is string => typeof item === 'string')
    //     : [];

    // const removedSubscriptions = previousSubscriptions.filter(repo => !subscriptions.includes(repo));

    const requestUrl = getRequestURL(event);
    const webhookUrl = `${requestUrl.origin}/api/webhook`;

    const config = useRuntimeConfig();
    const app = new App({
        appId: config.private.github.appId,
        privateKey: config.private.github.privateKey,
    });

    const octokit = await app.getInstallationOctokit(userData.github_installation_id);

    const hookConfig = {
        url: webhookUrl,
        content_type: 'json' as const,
        insecure_ssl: '0' as const,
        ...(config.private.github.webhookSecret
            ? { secret: config.private.github.webhookSecret }
            : {}),
    };

    try {
        for (const fullName of subscriptions) {
            const { owner, repo } = toRepoParts(fullName);
            const { data: hooks } = await octokit.rest.repos.listWebhooks({ owner, repo, per_page: 100 });
            const existingHook = hooks.find(hook => hook.config?.url === webhookUrl);

            if (existingHook) {
                await octokit.rest.repos.updateWebhook({
                    owner,
                    repo,
                    hook_id: existingHook.id,
                    active: true,
                    events: ['push', 'delete'],
                    config: hookConfig,
                });
            }
            else {
                await octokit.rest.repos.createWebhook({
                    owner,
                    repo,
                    name: 'web',
                    active: true,
                    events: ['push', 'delete'],
                    config: hookConfig,
                });
            }
        }

        // for (const fullName of removedSubscriptions) {
        //     const { owner, repo } = toRepoParts(fullName);
        //     const { data: hooks } = await octokit.rest.repos.listWebhooks({ owner, repo, per_page: 100 });
        //     const existingHook = hooks.find(hook => hook.config?.url === webhookUrl);

        //     if (existingHook) {
        //         await octokit.rest.repos.deleteWebhook({
        //             owner,
        //             repo,
        //             hook_id: existingHook.id,
        //         });
        //     }
        // }
    }
    catch (error: any) {
        throw createError({
            statusCode: error?.status || 500,
            message: error?.message || 'Failed to sync GitHub webhook subscriptions',
        });
    }

    const { error } = await supabase
        .from('Users')
        .update({ github_webhook_subscriptions: subscriptions })
        .eq('id', user.sub);

    if (error) {
        throw createError({ statusCode: 500, message: error.message });
    }

    return {
        success: true,
        subscriptions,
        webhookUrl,
    };
});
