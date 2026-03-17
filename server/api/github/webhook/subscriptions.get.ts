import { defineEventHandler, createError } from 'h3';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/database.types';
import { App } from 'octokit';

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const supabase = await serverSupabaseClient<Database>(event);

    const { data: userData, error: userError } = await supabase
        .from('Users')
        .select('github_installation_id, github_webhook_subscriptions ')
        .eq('id', user.sub)
        .single();

    const config = useRuntimeConfig();
    const app = new App({
        appId: config.private.github.appId,
        privateKey: config.private.github.privateKey,
    });
    const octokit = await app.getInstallationOctokit(userData.github_installation_id);

    if (userError) {
        throw createError({ statusCode: 500, message: userError.message });
    }

    const subscriptions = Array.isArray(userData?.github_webhook_subscriptions)
        ? userData.github_webhook_subscriptions.filter((item): item is string => typeof item === 'string')
        : [];

    type Webhook = Awaited<ReturnType<(typeof octokit)['rest']['repos']['listWebhooks']>>['data'][number];
    let webhooks: Webhook[] = [];
    try {
        const { data: repos } = await octokit.rest.apps.listReposAccessibleToInstallation();
        for (const repo of repos.repositories) {
            const { data } = await octokit.rest.repos.listWebhooks({
                owner: repo.owner.login,
                repo: repo.name,
            });

            webhooks = webhooks.concat(data);
        }
    }
    catch (err) {
        console.error(err);
    }

    return { subscriptions, webhooks };
});
