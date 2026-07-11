import { test, expect } from '../fixtures/index';

test.describe('Settings page', () => {
    test.beforeEach(async ({ request, isMobile }) => {
        test.skip(isMobile, 'Settings sections are desktop only');
        await request.put('/api/settings', { data: { statuses: [] } });
    });

    test.afterEach(async ({ request, isMobile }) => {
        test.skip(isMobile, 'Settings sections are desktop only');
        await request.put('/api/settings', { data: { statuses: [] } });
    });

    test('shows Statuses, Integrations, and Account sections', async ({ page }) => {
        await page.goto('/settings');
        await page.waitForLoadState('networkidle');

        // The settings sidebar links to each section - "Statuses" is now
        // labelled "Workflow" but still governs status configuration.
        await expect(page.getByText('Workflow', { exact: false })).toBeVisible();
        await expect(page.getByText('Integrations', { exact: false })).toBeVisible();
        await expect(page.getByText('Account', { exact: false })).toBeVisible();
    });

    test('shows GitHub Integration item', async ({ page }) => {
        await page.goto('/settings/integrations');
        await page.waitForLoadState('networkidle');

        await expect(page.getByText('GitHub')).toBeVisible();
    });

    test('shows Sign Out button', async ({ page }) => {
        await page.goto('/settings/account');
        await page.waitForLoadState('networkidle');

        await expect(page.getByText('Sign out')).toBeVisible();
    });

    test('can add a new status and save it', async ({ page }) => {
        await page.goto('/settings/workflow');
        await page.waitForLoadState('networkidle');

        await page.getByRole('button', { name: /add status/i }).click();

        const input = page.locator('.v-main').getByRole('textbox').last();
        await input.waitFor({ state: 'visible' });
        await input.fill('In Review');

        await Promise.all([
            page.waitForResponse(
                r => r.url().includes('/api/settings') && r.request().method() === 'PUT',
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

        await page.goto('/settings/workflow');
        await page.waitForLoadState('networkidle');

        const statusRow = page.locator('.status-row').filter({ hasText: 'Test Status' });
        await expect(statusRow).toBeVisible();

        // The delete button is only visible while its row is hovered.
        await statusRow.hover();
        await statusRow.locator('.status-row__delete').click();

        await expect(page.getByText('Test Status')).not.toBeVisible();
    });
});
