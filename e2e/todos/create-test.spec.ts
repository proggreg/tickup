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

        await page.waitForLoadState('networkidle');

        const newTodoInput = await page.getByTestId('new-todo-input').locator('input');
        const testId = uuidv4();
        const todoName = `Todo ${testId}`;
        await newTodoInput.fill(todoName);

        await newTodoInput.press('Enter');

        await page.reload();
        await page.waitForLoadState('networkidle');

        const listItemTitlesEls = await page.getByTestId('todo-title').all();
        const listItemTitles = await Promise.all(listItemTitlesEls.map(navItem => navItem.textContent()));

        expect(listItemTitles.includes(todoName)).toBeTruthy();
    });

    test('in a table', async ({ page, isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');
        await page.waitForLoadState('networkidle');

        const newTodoInput = await page.getByTestId('new-todo-input').locator('input');
        await newTodoInput.fill(`Todo ${uuidv4()}`);
        await newTodoInput.press('Enter');
        await page.waitForLoadState('networkidle');
        await page.getByTestId('list-type-select').click();
        await page.getByRole('option', { name: 'table' }).click();
        await page.waitForLoadState('networkidle');
        await page.getByRole('button', { name: 'Add Todo' }).click();

        const todoName = `Todo ${uuidv4()}`;

        await page.keyboard.type(todoName);
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');

        let listItemTitlesEls = await page.getByTestId('todo-title').all();
        let listItemTitles = await Promise.all(listItemTitlesEls.map(navItem => navItem.textContent()));
        console.log(listItemTitles, todoName);

        expect(listItemTitles.includes(todoName)).toBeTruthy();

        await page.reload();
        await page.waitForLoadState('networkidle');

        listItemTitlesEls = await page.getByTestId('todo-title').all();
        listItemTitles = await Promise.all(listItemTitlesEls.map(navItem => navItem.textContent()));

        expect(listItemTitles.includes(todoName)).toBeTruthy();
    });

    test('in a board', async ({ page, isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');
        await page.waitForLoadState('networkidle');
        const todoName = `Todo ${uuidv4()}`;

        await page.getByRole('tab', { name: 'board' }).click();
        await page.locator('.v-btn.v-btn--icon.v-theme--system.v-btn--density-default.elevation-0.rounded-lg.v-btn--size-small').first().click();
        await page.getByRole('textbox', { name: 'Add todo' }).fill(todoName);
        await page.getByRole('textbox', { name: 'Add todo' }).press('Enter');

        await page.reload();
        await page.waitForLoadState('networkidle');

        const newTodo = await page.getByRole('link', { name: todoName });
        expect(newTodo).toBeVisible();
    });
});
