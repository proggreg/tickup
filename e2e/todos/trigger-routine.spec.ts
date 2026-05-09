import { test, expect } from '../fixtures/index';

test('trigger routine button appears on todo detail', async ({ page, listAPI }) => {
    const list = await listAPI.new({ name: 'Test List', listType: 'simple' });
    const todoResponse = await page.request.post('/api/todo', {
        data: {
            name: 'Test Todo',
            listId: list.id,
        },
    });
    const todo = (await todoResponse.json()) as Todo;

    await page.goto(`/todo/${todo.id}`);
    await expect(page.locator('[data-testid="trigger-routine-button"]')).toBeVisible();
});

test('trigger routine button is clickable', async ({ page, listAPI }) => {
    const list = await listAPI.new({ name: 'Test List', listType: 'simple' });
    const todoResponse = await page.request.post('/api/todo', {
        data: {
            name: 'Test Todo',
            listId: list.id,
        },
    });
    const todo = (await todoResponse.json()) as Todo;

    await page.goto(`/todo/${todo.id}`);

    const button = page.locator('[data-testid="trigger-routine-button"]');
    await expect(button).toBeEnabled();
    await expect(button).toContainText('Trigger Claude Routine');
});

test('shows notification when button clicked', async ({ page, listAPI }) => {
    const list = await listAPI.new({ name: 'Test List', listType: 'simple' });
    const todoResponse = await page.request.post('/api/todo', {
        data: {
            name: 'Test Todo',
            listId: list.id,
        },
    });
    const todo = (await todoResponse.json()) as Todo;

    // Mock the trigger API to return success
    await page.route(`**/api/todo/${todo.id}/trigger-routine`, (route) => {
        route.fulfill({
            status: 200,
            body: JSON.stringify({
                success: true,
                message: 'Routine triggered successfully',
                todoId: todo.id,
            }),
        });
    });

    await page.goto(`/todo/${todo.id}`);

    const button = page.locator('[data-testid="trigger-routine-button"]');
    await button.click();

    // Check for notification
    const notification = page.locator('.v-snackbar');
    await expect(notification).toBeVisible({ timeout: 5000 });
    await expect(notification).toContainText('triggered successfully');
});

test('handles API error gracefully', async ({ page, listAPI }) => {
    const list = await listAPI.new({ name: 'Test List', listType: 'simple' });
    const todoResponse = await page.request.post('/api/todo', {
        data: {
            name: 'Test Todo',
            listId: list.id,
        },
    });
    const todo = (await todoResponse.json()) as Todo;

    // Mock the trigger API to return error
    await page.route(`**/api/todo/${todo.id}/trigger-routine`, (route) => {
        route.fulfill({
            status: 500,
            body: JSON.stringify({
                statusMessage: 'Claude API key not configured',
            }),
        });
    });

    await page.goto(`/todo/${todo.id}`);

    const button = page.locator('[data-testid="trigger-routine-button"]');
    await button.click();

    // Should show error notification
    const notification = page.locator('.v-snackbar');
    await expect(notification).toBeVisible({ timeout: 5000 });
    await expect(notification).toContainText('not configured');
});
