import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('subtasks are collapsible', () => {
    test('can collapse and expand subtasks section', async ({ page, request, isMobile }) => {
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
        const todoName = `Todo ${uuidv4()}`;
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

        // Verify the subtask is visible and section is expanded
        const subtasksList = page.getByTestId('subtasks-list');
        await expect(subtasksList).toBeVisible();

        const subtaskNameField = page.getByTestId('subtask-name-0').locator('input');
        await expect(subtaskNameField).toBeVisible();

        // Verify toggle button shows chevron-up (expanded state)
        const toggleButton = page.getByTestId('subtasks-toggle');
        await expect(toggleButton).toBeVisible();

        // Click the toggle button to collapse
        await toggleButton.click();
        await page.waitForTimeout(300); // Wait for animation

        // Verify the subtasks list is not visible
        await expect(subtasksList).not.toBeVisible();

        // Verify add subtask input is also hidden
        await expect(subtaskInput).not.toBeVisible();

        // Click the toggle button again to expand
        await toggleButton.click();
        await page.waitForTimeout(300); // Wait for animation

        // Verify the subtasks list is visible again
        await expect(subtasksList).toBeVisible();
        await expect(subtaskNameField).toBeVisible();
        await expect(subtaskInput).toBeVisible();
    });

    test('can click on header to collapse/expand', async ({ page, request, isMobile }) => {
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

        // Create a todo
        const newTodoInput = page.getByTestId('new-todo-input').locator('input');
        const todoName = `Todo ${uuidv4()}`;
        await newTodoInput.fill(todoName);
        await newTodoInput.press('Enter');
        await page.waitForLoadState('networkidle');

        // Navigate to detail page
        const todoTitle = page.getByTestId('todo-title').filter({ hasText: todoName });
        await todoTitle.click();
        await page.waitForURL(/\/todo\//);
        await page.waitForLoadState('networkidle');

        // Add a subtask
        const subtaskInput = page.getByTestId('add-subtask-input').locator('input');
        const subtaskName = `Subtask ${uuidv4()}`;
        await subtaskInput.click();
        await subtaskInput.fill(subtaskName);
        await page.waitForTimeout(500);

        const addSubtaskButton = page.getByTestId('add-subtask-button');
        await addSubtaskButton.click();
        await page.waitForLoadState('networkidle');

        // Verify subtask is visible
        const subtasksList = page.getByTestId('subtasks-list');
        await expect(subtasksList).toBeVisible();

        // Click the header to collapse
        const header = page.getByTestId('subtasks-header');
        await header.click();
        await page.waitForTimeout(300);

        // Verify collapsed
        await expect(subtasksList).not.toBeVisible();

        // Click header again to expand
        await header.click();
        await page.waitForTimeout(300);

        // Verify expanded
        await expect(subtasksList).toBeVisible();
    });
});
