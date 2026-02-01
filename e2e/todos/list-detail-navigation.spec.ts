import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('Todo List to Detail Navigation', () => {
    test.beforeEach(async ({ page, request, isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');

        // Create a test list
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

        // Navigate to the list page
        await page.goto(`/list/${list.id}`);
        await page.waitForLoadState('networkidle');

        // Create a test todo
        const newTodoInput = await page.getByTestId('new-todo-input').locator('input');
        const todoName = `Todo ${uuidv4()}`;
        await newTodoInput.fill(todoName);
        await newTodoInput.press('Enter');
        await page.waitForLoadState('networkidle');
    });

    test('navigates to todo detail and back with todos visible', async ({ page, isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');

        // Verify todos are visible in the list
        const todoTitlesBeforeNavigation = await page.getByTestId('todo-title').all();
        const todoTextsBefore = await Promise.all(todoTitlesBeforeNavigation.map(el => el.textContent()));
        expect(todoTitlesBeforeNavigation.length).toBeGreaterThan(0);

        // Click on the first todo to navigate to detail page
        const firstTodo = await page.getByTestId('todo-title').first();
        await firstTodo.click();

        // Wait for navigation to todo detail page
        await page.waitForURL(/\/todo\//, { timeout: 5000 });

        // Verify we're on the todo detail page
        const urlAfterClick = page.url();
        expect(urlAfterClick).toMatch(/\/todo\/[^/]+$/);

        // Verify TodoDetail component is visible
        const todoDetailElement = page.locator('[data-testid="add-subtask-input"]');
        await expect(todoDetailElement).toBeVisible();

        // Navigate back using the back button
        const backButton = await page.getByTestId('nav-back-list');
        await backButton.click();

        // Wait for navigation back to list page
        await page.waitForURL(/\/list\//, { timeout: 5000 });

        // Verify we're back on the list page
        const urlAfterBack = page.url();
        expect(urlAfterBack).toMatch(/\/list\/[^/]+$/);

        // Verify todos are still visible after navigation back
        await page.waitForLoadState('networkidle');
        const todoTitlesAfterNavigation = await page.getByTestId('todo-title').all();
        const todoTextsAfter = await Promise.all(todoTitlesAfterNavigation.map(el => el.textContent()));

        expect(todoTitlesAfterNavigation.length).toBeGreaterThan(0);
        expect(todoTitlesAfterNavigation.length).toBe(todoTitlesBeforeNavigation.length);
        expect(todoTextsAfter).toEqual(todoTextsBefore);
    });
});
