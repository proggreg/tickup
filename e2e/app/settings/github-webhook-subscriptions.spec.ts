import { test, expect } from '@playwright/test';

test.describe('GitHub webhook subscription settings menu', () => {
    test('a user can update repo webhook subscriptions from the settings menu', async ({ page, isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');

        const mockedRepos = [
            {
                id: 1,
                name: 'repo-one',
                full_name: 'acme/repo-one',
                private: false,
                html_url: 'https://github.com/acme/repo-one',
                description: 'Repo one',
                language: 'TypeScript',
                default_branch: 'main',
                updated_at: new Date().toISOString(),
            },
            {
                id: 2,
                name: 'repo-two',
                full_name: 'acme/repo-two',
                private: true,
                html_url: 'https://github.com/acme/repo-two',
                description: 'Repo two',
                language: 'Vue',
                default_branch: 'main',
                updated_at: new Date().toISOString(),
            },
        ];

        await page.route('**/api/github/check', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: 'true',
            });
        });

        await page.route('**/api/github/repos', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ repositories: mockedRepos }),
            });
        });

        await page.route('**/api/github/webhook-subscriptions', async (route) => {
            const request = route.request();

            if (request.method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ subscriptions: ['acme/repo-one'] }),
                });
                return;
            }

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true }),
            });
        });

        await page.goto('/settings/github');
        await page.waitForLoadState('networkidle');

        await page.getByTestId('github-webhook-settings-menu-button').click();

        const repoOneSwitch = page.getByTestId('github-webhook-switch-acme-repo-one');
        const repoTwoSwitch = page.getByTestId('github-webhook-switch-acme-repo-two');

        await expect(repoOneSwitch).toHaveAttribute('data-subscribed', 'true');
        await expect(repoTwoSwitch).toHaveAttribute('data-subscribed', 'false');

        await repoTwoSwitch.click();
        await expect(repoTwoSwitch).toHaveAttribute('data-subscribed', 'true');

        const saveRequestPromise = page.waitForRequest(request =>
            request.url().includes('/api/github/webhook-subscriptions') && request.method() === 'PUT',
        );

        await page.getByTestId('github-webhook-save-button').click();

        const saveRequest = await saveRequestPromise;
        const payload = saveRequest.postDataJSON() as { subscriptions: string[] };
        expect(payload.subscriptions.sort()).toEqual(['acme/repo-one', 'acme/repo-two'].sort());

        await expect(page.getByTestId('github-webhook-subscriptions-saved')).not.toBeHidden();
    });

    test('a user can subscribe directly from a repository row', async ({ page, isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');

        const mockedRepos = [{
            id: 1,
            name: 'repo-one',
            full_name: 'acme/repo-one',
            private: false,
            html_url: 'https://github.com/acme/repo-one',
            description: 'Repo one',
            language: 'TypeScript',
            default_branch: 'main',
            updated_at: new Date().toISOString(),
        }];

        await page.route('**/api/github/check', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: 'true',
            });
        });

        await page.route('**/api/github/repos', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ repositories: mockedRepos }),
            });
        });

        await page.route('**/api/github/webhook-subscriptions', async (route) => {
            const request = route.request();

            if (request.method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ subscriptions: [] }),
                });
                return;
            }

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true }),
            });
        });

        await page.goto('/settings/github');
        await page.waitForLoadState('networkidle');

        const toggleButton = page.getByTestId('github-webhook-toggle-button-acme-repo-one');
        await expect(toggleButton).toContainText('Subscribe');

        const saveRequestPromise = page.waitForRequest(request =>
            request.url().includes('/api/github/webhook-subscriptions') && request.method() === 'PUT',
        );

        await toggleButton.click();

        const saveRequest = await saveRequestPromise;
        const payload = saveRequest.postDataJSON() as { subscriptions: string[] };
        expect(payload.subscriptions).toEqual(['acme/repo-one']);

        await expect(page.getByTestId('github-webhook-status-chip').first()).toContainText('Subscribed');
        await expect(toggleButton).toContainText('Unsubscribe');
    });

    test('shows an error when saving webhook subscriptions fails', async ({ page, isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');

        await page.route('**/api/github/check', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: 'true',
            });
        });

        await page.route('**/api/github/repos', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    repositories: [{
                        id: 1,
                        name: 'repo-one',
                        full_name: 'acme/repo-one',
                        private: false,
                        html_url: 'https://github.com/acme/repo-one',
                        description: 'Repo one',
                        language: 'TypeScript',
                        default_branch: 'main',
                        updated_at: new Date().toISOString(),
                    }],
                }),
            });
        });

        await page.route('**/api/github/webhook-subscriptions', async (route) => {
            const request = route.request();
            if (request.method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ subscriptions: ['acme/repo-one'] }),
                });
                return;
            }

            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Failed to persist subscriptions' }),
            });
        });

        await page.goto('/settings/github');
        await page.waitForLoadState('networkidle');

        await page.getByTestId('github-webhook-settings-menu-button').click();
        await page.getByTestId('github-webhook-save-button').click();

        await expect(page.getByTestId('github-webhook-subscriptions-error')).not.toBeHidden();
    });
});
