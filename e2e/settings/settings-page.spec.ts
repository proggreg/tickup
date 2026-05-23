import { test, expect } from '../fixtures/index';

test.describe('Settings page', () => {
    test.beforeEach(async ({ request }) => {
        await request.put('/api/settings', { data: { statuses: [] } });
    });

    test.afterEach(async ({ request }) => {
        await request.put('/api/settings', { data: { statuses: [] } });
    });

    test('shows Statuses, Integrations, and Account sections', async ({ page }) => {
        await page.goto('/settings');
        await page.waitForLoadState('networkidle');

        await expect(page.getByText('Statuses', { exact: false })).toBeVisible();
        await expect(page.getByText('Integrations', { exact: false })).toBeVisible();
        await expect(page.getByText('Account', { exact: false })).toBeVisible();
    });

    test('shows GitHub Integration item', async ({ page }) => {
        await page.goto('/settings');
        await page.waitForLoadState('networkidle');

        await expect(page.getByText('GitHub Integration')).toBeVisible();
    });

    test('shows Sign Out button', async ({ page }) => {
        await page.goto('/settings');
        await page.waitForLoadState('networkidle');

        await expect(page.getByText('Sign Out')).toBeVisible();
    });

    test('can add a new status and save it', async ({ page }) => {
        await page.goto('/settings');
        await page.waitForLoadState('networkidle');

        await page.getByRole('button', { name: /add status/i }).click();

        const input = page.locator('.v-main').getByRole('textbox').last();
        await input.waitFor({ state: 'visible' });
        await input.fill('In Review');

        await Promise.all([
            page.waitForResponse(
                (r) => r.url().includes('/api/settings') && r.request().method() === 'PUT',
            ),
            page.getByRole('button', { name: /save/i }).click(),
        ]);

        await page.reload();
        await page.waitForLoadState('networkidle');

        await expect(page.getByText('In Review')).toBeVisible();
    });

    test('can delete a status', async ({ page, request }) => {
        await request.put('/api/settings', {
            data: {
                statuses: [
                    { name: 'Open', color: '#87909e' },
                    { name: 'Test Status', color: '#ff0000' },
                    { name: 'Closed', color: '#008844' },
                ],
            },
        });

        await page.goto('/settings');
        await page.waitForLoadState('networkidle');

        await expect(page.getByText('Test Status')).toBeVisible();

        await page.locator('.v-main button:has(.mdi-dots-vertical)').first().click();
        await page.getByText('Delete').click();

        await expect(page.getByText('Test Status')).not.toBeVisible();
    });
});
