import { describe, expect, it } from 'vitest';
import {
    buildActivityFeed,
    normalizeEvent,
    normalizeVercelDeployment,
    type RawRepoEvent,
    type RawVercelDeployment,
} from '../../../server/utils/githubActivity';

const REPO = 'proggreg/tickup';

function pushEvent(overrides: Partial<RawRepoEvent> = {}): RawRepoEvent {
    return {
        id: 'push-1',
        type: 'PushEvent',
        created_at: '2026-08-02T11:02:00Z',
        payload: {
            commits: [{ sha: 'a1b2c3d', message: 'Add sort-by-priority to todo list' }],
        },
        ...overrides,
    };
}

function pullRequestEvent(overrides: Partial<RawRepoEvent> = {}): RawRepoEvent {
    return {
        id: 'pr-1',
        type: 'PullRequestEvent',
        created_at: '2026-08-02T14:14:00Z',
        payload: {
            action: 'opened',
            pull_request: {
                number: 42,
                title: 'Fix overdue badge on list cards',
                merged: false,
                head: { ref: 'fix/overdue-badge' },
            },
        },
        ...overrides,
    };
}

function createBranchEvent(overrides: Partial<RawRepoEvent> = {}): RawRepoEvent {
    return {
        id: 'create-1',
        type: 'CreateEvent',
        created_at: '2026-08-01T16:30:00Z',
        payload: { ref: 'feature/kanban-drag', ref_type: 'branch' },
        ...overrides,
    };
}

function vercelDeployment(overrides: Partial<RawVercelDeployment> = {}): RawVercelDeployment {
    return {
        uid: 'dpl_1',
        url: 'tickup-git-fix-overdue-badge-greg-fields-projects.vercel.app',
        readyState: 'READY',
        createdAt: Date.parse('2026-08-02T15:00:00Z'),
        meta: { githubCommitRef: 'fix/overdue-badge' },
        ...overrides,
    };
}

describe('normalizeEvent', () => {
    it('maps a PushEvent to one commit entry per commit', () => {
        const event = pushEvent({
            payload: {
                commits: [
                    { sha: 'sha1', message: 'First commit\n\nlonger body' },
                    { sha: 'sha2', message: 'Second commit' },
                ],
            },
        });

        const result = normalizeEvent(event, REPO);

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({
            id: 'push-1-0',
            type: 'commit',
            summary: 'First commit',
            url: `https://github.com/${REPO}/commit/sha1`,
        });
        expect(result[1]).toMatchObject({
            id: 'push-1-1',
            type: 'commit',
            summary: 'Second commit',
            url: `https://github.com/${REPO}/commit/sha2`,
        });
    });

    it('maps an opened PullRequestEvent to a pr entry', () => {
        const [result] = normalizeEvent(pullRequestEvent(), REPO);

        expect(result).toMatchObject({
            type: 'pr',
            summary: 'Opened PR: #42',
            url: `https://github.com/${REPO}/pull/42`,
        });
    });

    it('maps a merged PullRequestEvent to a "Merged PR" entry', () => {
        const event = pullRequestEvent({
            payload: {
                action: 'closed',
                pull_request: {
                    number: 41,
                    title: 'Search full-text index',
                    merged: true,
                    head: { ref: 'feature/search-index' },
                },
            },
        });

        const [result] = normalizeEvent(event, REPO);

        expect(result.summary).toBe('Merged PR: #41');
    });

    it('drops a closed-but-not-merged PullRequestEvent', () => {
        const event = pullRequestEvent({
            payload: {
                action: 'closed',
                pull_request: {
                    number: 99,
                    title: 'Abandoned change',
                    merged: false,
                    head: { ref: 'feature/abandoned' },
                },
            },
        });

        expect(normalizeEvent(event, REPO)).toEqual([]);
    });

    it('maps a branch CreateEvent to a branch entry', () => {
        const [result] = normalizeEvent(createBranchEvent(), REPO);

        expect(result).toMatchObject({
            type: 'branch',
            summary: 'Created branch feature/kanban-drag',
            url: `https://github.com/${REPO}/tree/feature/kanban-drag`,
        });
    });

    it('drops a tag CreateEvent', () => {
        const event = createBranchEvent({ payload: { ref: 'v1.0.0', ref_type: 'tag' } });

        expect(normalizeEvent(event, REPO)).toEqual([]);
    });

    it('drops event types it does not understand', () => {
        const event: RawRepoEvent = {
            id: 'watch-1',
            type: 'WatchEvent',
            created_at: '2026-08-02T10:00:00Z',
            payload: {},
        };

        expect(normalizeEvent(event, REPO)).toEqual([]);
    });

    it('drops events with no created_at', () => {
        const event = pushEvent({ created_at: null });

        expect(normalizeEvent(event, REPO)).toEqual([]);
    });
});

