import { defineEventHandler, createError, getQuery } from 'h3';
import { App } from 'octokit';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~~/types/database.types';

export type GithubActivityEventType = 'commit' | 'pr' | 'branch';

export interface GithubActivityEvent {
    id: string;
    type: GithubActivityEventType;
    summary: string;
    url: string;
    createdAt: string;
}

interface RawRepoEvent {
    id: string;
    type: string | null;
    created_at: string | null;
    payload: {
        ref?: string;
        ref_type?: string;
        action?: string;
        commits?: { sha: string; message: string }[];
        pull_request?: { title: string; html_url: string; merged: boolean };
    };
}

function normalizeEvent(event: RawRepoEvent, repoFullName: string): GithubActivityEvent[] {
    const createdAt = event.created_at;
    if (!createdAt) return [];

    if (event.type === 'PushEvent') {
        const commits = event.payload?.commits ?? [];
        return commits.map((commit, index) => ({
            id: `${event.id}-${index}`,
            type: 'commit' as const,
            summary: (commit.message || '').split('\n')[0],
            url: `https://github.com/${repoFullName}/commit/${commit.sha}`,
            createdAt,
        }));
    }

    if (event.type === 'PullRequestEvent') {
        const pr = event.payload?.pull_request;
        if (!pr) return [];
        const merged = event.payload?.action === 'closed' && pr.merged;
        const opened = event.payload?.action === 'opened';
        if (!merged && !opened) return [];
        return [
            {
                id: event.id,
                type: 'pr' as const,
                summary: `${merged ? 'Merged PR' : 'Opened PR'}: ${pr.title}`,
                url: pr.html_url,
                createdAt,
            },
        ];
    }

    if (event.type === 'CreateEvent' && event.payload?.ref_type === 'branch') {
        const ref = event.payload.ref;
        if (!ref) return [];
        return [
            {
                id: event.id,
                type: 'branch' as const,
                summary: `Created branch ${ref}`,
                url: `https://github.com/${repoFullName}/tree/${ref}`,
                createdAt,
            },
        ];
    }

    return [];
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
        const events = (data as unknown as RawRepoEvent[])
            .flatMap(raw => normalizeEvent(raw, repoFullName))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 40);

        return { events };
    }
    catch (error: any) {
        console.error('Error loading GitHub activity:', error);
        throw createError({
            statusCode: error.status || 500,
            message: error.message || 'Failed to load GitHub activity',
        });
    }
});
