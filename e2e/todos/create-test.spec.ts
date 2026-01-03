import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('Create Todo', () => {
    test.beforeEach(async ({ page, request, isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');
        const testId = uuidv4();
        const response = await request.post('/api/list', {
            data: {
                name: `Test List ${testId}`,
                icon: 'mdi-format-list-bulleted',
                listType: 'simple',
                name: 'asd',
                todos: [],
            },
        });
        const list = await response.json();
        console.log('create list response', list.id);

        await page.goto(`/list/${list.id}`);
        await page.waitForLoadState('networkidle');
    });
    test('in a list', async ({ page, isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');
        // Wait for auth to be ready - ensure we're not redirected to login
        await page.waitForLoadState('networkidle');

        const newTodoInput = await page.getByTestId('new-todo-input').locator('input');

        console.log('newTodoInput', newTodoInput);

        const testId = uuidv4();
        const todoName = `Todo ${testId}`;
        await newTodoInput.fill(todoName);
        page.pause();
        // await newTodoInput.press('Enter');
        await page.waitForLoadState('networkidle');
        const listItemTitlesEls = await page.getByTestId('todo-title').all();
        const listItemTitles = await Promise.all(listItemTitlesEls.map(navItem => navItem.textContent()));

        expect(listItemTitles.includes(todoName)).toBeTruthy();
    });

    test('in a table', async ({ page }) => {
        await page.waitForLoadState('networkidle');

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
