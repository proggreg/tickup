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
        const createRequestPromise = page.waitForRequest(request =>
            request.url().includes('/api/list') && request.method() === 'POST',
        );
        await page.keyboard.press('Enter');
        await createRequestPromise;

        await page.waitForTimeout(500);

        // Verify the list was created and is visible
        const newListNavItem = await page.locator(`[data-test-id="${listName}"]`);
        await expect(newListNavItem).toBeVisible();

        // Get the current URL before clicking settings button
        const urlBeforeClick = page.url();

        // Hover over the list item to make the settings button visible
        await newListNavItem.hover();
        await page.waitForTimeout(200);

        // Find the settings button by looking for the icon within the list item's container
        const listItemContainer = newListNavItem.locator('xpath=ancestor::div[contains(@class, "v-list-item")]');
        const iconWithDots = listItemContainer.locator('i.mdi-dots-vertical');
        await expect(iconWithDots).toBeVisible();

        // Get the button that contains this icon
        const settingsButton = iconWithDots.locator('xpath=ancestor::button').first();

        // Set up a navigation watcher to detect if navigation occurs
        let navigationOccurred = false;
        const navigationPromise = page.waitForURL(/\/list\//, { timeout: 1000 }).catch(() => {
            // Navigation didn't occur, which is what we want
        });

        // Click the settings button
        await settingsButton.click();

        // Wait a bit to see if navigation occurs
        await page.waitForTimeout(500);

        // Check if navigation occurred
        try {
            await navigationPromise;
            navigationOccurred = true;
        }
        catch {
            navigationOccurred = false;
        }

        // Verify navigation did NOT occur - URL should be the same
        const urlAfterClick = page.url();
        expect(urlAfterClick).toBe(urlBeforeClick);
        expect(navigationOccurred).toBe(false);

        // Verify the menu is open (Delete List option should be visible)
        const deleteMenuItem = page.getByRole('menuitem', { name: 'Delete List' });
        await expect(deleteMenuItem).toBeVisible();

        // Verify we're still on the home page (not on a list page)
        expect(urlAfterClick).toMatch(/^http:\/\/localhost:3000\/?$/);
        expect(urlAfterClick).not.toMatch(/\/list\//);
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
