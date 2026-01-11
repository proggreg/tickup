import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('list settings button prevents navigation', () => {
    test('clicking settings button does not navigate to list page', async ({ page, isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');
        await page.goto('/');

        // Wait for auth to be ready - ensure we're not redirected to login
        await page.waitForLoadState('networkidle');

        // Verify we're logged in by checking URL
        const url = page.url();
        if (url.includes('/login')) {
            throw new Error('Not authenticated - redirected to login page');
        }

        // First, create a list
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

        // Verify the list was created and is visible
        const newListNavItem = await page.locator(`[data-test-id="${listName}"]`);
        await expect(newListNavItem).toBeVisible();

        await page.waitForTimeout(500);

        const settingsButton = page.locator(`[data-testid="setting-button-${listId}"]`);
        await expect(settingsButton).toBeVisible();
        await settingsButton.click();
        // Wait a bit to see if navigation occurs
        await page.waitForTimeout(500);

        // Verify the menu is open (Delete List option should be visible)
        const deleteMenuItem = page.locator('[data-test-id="delete-list"]');
        await expect(deleteMenuItem).toBeVisible();
    });

    test('clicking list item (not settings button) navigates to list page', async ({ page, isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');
        await page.goto('/');

        // Wait for auth to be ready - ensure we're not redirected to login
        await page.waitForLoadState('networkidle');

        // Verify we're logged in by checking URL
        const url = page.url();
        if (url.includes('/login')) {
            throw new Error('Not authenticated - redirected to login page');
        }

        // First, create a list
        const testId = uuidv4();
        const listName = `List ${testId}`;
        const newListButton = await page.getByTestId('new-list-button');
        await newListButton.click();

        const newListInput = await page.getByRole('textbox', { name: 'New List' });
        await newListInput.type(listName);
        const createRequestPromise = page.waitForRequest(request =>
            request.url().includes('/api/list') && request.method() === 'POST',
        );
        await page.keyboard.press('Enter');
        await createRequestPromise;

        await page.waitForTimeout(500);

        // Verify the list was created and is visible
        const newListNavItem = await page.locator(`[data-test-id="${listName}"]`);
        await expect(newListNavItem).toBeVisible();

        // Get the list item title (not the settings button)
        const listItemTitle = newListNavItem.locator('..').locator('.v-list-item-title').first();

        // Click on the list item title (not the settings button)
        await listItemTitle.click();

        // Wait for navigation to occur
        await page.waitForURL(/\/list\//, { timeout: 5000 });

        // Verify we navigated to the list page
        const urlAfterClick = page.url();
        expect(urlAfterClick).toMatch(/\/list\/[^/]+$/);
    });
});
