import { defineEventHandler, createError } from 'h3';
import { Octokit } from 'octokit';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const supabase = await serverSupabaseClient(event);
    const { data: userData } = await supabase
        .from('Users')
        .select('github_installation_id, github_username')
        .eq('id', user.id)
        .single();

    if (!userData?.github_installation_id) {
        throw createError({ statusCode: 403, message: 'GitHub integration not connected.' });
    }

    const config = useRuntimeConfig();
    const octokit = new Octokit({ auth: config.github.personal });

    try {
        const { data } = await octokit.rest.apps.listInstallationReposForAuthenticatedUser({
            installation_id: userData.github_installation_id,
        });

        return {
            total_count: data.total_count,
            repositories: data.repositories.map(repo => ({
                id: repo.id,
                name: repo.name,
                full_name: repo.full_name,
                private: repo.private,
                html_url: repo.html_url,
                description: repo.description,
                language: repo.language,
                default_branch: repo.default_branch,
                updated_at: repo.updated_at,
            })),
        };
    }
    catch (error: any) {
        console.error('Error listing repos:', error);
        throw createError({
            statusCode: error.status || 500,
            message: error.message || 'Failed to list repositories',
        });
    }
});
