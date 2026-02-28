import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('subtask navigation', () => {
    test('can navigate from parent to subtask and back using links', async ({ page, request, isMobile }) => {
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

        // Create a todo
        const newTodoInput = page.getByTestId('new-todo-input').locator('input');
        const todoName = `Parent Todo ${uuidv4()}`;
        await newTodoInput.fill(todoName);
        await newTodoInput.press('Enter');
        await page.waitForLoadState('networkidle');

        // Click on the todo to navigate to detail page
        const todoTitle = page.getByTestId('todo-title').filter({ hasText: todoName });
        await todoTitle.click();
        
        // Wait for navigation to /todo/:id
        await page.waitForURL(/\/todo\//);
        await page.waitForLoadState('networkidle');

        // Add a subtask
        const subtaskInput = page.getByTestId('add-subtask-input').locator('input');
        const subtaskName = `Subtask ${uuidv4()}`;
        await subtaskInput.click();
        await subtaskInput.fill(subtaskName);
        await page.waitForTimeout(500);

        const addSubtaskButton = page.getByTestId('add-subtask-button');
        await expect(addSubtaskButton).toBeEnabled({ timeout: 5000 });
        await addSubtaskButton.click();
        await page.waitForLoadState('networkidle');

        // Verify the subtask appears
        const subtasksList = page.getByTestId('subtasks-list');
        await expect(subtasksList).toBeVisible();

        // Click the subtask link to navigate to subtask detail page
        const subtaskLink = page.getByTestId('subtask-link-0');
        await expect(subtaskLink).toBeVisible();
        await subtaskLink.click();

        // Wait for navigation to the subtask detail page
        await page.waitForURL(/\/todo\/\d+/);
        await page.waitForLoadState('networkidle');

        // Verify we're on the subtask detail page by checking the title
        const subtaskTitleField = page.getByTestId('todo-detail-title').locator('input');
        await expect(subtaskTitleField).toHaveValue(subtaskName);

        // Verify the back button now goes to parent (not list)
        const backToParentButton = page.getByTestId('nav-back-parent');
        await expect(backToParentButton).toBeVisible();
        await expect(backToParentButton).toContainText(todoName);

        // Verify the list back button is NOT visible (replaced by parent back button)
        const backToListButton = page.getByTestId('nav-back-list');
        await expect(backToListButton).not.toBeVisible();

        // Click the back button to navigate to parent task
        await backToParentButton.click();

        // Wait for navigation back to parent task
        await page.waitForURL(/\/todo\/\d+/);
        await page.waitForLoadState('networkidle');

        // Verify we're back on the parent task detail page
        const parentTitleField = page.getByTestId('todo-detail-title').locator('input');
        await expect(parentTitleField).toHaveValue(todoName);

        // Verify the subtask is still visible
        await expect(subtasksList).toBeVisible();
        const subtaskNameField = page.getByTestId('subtask-name-0');
        await expect(subtaskNameField).toHaveText(subtaskName);

        // Verify the back button now goes to list (not parent, since we're on parent)
        await expect(backToListButton).toBeVisible();
        await expect(backToParentButton).not.toBeVisible();
    });
});
