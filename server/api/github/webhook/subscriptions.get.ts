import { defineEventHandler, createError } from 'h3';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/database.types';
import { App } from 'octokit';
import { listWebhooks } from '~~/server/utils/github';

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

    const subscriptions = await listWebhooks(octokit);

    return { subscriptions };
});
