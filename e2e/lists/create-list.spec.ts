import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('a user can create a list', () => {
    test('using the desktop navigation menu', async ({ page, isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');
        await page.goto('/');

        await page.waitForLoadState('networkidle');

        const url = page.url();
        if (url.includes('/login')) {
            throw new Error('Not authenticated - redirected to login page');
        }
        const newListButton = await page.getByTestId('new-list-button');
        newListButton.click();

        const testId = uuidv4();
        const listName = `List ${testId}`;
        const newListInput = await page.getByRole('textbox', { name: 'New List' });
        await newListInput.type(listName);
        const requestPromise = page.waitForRequest(request =>
            request.url().includes('/api/list') && request.method() === 'POST',
        );
        await page.keyboard.press('Enter');
        await requestPromise;

        await page.waitForTimeout(500);

        const newListDialogTitle = await page.locator('div').filter({ hasText: 'New List' }).nth(4);
        expect(newListDialogTitle).toBeHidden();
        const newListNavItem = await page.locator(`[data-test-id="${listName}"]`);

        expect(newListNavItem).not.toBeHidden();
    });

    test('using the keyboard shortcut', async ({ page, isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');
        await page.goto('/');

        await page.waitForLoadState('networkidle');
        const url = page.url();

        if (url.includes('/login')) {
            throw new Error('Not authenticated - redirected to login page');
        }
        await page.keyboard.press('l');
        await page.waitForTimeout(500);

        const newListDialogTitle = await page.locator('div').filter({ hasText: 'New List' }).nth(4);
        expect(newListDialogTitle).not.toBeHidden();

        const testId = uuidv4();
        const listName = `List ${testId}`;
        const newListInput = await page.getByRole('textbox', { name: 'New List' });
        await newListInput.type(listName);
        const requestPromise = page.waitForRequest(request =>
            request.url().includes('/api/list') && request.method() === 'POST',
        );
        await page.keyboard.press('Enter');

        await requestPromise;
        await page.waitForTimeout(500);

        expect(newListDialogTitle).toBeHidden();

        const newListNavItem = await page.locator(`[data-test-id="${listName}"]`);

        expect(newListNavItem).not.toBeHidden();
    });
});
