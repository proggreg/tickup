import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('Homepage - new todo appears without refresh', () => {
    test.beforeEach(async ({ page, request, isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');

        const testId = uuidv4();
        const response = await request.post('/api/list', {
            data: {
                name: `Test List ${testId}`,
                icon: 'mdi-format-list-bulleted',
                listType: 'simple',
                todos: [],
            },
        });
        const list = await response.json();

        // Visit list page to set currentList in the store (needed for homepage todo creation)
        await page.goto(`/list/${list.id}`);
        await page.waitForLoadState('networkidle');

        // Navigate to homepage
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('new todo is shown without refreshing when created on the homepage', async ({ page, isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');

        const todoName = `Homepage todo ${uuidv4()}`;
        const newTodoInput = page.getByTestId('new-todo-input').locator('input').first();
        await newTodoInput.fill(todoName);
        await newTodoInput.press('Enter');

        // Assert: new todo appears in the list WITHOUT any page reload or navigation
        await expect(page.getByTestId('todo-title').filter({ hasText: todoName })).toBeVisible();
    });
});
