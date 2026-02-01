import { defineEventHandler, readBody, createError } from 'h3';
import { App } from 'octokit';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    const supabase = await serverSupabaseClient(event);
    const { data: userData } = await supabase
        .from('Users')
        .select('github_installation_id')
        .eq('id', user.sub)
        .single();

    console.log(userData);
    if (!userData?.github_installation_id) {
        throw createError({ statusCode: 403, message: 'GitHub integration not connected. Connect it in Settings.' });
    }

    const config = useRuntimeConfig();
    const app = new App({
        appId: config.private.github.appId,
        privateKey: config.private.github.privateKey,
    });
    const octokit = await app.getInstallationOctokit(userData.github_installation_id);

    if (event.method === 'POST') {
        const body = await readBody(event);
        const branchName = body.branchName as string;
        const repo = body.repo as {
            default_branch: string;
            name: string;
            full_name: string;
        };
        const owner = repo.full_name.split('/').shift();
        let sha = body.sha as string;
        console.log('Creating branch: ', { branchName, owner, repo });

        if (!branchName) {
            return createError({ statusCode: 400, message: 'Missing branchName request body' });
        }

        try {
            const ref = `refs/heads/${branchName}`;
            const { data: tokenData } = await supabase.from('user_integrations').select().single();

            if (!sha) {
                sha = await octokit.rest.repos.getBranch({
                    owner: owner,
                    repo: repo.name,
                    branch: repo.default_branch,
                    headers: {
                        authorization: `Bearer ${tokenData.access_token}`,
                    },
                }).then(({ data }) => {
                    return data.commit.sha;
                });
            }

            if (!sha) {
                return createError({ statusCode: 400, message: 'SHA Cannot be found' });
            }

            const createRefResponse = await octokit.request(`POST /repos/${owner}/${repo.name}/git/refs`, {
                owner: owner,
                repo: repo,
                ref: ref,
                sha: sha,
                headers: {
                    authorization: `Bearer ${tokenData.access_token}`,
                },
            });

            createRefResponse.data.url = `https://github.com/${owner}/${repo.name}/tree/${ref}`;

            return createRefResponse.data;
        }
        catch (error: any) {
            console.error('Error creating branch:', error);
            return createError({ statusCode: error.status || 500, message: error.message || 'Failed to create branch' });
        }
    }
    else {
        return createError({ statusCode: 405, message: 'Method Not Allowed' });
    }
});
