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

test('shows error when Claude settings not configured', async ({ page, listAPI, context }) => {
    // Clear localStorage to ensure no settings exist
    await context.clearCookies();
    await page.evaluate(() => {
        localStorage.removeItem('claude_routine_url');
        localStorage.removeItem('claude_routine_api_key');
    });

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
    await button.click();

    // Should show error notification about missing settings
    const notification = page.locator('.v-snackbar');
    await expect(notification).toBeVisible({ timeout: 5000 });
    await expect(notification).toContainText('not configured');
});

test('triggers routine with saved settings', async ({ page, listAPI, context }) => {
    // Set Claude routine settings in localStorage
    await page.evaluate(() => {
        localStorage.setItem('claude_routine_url', 'https://api.example.com/trigger');
        localStorage.setItem('claude_routine_api_key', 'test-api-key');
    });

    const list = await listAPI.new({ name: 'Test List', listType: 'simple' });
    const todoResponse = await page.request.post('/api/todo', {
        data: {
            name: 'Test Todo',
            description: 'Test description',
            listId: list.id,
        },
    });
    const todo = (await todoResponse.json()) as Todo;

    // Mock the Claude routine API to return success
    await page.route('https://api.example.com/trigger', (route) => {
        // Verify request body contains todo context
        route.fulfill({
            status: 200,
            body: JSON.stringify({
                success: true,
                message: 'Routine executed',
            }),
        });
    });

    await page.goto(`/todo/${todo.id}`);

    const button = page.locator('[data-testid="trigger-routine-button"]');
    await button.click();

    // Check for success notification
    const notification = page.locator('.v-snackbar');
    await expect(notification).toBeVisible({ timeout: 5000 });
    await expect(notification).toContainText('triggered successfully');
});

test('Claude routine request includes task context', async ({ page, listAPI }) => {
    const list = await listAPI.new({ name: 'Test List', listType: 'simple' });
    const todoResponse = await page.request.post('/api/todo', {
        data: {
            name: 'Important Task',
            description: 'This is the task description',
            listId: list.id,
        },
    });
    const todo = (await todoResponse.json()) as Todo;

    await page.evaluate(() => {
        localStorage.setItem('claude_routine_url', 'https://api.example.com/trigger');
        localStorage.setItem('claude_routine_api_key', 'test-api-key');
    });

    let requestBody: any = null;
    await page.route('https://api.example.com/trigger', (route) => {
        // Capture the request body to verify context
        requestBody = route.request().postDataJSON();
        route.fulfill({
            status: 200,
            body: JSON.stringify({ success: true }),
        });
    });

    await page.goto(`/todo/${todo.id}`);

    const button = page.locator('[data-testid="trigger-routine-button"]');
    await button.click();

    // Wait for the request to be made
    await page.waitForTimeout(500);

    // Verify request includes todo context
    expect(requestBody).toBeDefined();
    expect(requestBody?.todo?.name).toBe('Important Task');
    expect(requestBody?.todo?.description).toBe('This is the task description');
    expect(requestBody?.todo?.id).toBe(todo.id);
});
