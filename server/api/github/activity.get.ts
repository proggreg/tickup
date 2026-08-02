import { defineEventHandler, createError, getQuery } from 'h3';
import { App } from 'octokit';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~~/types/database.types';
import {
    buildActivityFeed,
    normalizeVercelDeployment,
    sortAndCapFeed,
    type GithubActivityEvent,
    type RawRepoEvent,
    type RawVercelDeployment,
} from '../../utils/githubActivity';

async function resolveVercelOwnerSlug(
    accessToken: string,
    teamId?: string | null,
): Promise<string | null> {
    try {
        if (teamId) {
            const res = await fetch(`https://api.vercel.com/v2/teams/${teamId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!res.ok) return null;
            const team: { slug?: string } = await res.json();
            return team.slug ?? null;
        }

        const res = await fetch('https://api.vercel.com/v2/user', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) return null;
        const data: { user?: { username?: string } } = await res.json();
        return data.user?.username ?? null;
    } catch {
        return null;
    }
}

async function fetchVercelDeploymentEvents(
    supabase: Awaited<ReturnType<typeof serverSupabaseClient<Database>>>,
    userId: string,
    vercelProjectId: string,
    branch?: string,
): Promise<GithubActivityEvent[]> {
    const { data: userData } = await supabase
        .from('Users')
        .select('vercel_access_token, vercel_team_id')
        .eq('id', userId)
        .single();

    if (!userData?.vercel_access_token) return [];

    try {
        const params = new URLSearchParams({ projectId: vercelProjectId, limit: '20' });
        if (userData.vercel_team_id) {
            params.set('teamId', userData.vercel_team_id);
        }

        const [res, ownerSlug] = await Promise.all([
            fetch(`https://api.vercel.com/v6/deployments?${params.toString()}`, {
                headers: { Authorization: `Bearer ${userData.vercel_access_token}` },
            }),
            resolveVercelOwnerSlug(userData.vercel_access_token, userData.vercel_team_id),
        ]);
        if (!res.ok) return [];

        const data: { deployments?: RawVercelDeployment[] } = await res.json();
        return (data.deployments ?? [])
            .map((deployment) => {
                if (ownerSlug && deployment.name) {
                    deployment = {
                        ...deployment,
                        inspectorUrl: `https://vercel.com/${ownerSlug}/${deployment.name}/${deployment.uid.replace(/^dpl_/, '')}`,
                    };
                }
                return normalizeVercelDeployment(deployment, branch);
            })
            .filter((e): e is GithubActivityEvent => e !== null);
    } catch (error) {
        console.error('Error loading Vercel deployment activity:', error);
        return [];
    }
}

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
    const vercelProjectId = query.vercelProjectId ? String(query.vercelProjectId) : undefined;

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

        if (!vercelProjectId) {
            return { events };
        }

        const deploymentEvents = await fetchVercelDeploymentEvents(
            supabase,
            user.sub,
            vercelProjectId,
            branch,
        );

        return { events: sortAndCapFeed([...events, ...deploymentEvents]) };
    } catch (error: any) {
        console.error('Error loading GitHub activity:', error);
        throw createError({
            statusCode: error.status || 500,
            message: error.message || 'Failed to load GitHub activity',
        });
    }
});
