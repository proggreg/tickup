export type GithubActivityEventType = 'commit' | 'pr' | 'branch' | 'deployment';

export interface GithubActivityEvent {
    id: string;
    type: GithubActivityEventType;
    summary: string;
    url: string;
    createdAt: string;
}

export interface RawRepoEvent {
    id: string;
    type: string | null;
    created_at: string | null;
    payload: {
        ref?: string;
        ref_type?: string;
        action?: string;
        commits?: { sha: string; message: string }[];
        pull_request?: { number: number; title: string; merged: boolean; head?: { ref: string } };
    };
}

export interface RawVercelDeployment {
    uid: string;
    url: string;
    name?: string;
    inspectorUrl?: string;
    state?: string;
    readyState?: string;
    createdAt?: number;
    created?: number;
    meta?: { githubCommitRef?: string };
}

const VERCEL_STATES_SHOWN = new Set(['READY', 'ERROR', 'CANCELED']);

function matchesBranch(event: RawRepoEvent, branch: string): boolean {
    if (event.type === 'PushEvent') {
        return event.payload?.ref === `refs/heads/${branch}`;
    }
    if (event.type === 'PullRequestEvent') {
        return event.payload?.pull_request?.head?.ref === branch;
    }
    if (event.type === 'CreateEvent' && event.payload?.ref_type === 'branch') {
        return event.payload?.ref === branch;
    }
    return false;
}

export function normalizeVercelDeployment(
    deployment: RawVercelDeployment,
    branch?: string,
): GithubActivityEvent | null {
    const state = (deployment.readyState || deployment.state || '').toUpperCase();
    if (!VERCEL_STATES_SHOWN.has(state)) return null;
    if (branch && deployment.meta?.githubCommitRef !== branch) return null;

    const createdAtMs = deployment.createdAt ?? deployment.created;
    if (!createdAtMs) return null;

    return {
        id: `vercel-${deployment.uid}`,
        type: 'deployment',
        summary: `Deployment: ${state.toLowerCase()}`,
        url: deployment.inspectorUrl || `https://${deployment.url}`,
        createdAt: new Date(createdAtMs).toISOString(),
    };
}

export function normalizeEvent(event: RawRepoEvent, repoFullName: string): GithubActivityEvent[] {
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
                summary: `${merged ? 'Merged PR' : 'Opened PR'}: #${pr.number}`,
                url: `https://github.com/${repoFullName}/pull/${pr.number}`,
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

export function sortAndCapFeed(events: GithubActivityEvent[]): GithubActivityEvent[] {
    return events
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 40);
}

export function buildActivityFeed(
    rawEvents: RawRepoEvent[],
    repoFullName: string,
    branch?: string,
): GithubActivityEvent[] {
    const scopedEvents = branch ? rawEvents.filter((e) => matchesBranch(e, branch)) : rawEvents;
    return sortAndCapFeed(scopedEvents.flatMap((raw) => normalizeEvent(raw, repoFullName)));
}
