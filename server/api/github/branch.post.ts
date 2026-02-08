import { getGithubInstallation, getGithubToken } from '../../utils/github';
import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const octokit = await getGithubInstallation(event);

    const body = await readBody(event);
    const branchName = body.branchName as string;
    const repo = body.repo as {
        default_branch: string;
        name: string;
        full_name: string;
    };
    const owner = repo.full_name.split('/').shift();
    let sha = body.sha as string | null;
    console.log('Creating branch: ', { branchName, owner, repo });

    if (!branchName) {
        return createError({ statusCode: 400, message: 'Missing branchName request body' });
    }

    try {
        const ref = `refs/heads/${branchName}`;

        // Get a valid (potentially refreshed) access token
        let accessToken: string;
        try {
            accessToken = await getGithubToken(event);
        }
        catch (tokenError: any) {
            console.error('Failed to get valid GitHub token:', tokenError);
            throw createError({
                statusCode: 401,
                message: 'GitHub token expired or invalid. Please reconnect GitHub in Settings.',
            });
        }

        // Check if branch already exists
        try {
            const existingBranch = await octokit.rest.repos.getBranch({
                owner: owner,
                repo: repo.name,
                branch: branchName,
            });

            if (existingBranch.data) {
                console.log('Branch already exists:', branchName);
                return {
                    ref: `refs/heads/${branchName}`,
                    url: `https://github.com/${owner}/${repo.name}/tree/${branchName}`,
                    object: { sha: existingBranch.data.commit.sha },
                    alreadyExists: true,
                };
            }
        }
        catch (error: any) {
            // If branch doesn't exist, we'll get a 404 - that's expected, continue to create it
            if (error.status !== 404) {
                throw error;
            }
            console.log('Branch does not exist, creating:', branchName);
        }

        if (!sha) {
            const { data } = await octokit.rest.repos.getBranch({
                owner: owner,
                repo: repo.name,
                branch: repo.default_branch,
            });
            console.log('got branch', data);
            sha = data.commit.sha;
            console.log('sha', sha);
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
                authorization: `Bearer ${accessToken}`,
            },
        });

        createRefResponse.data.url = `https://github.com/${owner}/${repo.name}/tree/${ref}`;

        return createRefResponse.data;
    }
    catch (error: any) {
        console.error('Error creating branch:', error);

        // Handle token expiration errors specifically
        if (error.status === 401 || error.message?.includes('Bad credentials')) {
            throw createError({
                statusCode: 401,
                message: 'GitHub authentication failed. Please reconnect GitHub in Settings.',
            });
        }

        return createError({ statusCode: error.status || 500, message: error.message || 'Failed to create branch' });
    }
});