describe('normalizeVercelDeployment', () => {
    it('maps a READY deployment to a deployment entry', () => {
        const result = normalizeVercelDeployment(vercelDeployment());

        expect(result).toMatchObject({
            type: 'deployment',
            summary: 'Deployment: ready',
            url: 'https://tickup-git-fix-overdue-badge-greg-fields-projects.vercel.app',
        });
    });

    it('prefers inspectorUrl (Vercel dashboard link) over the deployed site url', () => {
        const result = normalizeVercelDeployment(
            vercelDeployment({
                inspectorUrl:
                    'https://vercel.com/greg-fields-projects/tickup/4AMr8F1MShYG1v581TGNzeVgg5am',
            }),
        );

        expect(result?.url).toBe(
            'https://vercel.com/greg-fields-projects/tickup/4AMr8F1MShYG1v581TGNzeVgg5am',
        );
    });

    it('maps an ERROR deployment to a deployment entry', () => {
        const result = normalizeVercelDeployment(vercelDeployment({ readyState: 'ERROR' }));

        expect(result?.summary).toBe('Deployment: error');
    });

    it('drops a BUILDING deployment (not a terminal state)', () => {
        expect(normalizeVercelDeployment(vercelDeployment({ readyState: 'BUILDING' }))).toBeNull();
    });

    it('drops a QUEUED deployment (not a terminal state)', () => {
        expect(normalizeVercelDeployment(vercelDeployment({ readyState: 'QUEUED' }))).toBeNull();
    });

    it('drops a deployment with no createdAt/created timestamp', () => {
        const deployment = vercelDeployment({ createdAt: undefined, created: undefined });

        expect(normalizeVercelDeployment(deployment)).toBeNull();
    });

    it('falls back to the "state" field when "readyState" is absent', () => {
        const deployment = vercelDeployment({ readyState: undefined, state: 'READY' });

        expect(normalizeVercelDeployment(deployment)?.summary).toBe('Deployment: ready');
    });

    describe('branch scoping', () => {
        it('keeps a deployment whose githubCommitRef matches the branch', () => {
            const result = normalizeVercelDeployment(vercelDeployment(), 'fix/overdue-badge');

            expect(result).not.toBeNull();
        });

        it('drops a deployment whose githubCommitRef does not match the branch', () => {
            const result = normalizeVercelDeployment(vercelDeployment(), 'main');

            expect(result).toBeNull();
        });

        it('keeps any-branch deployments when no branch filter is given', () => {
            const result = normalizeVercelDeployment(vercelDeployment());

            expect(result).not.toBeNull();
        });
    });
});

describe('buildActivityFeed', () => {
    it('sorts merged events newest-first regardless of input order', () => {
        const oldest = createBranchEvent(); // 2026-08-01T16:30:00Z
        const middle = pushEvent(); // 2026-08-02T11:02:00Z
        const newest = pullRequestEvent(); // 2026-08-02T14:14:00Z

        const feed = buildActivityFeed([oldest, newest, middle], REPO);

        expect(feed.map((e) => e.id)).toEqual([newest.id, `${middle.id}-0`, oldest.id]);
    });

    it('caps the feed at 40 events', () => {
        const events: RawRepoEvent[] = Array.from({ length: 50 }, (_, i) =>
            createBranchEvent({
                id: `create-${i}`,
                payload: { ref: `branch-${i}`, ref_type: 'branch' },
                created_at: new Date(2026, 0, 1, 0, i).toISOString(),
            }),
        );

        const feed = buildActivityFeed(events, REPO);

        expect(feed).toHaveLength(40);
    });

    it('flattens and filters across mixed event types', () => {
        const feed = buildActivityFeed(
            [
                createBranchEvent(),
                pushEvent(),
                pullRequestEvent(),
                { ...pushEvent(), type: 'WatchEvent' },
            ],
            REPO,
        );

        expect(feed.map((e) => e.type)).toEqual(['pr', 'commit', 'branch']);
    });

    describe('branch scoping', () => {
        it('keeps a PushEvent whose ref matches the branch and drops others', () => {
            const onBranch = pushEvent({
                payload: {
                    ref: 'refs/heads/feature/x',
                    commits: [{ sha: 'sha1', message: 'On branch' }],
                },
            });
            const offBranch = pushEvent({
                id: 'push-2',
                payload: { ref: 'refs/heads/main', commits: [{ sha: 'sha2', message: 'On main' }] },
            });

            const feed = buildActivityFeed([onBranch, offBranch], REPO, 'feature/x');

            expect(feed.map((e) => e.summary)).toEqual(['On branch']);
        });

        it('keeps a PullRequestEvent whose head ref matches the branch and drops others', () => {
            const onBranch = pullRequestEvent();
            const offBranch = pullRequestEvent({
                id: 'pr-2',
                payload: {
                    action: 'opened',
                    pull_request: {
                        number: 43,
                        title: 'Other',
                        merged: false,
                        head: { ref: 'other-branch' },
                    },
                },
            });

            const feed = buildActivityFeed([onBranch, offBranch], REPO, 'fix/overdue-badge');

            expect(feed.map((e) => e.id)).toEqual(['pr-1']);
        });

        it('keeps a branch CreateEvent whose ref matches the branch and drops a tag CreateEvent', () => {
            const branchCreated = createBranchEvent();
            const tagCreated = createBranchEvent({
                id: 'create-2',
                payload: { ref: 'feature/kanban-drag', ref_type: 'tag' },
            });
            const otherBranch = createBranchEvent({
                id: 'create-3',
                payload: { ref: 'other-branch', ref_type: 'branch' },
            });

            const feed = buildActivityFeed(
                [branchCreated, tagCreated, otherBranch],
                REPO,
                'feature/kanban-drag',
            );

            expect(feed.map((e) => e.id)).toEqual(['create-1']);
        });

        it('returns the unfiltered repo-wide feed when no branch is given', () => {
            const feed = buildActivityFeed(
                [createBranchEvent(), pushEvent(), pullRequestEvent()],
                REPO,
            );

            expect(feed).toHaveLength(3);
        });
    });
});
