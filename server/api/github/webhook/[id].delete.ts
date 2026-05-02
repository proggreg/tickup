import { App } from 'octokit';
import { createError, defineEventHandler, getRouterParam, getQuery } from 'h3';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/database.types';

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const hookId = Number(getRouterParam(event, 'id'));
    const { owner, repo } = getQuery(event) as { owner?: string; repo?: string };

    if (!hookId || !owner || !repo) {
        throw createError({ statusCode: 400, message: 'Missing required params: id, owner, repo' });
    }

    const supabase = await serverSupabaseClient<Database>(event);
    const { data: userData, error: userError } = await supabase
        .from('Users')
        .select('github_installation_id')
        .eq('id', user.sub)
        .single();

    if (userError) {
        throw createError({ statusCode: 500, message: userError.message });
    }

    if (!userData?.github_installation_id) {
        throw createError({ statusCode: 403, message: 'GitHub integration not connected.' });
    }

    const config = useRuntimeConfig();
    const app = new App({
        appId: config.private.github.appId,
        privateKey: config.private.github.privateKey,
    });
    const octokit = await app.getInstallationOctokit(userData.github_installation_id);

    try {
        await octokit.rest.repos.deleteWebhook({ owner, repo, hook_id: hookId });
    }
    catch (error: any) {
        throw createError({
            statusCode: error?.status || 500,
            message: error?.message || 'Failed to delete webhook',
        });
    }

    return { success: true };
});
