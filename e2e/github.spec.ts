import { test, expect } from '@playwright/test';

test.describe('GitHub API', () => {
    test('github endpoint errors with no branch name', async ({ request }) => {
        const response = await request.get('/api/github', {
            headers: {
                'x-test-mode': 'true',
            },
        });

        expect(response.status()).toBe(400);
        const data = await response.json();
        expect(data.message).toBe('Missing branchName in query parameters');
    });

    test('github endpoint returns 404 when branch name is provided', async ({ request }) => {
        const response = await request.get('/api/github', {
            params: { branchName: 'here' },
            headers: {
                'x-test-mode': 'true',
            },
        });
        expect(response.status()).toBe(404);
    });

    test('github endpoint returns 200 when branch name is provided', async ({ request }) => {
        const response = await request.get('/api/github', {
            params: { branchName: 'main' },
            headers: {
                'x-test-mode': 'true',
            },
        });
        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data.name).toBe('main');
        expect(data.commit.sha).toBe('test-sha');
    });
});
