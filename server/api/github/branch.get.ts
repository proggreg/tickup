import { defineEventHandler, createError } from 'h3';
import { App } from 'octokit';
import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/database.types';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);
    const { data: userData } = await supabase
        .from('Users')
        .select('github_installation_id, github_username')
        .single();

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
        const { owner, repo, branch } = getQuery(event);
        console.log({
            owner, repo, branch,
        });

        // Ensure owner, repo, and branch are strings (as getQuery may return string|string[])
        const parseQueryParam = (param: unknown): string => {
            if (Array.isArray(param)) return param[0] as string;
            return String(param ?? '');
        };

        const safeOwner = parseQueryParam(owner);
        const safeRepo = parseQueryParam(repo);
        const safeBranch = parseQueryParam(branch);

        const { data } = await octokit.rest.repos.getBranch({
            owner: safeOwner,
            repo: safeRepo,
            branch: safeBranch,
        });

        return data;
    }
    catch (error: any) {
        console.error('Error listing repos:', error);
        throw createError({
            statusCode: error.status || 500,
            message: error.message || 'Failed to list repositories',
        });
    }
});
