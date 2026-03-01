import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('list settings GitHub column', () => {
    test('shows GitHub integration column on list settings page', async ({ page, isMobile }) => {
        test.skip(isMobile, 'List settings layout is desktop only');

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const url = page.url();
        if (url.includes('/login')) {
            throw new Error('Not authenticated - redirected to login page');
        }

        const testId = uuidv4();
        const listName = `List ${testId}`;

        const newListButton = await page.getByTestId('new-list-button');
        await newListButton.click();

        const newListInput = await page.getByRole('textbox', { name: 'New List' });
        await newListInput.type(listName);

        const createResponse = page.waitForResponse(response =>
            response.url().includes('/api/list') && response.request().method() === 'POST',
        );
        await page.keyboard.press('Enter');
        const response = await createResponse;
        const listData = await response.json();
        const listId = listData.id;

        await page.waitForTimeout(500);

        const newListNavItem = await page.locator(`[data-test-id="${listName}"]`);
        await expect(newListNavItem).toBeVisible();

        const settingsButton = page.locator(`[data-testid="setting-button-${listId}"]`);
        await expect(settingsButton).toBeVisible();
        await settingsButton.click();

        const listSettingsItem = page.getByText('List Settings', { exact: true });
        await expect(listSettingsItem).toBeVisible();
        await listSettingsItem.click();

        await page.waitForURL(new RegExp(`/list/${listId}/settings`));
        await page.waitForLoadState('networkidle');

        const githubColumn = page.getByTestId('list-settings-github-column');
        await expect(githubColumn).toBeVisible();
        await expect(githubColumn.getByText('GitHub Integration')).toBeVisible();

        // The column should contain the repo selector label
        await expect(githubColumn.getByText('Repository')).toBeVisible();
    });
});
