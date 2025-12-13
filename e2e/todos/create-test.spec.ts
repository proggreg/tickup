import { test, expect } from '@playwright/test';

test.describe('Create Todo', () => {
    test('in a list', async ({ page }) => {
        await page.goto('/list/688e2e5d0ecb2728667ebe40');

        // Wait for auth to be ready - ensure we're not redirected to login
        await page.waitForLoadState('networkidle');

        // Verify we're logged in by checking URL
        const url = page.url();
        if (url.includes('/login')) {
            throw new Error('Not authenticated - redirected to login page');
        }
        const newTodoInput = await page.getByPlaceholder('Add todo to Todo List');
        const testId = new Date();
        const todoName = `New Todo test ${testId}`;
        await newTodoInput.fill(todoName);
        await newTodoInput.press('Enter');
        await page.waitForLoadState('networkidle');
        const listItemTitlesEls = await page.getByTestId('todo-title').all();
        const listItemTitles = await Promise.all(listItemTitlesEls.map(navItem => navItem.textContent()));

        expect(listItemTitles.includes(todoName)).toBeTruthy();
    });

    test('in a table', async ({ page }) => {
        await page.goto('/list/688e660a9f3371ad3648103a');

        // Wait for auth to be ready - ensure we're not redirected to login
        await page.waitForLoadState('networkidle');

        // Verify we're logged in by checking URL
        const url = page.url();
        if (url.includes('/login')) {
            throw new Error('Not authenticated - redirected to login page');
        }
        const newTodoInput = await page.getByPlaceholder('Add todo to Table Todos');
        const testId = new Date();
        const todoName = `New Todo test ${testId}`;
        await newTodoInput.fill(todoName);
        await newTodoInput.press('Enter');
        await page.waitForLoadState('networkidle');
        const listItemTitlesEls = await page.getByTestId('todo-title').all();
        const listItemTitles = await Promise.all(listItemTitlesEls.map(navItem => navItem.textContent()));

        expect(listItemTitles.includes(todoName)).toBeTruthy();
    });
});
