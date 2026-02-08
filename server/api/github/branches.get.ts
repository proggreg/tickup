import { defineEventHandler, createError, getQuery } from 'h3';
import { App } from 'octokit';
import type { Endpoints } from '@octokit/types';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/database.types';

type ListBranchesData = Endpoints['GET /repos/{owner}/{repo}/branches']['response']['data'];

export default defineEventHandler(async (event): Promise<ListBranchesData> => {
    const user = await serverSupabaseUser(event);
    const supabase = await serverSupabaseClient<Database>(event);
    const { data: userData } = await supabase
        .from('Users')
        .select('github_installation_id, github_username')
        .eq('id', user.sub)
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

        const parseQueryParam = (param: unknown): string => {
            if (Array.isArray(param)) return param[0] as string;
            return String(param ?? '');
        };

        const safeOwner = parseQueryParam(owner);
        const safeRepo = parseQueryParam(repo);

        let page = 1;
        let link: string | undefined;
        let branches: ListBranchesData = [];
        let last: number | undefined;
        do {
            const { data, headers } = await octokit.rest.repos.listBranches({
                owner: safeOwner,
                repo: safeRepo,
                page,
            });

            link = headers.link;
            const links: Record<string, { page?: string; url?: string }> = {};
            link?.split(',').forEach((part) => {
                const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
                if (match) {
                    links[match[2]] = {
                        page: match[1].split('=').pop(),
                        url: match[1],
                    };
                }
            });

            last = links?.last?.page ? parseInt(links.last.page, 10) : last;
            const isLast = page === last;
            page++;

            branches = branches.concat(data);
            if (isLast) {
                break;
            }
        } while (link);

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
