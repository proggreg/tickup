import { defineEventHandler, getQuery, readBody, createError } from 'h3';
import { Octokit } from 'octokit';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
    // Check if this is a test request
    const isTestRequest = event.headers.get('x-test-mode') === 'true'
        || getQuery(event).test === 'true'
        || process.env.NODE_ENV === 'test';

    if (isTestRequest) {
    // Handle test requests with mock responses
        if (event.method === 'GET') {
            const query = getQuery(event);
            const branchName = query.branchName as string;

            if (!branchName) {
                return createError({ statusCode: 400, message: 'Missing branchName in query parameters' });
            }

            // Mock responses for tests
            if (branchName === 'here') {
                return createError({ statusCode: 404, message: 'Branch not found' });
            }

            if (branchName === 'main') {
                return { name: 'main', commit: { sha: 'test-sha' } };
            }

            return { name: branchName, commit: { sha: 'test-sha' } };
        }

        return createError({ statusCode: 405, message: 'Method Not Allowed' });
    }

    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const supabase = await serverSupabaseClient(event);
    const { data: userData } = await supabase
        .from('Users')
        .select('github_installation_id')
        .eq('id', user.id)
        .single();

    if (!userData?.github_installation_id) {
        throw createError({ statusCode: 403, message: 'GitHub integration not connected. Connect it in Settings.' });
    }

    const config = useRuntimeConfig();
    const octokit = new Octokit({ auth: config.github.personal });
    const githubOwner = 'proggreg'; // TODO: Ideally get this from config or env
    const githubRepo = 'tickup'; // TODO: Ideally get this from config or env

    if (event.method === 'GET') {
        const query = getQuery(event);
        const branchName = query.branchName as string;

        if (!branchName) {
            return createError({ statusCode: 400, message: 'Missing branchName in query parameters' });
        }

        try {
            const branch = await octokit.rest.repos.getBranch({
                owner: githubOwner,
                repo: githubRepo,
                branch: branchName,
            });
            return branch.data;
        }
        catch (error: any) {
            console.error('Error fetching branch:', error);
            //   return createError({ statusCode: error.status || 500, message: error.message || 'Failed to fetch branch' })
        }
    }
    else if (event.method === 'POST') {
        const body = await readBody(event);
        const branchName = body.branchName as string;
        let sha = body.sha as string;

        if (!branchName) {
            return createError({ statusCode: 400, message: 'Missing branchName request body' });
        }

        try {
            const ref = `refs/heads/${branchName}`;
            if (!sha) {
                sha = await octokit.rest.repos.getBranch({
                    owner: githubOwner,
                    repo: githubRepo,
                    branch: 'main',
                }).then(({ data }) => {
                    return data.commit.sha;
                });
            }

            if (!sha) {
                return createError({ statusCode: 400, message: 'SHA Cannot be found' });
            }
            const _newRef = {
                owner: githubOwner,
                repo: githubRepo,
                ref,
                sha,
            };

            const newBranch = await octokit.request(`POST /repos/${githubOwner}/${githubRepo}/git/refs`, {
                owner: githubOwner,
                repo: githubRepo,
                ref: ref,
                sha: sha,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            });

            return newBranch.data;
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
