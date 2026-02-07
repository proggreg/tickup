import { defineEventHandler, createError } from 'h3';
import { App } from 'octokit';
import type { Endpoints } from '@octokit/types';
import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/database.types';

type ListBranchesData = Endpoints['GET /repos/{owner}/{repo}/branches']['response']['data'];

export default defineEventHandler(async (event): Promise<ListBranchesData> => {
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
        const { owner, repo } = getQuery(event);

        // Ensure owner and repo are strings (as getQuery may return string|string[])
        const parseQueryParam = (param: unknown): string => {
            if (Array.isArray(param)) return param[0] as string;
            return String(param ?? '');
        };

        const safeOwner = parseQueryParam(owner);
        const safeRepo = parseQueryParam(repo);

        let page = 1;
        let link;
        let branches = [];
        let last;
        do {
            console.log('get branches');
            const { data, headers } = await octokit.rest.repos.listBranches({
                owner: safeOwner,
                repo: safeRepo,
                page,
            });

            link = headers['link'];
            const links = {};
            link?.split(',').forEach((part) => {
                const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
                if (match) {
                    links[match[2]] = {
                        page: match[1].split('=').pop(),
                        url: match[1],
                    };
                }
            });

            console.log('links', links);
            last = links?.last?.page || last;
            const isLast = page == last;
            page++;

            console.log('branches', data.length);

            console.log('link', link);
            branches = branches.concat(data);
            if (isLast) {
                break;
            }
        } while (link);

        console.log('num of branches', branches.length);
        return branches;
    }
    catch (error: any) {
        console.error('Error listing repos:', error);
        throw createError({
            statusCode: error.status || 500,
            message: error.message || 'Failed to list repositories',
        });
    }
});
