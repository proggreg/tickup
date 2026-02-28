import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('a user can create a subtask and it persists after reload', () => {
    test('creates a subtask, reloads the page, and verifies the subtask still exists', async ({ page, request, isMobile }) => {
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
        
        // Wait for the POST request to complete
        const createTodoPromise = page.waitForRequest(request =>
            request.url().includes('/api/todo') && request.method() === 'POST'
        );
        await newTodoInput.press('Enter');
        await createTodoPromise;
        
        await page.waitForLoadState('networkidle');

        // Click on the todo to navigate to detail page
        const todoTitle = page.getByTestId('todo-title').filter({ hasText: todoName });
        await todoTitle.click();
        
        // Wait for navigation to /todo/:id
        await page.waitForURL(/\/todo\//, { timeout: 5000 });
        await page.waitForLoadState('networkidle');

        // Verify we're on the todo detail page
        const urlAfterClick = page.url();
        expect(urlAfterClick).toMatch(/\/todo\/[^/]+$/);

        // Wait for the subtask input to be visible (indicates page loaded)
        const subtaskInput = page.getByTestId('add-subtask-input').locator('input');
        await expect(subtaskInput).toBeVisible();

        // Add a subtask
        const subtaskName = `Subtask ${uuidv4()}`;
        await subtaskInput.click();
        await subtaskInput.fill(subtaskName);
        
        // Wait for v-model to update and button to be enabled
        await page.waitForTimeout(500);

        // Click the add subtask button and wait for the request
        const addSubtaskButton = page.getByTestId('add-subtask-button');
        await expect(addSubtaskButton).toBeEnabled({ timeout: 5000 });
        
        const createSubtaskPromise = page.waitForRequest(request =>
            request.url().includes('/api/todo') && request.method() === 'POST'
        );
        await addSubtaskButton.click();
        await createSubtaskPromise;
        
        await page.waitForLoadState('networkidle');

        // Verify the subtask appears initially
        const subtasksList = page.getByTestId('subtasks-list');
        await expect(subtasksList).toBeVisible();

        const subtaskNameField = page.getByTestId('subtask-name-0').locator('input');
        await expect(subtaskNameField).toHaveValue(subtaskName);

        // Reload the page to verify persistence
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Verify we're still on the todo detail page
        const urlAfterReload = page.url();
        expect(urlAfterReload).toMatch(/\/todo\/[^/]+$/);

        // Verify the subtask still exists after reload
        const subtasksListAfterReload = page.getByTestId('subtasks-list');
        await expect(subtasksListAfterReload).toBeVisible();

        const subtaskNameFieldAfterReload = page.getByTestId('subtask-name-0').locator('input');
        await expect(subtaskNameFieldAfterReload).toHaveValue(subtaskName);
    });
});
