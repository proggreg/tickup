import { defineEventHandler, createError, getQuery } from 'h3';
import { App } from 'octokit';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~~/types/database.types';
import {
    buildActivityFeed,
    type GithubActivityEvent,
    type RawRepoEvent,
} from '../../utils/githubActivity';

export default defineEventHandler(async (event): Promise<{ events: GithubActivityEvent[] }> => {
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const supabase = await serverSupabaseClient<Database>(event);
    const { data: userData } = await supabase
        .from('Users')
        .select('github_installation_id')
        .eq('id', user.sub)
        .single();

    if (!userData?.github_installation_id) {
        throw createError({ statusCode: 403, message: 'GitHub integration not connected.' });
    }

    const query = getQuery(event);
    const owner = String(query.owner ?? '');
    const repo = String(query.repo ?? '');
    const branch = query.branch ? String(query.branch) : undefined;

    if (!owner || !repo) {
        throw createError({
            statusCode: 400,
            message: 'Missing owner or repo in query parameters',
        });
    }

    const config = useRuntimeConfig();
    const app = new App({
        appId: config.private.github.appId,
        privateKey: config.private.github.privateKey,
    });
    const octokit = await app.getInstallationOctokit(userData.github_installation_id);

    try {
        const { data } = await octokit.rest.activity.listRepoEvents({
            owner,
            repo,
            per_page: 30,
        });

        const repoFullName = `${owner}/${repo}`;
        const events = buildActivityFeed(data as unknown as RawRepoEvent[], repoFullName, branch);

        return { events };
    } catch (error: any) {
        console.error('Error loading GitHub activity:', error);
        throw createError({
            statusCode: error.status || 500,
            message: error.message || 'Failed to load GitHub activity',
        });
    }
});
