import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('a user can delete a list', () => {
    let listName: string;
    let listId: string;

    test.beforeEach(async ({ page, isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');
        await page.goto('/');

        const testId = uuidv4();
        listName = `List ${testId}`;

        const newListButton = page.getByTestId('new-list-button');
        await newListButton.click();

        const newListInput = page.getByRole('textbox', { name: 'New List' });
        await newListInput.type(listName);

        const [createResponse] = await Promise.all([
            page.waitForResponse(
                r => r.url().includes('/api/list') && r.request().method() === 'POST',
            ),
            page.keyboard.press('Enter'),
        ]);

        expect(createResponse.status()).toBeLessThan(400);
        const created = await createResponse.json();
        listId = created.id;
    });

    test('using the settings menu', async ({ page, request }) => {
        await page.waitForLoadState('networkidle');

        const newListNavItem = page.locator(`[data-test-id="${listName}"]`);
        await expect(newListNavItem).toBeVisible();

        expect(listId).toBeTruthy();

        const listExistsResponse = await request.get(`/list/${listId}`);

        expect(listExistsResponse.status()).toBe(200);

        const settingsButton = page.locator(`[data-testid="setting-button-${listId}"]`);
        await settingsButton.click();

        // Opens a context menu with a "Delete" item; selecting it reveals a
        // confirmation dialog with the actual delete action.
        const deleteMenuItem = page.getByTestId('delete-list-menu-item');
        await expect(deleteMenuItem).toBeVisible();
        await deleteMenuItem.click();

        const confirmDeleteButton = page.getByTestId('delete-list');
        await expect(confirmDeleteButton).toBeVisible();

        await Promise.all([
            page.waitForResponse((r) => {
                const isDelete
                    = r.url().includes('/api/list/') && r.request().method() === 'DELETE';
                if (isDelete) {
                    console.log('DELETE request URL:', r.url());
                    console.log('DELETE response status:', r.status());
                }
                return isDelete;
            }),
            confirmDeleteButton.click(),
        ]);

        await page.waitForLoadState('networkidle');

        await page.waitForURL(/^http:\/\/localhost:3000\/?$/);

        const response = await request.get(`/api/list/${listId}`);
        expect(response.status()).toBe(404);
    });
});
