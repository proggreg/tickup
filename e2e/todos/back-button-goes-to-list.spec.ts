import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('back button always goes to list from parent task', () => {
    test('back button goes to list even when navigating between tasks', async ({ page, request, isMobile }) => {
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

        // Navigate to the list
        await page.goto(`/list/${list.id}`);
        await page.waitForLoadState('networkidle');

        // Check authentication
        const url = page.url();
        if (url.includes('/login')) {
            throw new Error('Not authenticated - redirected to login page');
        }

        // Create first todo
        const newTodoInput = page.getByTestId('new-todo-input').locator('input');
        const todo1Name = `First Todo ${uuidv4()}`;
        await newTodoInput.fill(todo1Name);
        await newTodoInput.press('Enter');
        await page.waitForLoadState('networkidle');

        // Create second todo
        const todo2Name = `Second Todo ${uuidv4()}`;
        await newTodoInput.fill(todo2Name);
        await newTodoInput.press('Enter');
        await page.waitForLoadState('networkidle');

        // Click on first todo
        const todo1Title = page.getByTestId('todo-title').filter({ hasText: todo1Name });
        await todo1Title.click();
        await page.waitForURL(/\/todo\//);
        await page.waitForLoadState('networkidle');

        // Verify we're on first todo
        const titleField = page.getByTestId('todo-detail-title').locator('input');
        await expect(titleField).toHaveValue(todo1Name);

        // Add a subtask to first todo
        const subtaskInput = page.getByTestId('add-subtask-input').locator('input');
        const subtaskName = `Subtask ${uuidv4()}`;
        await subtaskInput.click();
        await subtaskInput.fill(subtaskName);
        await page.waitForTimeout(500);

        const addSubtaskButton = page.getByTestId('add-subtask-button');
        await expect(addSubtaskButton).toBeEnabled({ timeout: 5000 });
        await addSubtaskButton.click();
        await page.waitForLoadState('networkidle');

        // Click on the subtask link to navigate to subtask detail
        const subtaskLink = page.getByTestId('subtask-link-0');
        await subtaskLink.click();
        await page.waitForURL(/\/todo\/\d+/);
        await page.waitForLoadState('networkidle');

        // Verify we're on the subtask
        await expect(titleField).toHaveValue(subtaskName);

        // Verify back button shows parent task (not list)
        const backToParentButton = page.getByTestId('nav-back-parent');
        await expect(backToParentButton).toBeVisible();
        await expect(backToParentButton).toContainText(todo1Name);

        // Navigate back to parent task using back button
        await backToParentButton.click();
        await page.waitForURL(/\/todo\/\d+/);
        await page.waitForLoadState('networkidle');

        // Verify we're back on first todo
        await expect(titleField).toHaveValue(todo1Name);

        // Now the back button should show the list (not the subtask we just came from)
        const backToListButton = page.getByTestId('nav-back-list');
        await expect(backToListButton).toBeVisible();

        // Click the back button to go to list
        await backToListButton.click();
        await page.waitForURL(/\/list\//);
        await page.waitForLoadState('networkidle');

        // Verify we're back on the list page
        expect(page.url()).toMatch(/\/list\/\d+$/);

        // Verify both todos are visible
        await expect(page.getByTestId('todo-title').filter({ hasText: todo1Name })).toBeVisible();
        await expect(page.getByTestId('todo-title').filter({ hasText: todo2Name })).toBeVisible();
    });
});
