import { describe, expect, it } from 'vitest';
import {
    buildActivityFeed,
    normalizeEvent,
    type RawRepoEvent,
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
                title: 'Fix overdue badge on list cards',
                html_url: `https://github.com/${REPO}/pull/42`,
                merged: false,
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
            summary: 'Opened PR: Fix overdue badge on list cards',
            url: `https://github.com/${REPO}/pull/42`,
        });
    });

    it('maps a merged PullRequestEvent to a "Merged PR" entry', () => {
        const event = pullRequestEvent({
            payload: {
                action: 'closed',
                pull_request: {
                    title: 'Search full-text index',
                    html_url: `https://github.com/${REPO}/pull/41`,
                    merged: true,
                },
            },
        });

        const [result] = normalizeEvent(event, REPO);

        expect(result.summary).toBe('Merged PR: Search full-text index');
    });

    it('drops a closed-but-not-merged PullRequestEvent', () => {
        const event = pullRequestEvent({
            payload: {
                action: 'closed',
                pull_request: {
                    title: 'Abandoned change',
                    html_url: `https://github.com/${REPO}/pull/99`,
                    merged: false,
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
});
