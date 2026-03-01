import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

// Ensures that the "Default View" dropdown on the list settings page
// controls which tab (board/list) a list opens with by default.

test.describe('list default view setting', () => {
    test('changing default view to board opens list on board tab', async ({ page, isMobile }) => {
        test.skip(isMobile, 'List settings layout is desktop only');

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const url = page.url();
        if (url.includes('/login')) {
            throw new Error('Not authenticated - redirected to login page');
        }

        const testId = uuidv4();
        const listName = `List ${testId}`;

        // Create a list
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

        // Open list settings via the list menu
        const settingsButton = page.locator(`[data-testid="setting-button-${listId}"]`);
        await expect(settingsButton).toBeVisible();
        await settingsButton.click();

        const listSettingsItem = page.getByText('List Settings', { exact: true });
        await expect(listSettingsItem).toBeVisible();
        await listSettingsItem.click();

        await page.waitForURL(new RegExp(`/list/${listId}/settings`));
        await page.waitForLoadState('networkidle');

        // Select "board" as the default view
        const defaultViewSelect = page.getByTestId('list-default-view-select');
        await expect(defaultViewSelect).toBeVisible();
        await defaultViewSelect.click();

        const boardOption = page.getByRole('option', { name: 'board' });
        await expect(boardOption).toBeVisible();
        await boardOption.click();

        // Save settings (this persists defaultView on the list)
        const saveRequestPromise = page.waitForRequest(request =>
            request.url().includes(`/api/list/${listId}`) && request.method() === 'PUT',
        );
        const saveButton = page.getByRole('button', { name: 'Save' });
        await saveButton.click();
        await saveRequestPromise;

        // Navigate back to the list page
        await page.goto(`/list/${listId}`);
        await page.waitForLoadState('networkidle');

        // Verify that the board tab is selected by default
        const boardTab = page.getByRole('tab', { name: 'board' });
        await expect(boardTab).toHaveAttribute('aria-selected', 'true');
    });
});
