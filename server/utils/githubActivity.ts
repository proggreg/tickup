export type GithubActivityEventType = 'commit' | 'pr' | 'branch';

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

export function buildActivityFeed(
    rawEvents: RawRepoEvent[],
    repoFullName: string,
    branch?: string,
): GithubActivityEvent[] {
    const scopedEvents = branch ? rawEvents.filter((e) => matchesBranch(e, branch)) : rawEvents;
    return scopedEvents
        .flatMap((raw) => normalizeEvent(raw, repoFullName))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 40);
}
