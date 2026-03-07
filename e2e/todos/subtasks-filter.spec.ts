import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('subtasks filtering', () => {
    test('can filter to show only active subtasks', async ({ page, request, isMobile }) => {
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

        // Navigate to detail page
        const todoTitle = page.getByTestId('todo-title').filter({ hasText: todoName });
        await todoTitle.click();
        await page.waitForURL(/\/todo\//);
        await page.waitForLoadState('networkidle');

        // Add 3 subtasks
        const subtaskNames = ['Subtask 1', 'Subtask 2', 'Subtask 3'];
        for (const name of subtaskNames) {
            const subtaskInput = page.getByTestId('add-subtask-input').locator('input');
            await subtaskInput.click();
            await subtaskInput.fill(name);
            await page.waitForTimeout(500);

            const addSubtaskButton = page.getByTestId('add-subtask-button');
            await expect(addSubtaskButton).toBeEnabled({ timeout: 5000 });
            await addSubtaskButton.click();
            await page.waitForLoadState('networkidle');
        }

        // Verify all 3 subtasks are visible
        await expect(page.getByTestId('subtask-item-0')).toBeVisible();
        await expect(page.getByTestId('subtask-item-1')).toBeVisible();
        await expect(page.getByTestId('subtask-item-2')).toBeVisible();

        // Verify count badge shows "3/3" (active/total)
        const countBadge = page.locator('.v-chip').filter({ hasText: '3/3' });
        await expect(countBadge).toBeVisible();

        // Mark first subtask as complete
        const checkbox0 = page.getByTestId('subtask-checkbox-0');
        await checkbox0.click();
        await page.waitForTimeout(500);

        // Verify count badge now shows "2/3"
        const updatedBadge = page.locator('.v-chip').filter({ hasText: '2/3' });
        await expect(updatedBadge).toBeVisible();

        // Verify filter buttons are visible
        const filterToggle = page.getByTestId('subtasks-filter');
        await expect(filterToggle).toBeVisible();

        const filterAll = page.getByTestId('filter-all');
        const filterActive = page.getByTestId('filter-active');
        await expect(filterAll).toBeVisible();
        await expect(filterActive).toBeVisible();

        // Click "Active" filter
        await filterActive.click();
        await page.waitForTimeout(300);

        // Verify only 2 subtasks are visible now (uncompleted ones)
        await expect(page.getByTestId('subtask-item-0')).toBeVisible();
        await expect(page.getByTestId('subtask-item-1')).toBeVisible();
        
        // The third item should not exist (we only have 2 items in filtered list)
        await expect(page.getByTestId('subtask-item-2')).not.toBeVisible();

        // Verify the visible subtasks are the right ones (not the completed one)
        const subtask0Name = page.getByTestId('subtask-name-0');
        const subtask1Name = page.getByTestId('subtask-name-1');
        
        await expect(subtask0Name).toHaveText('Subtask 2');
        await expect(subtask1Name).toHaveText('Subtask 3');

        // Click "All" filter to show all again
        await filterAll.click();
        await page.waitForTimeout(300);

        // Verify all 3 subtasks are visible again
        await expect(page.getByTestId('subtask-item-0')).toBeVisible();
        await expect(page.getByTestId('subtask-item-1')).toBeVisible();
        await expect(page.getByTestId('subtask-item-2')).toBeVisible();
    });

    test('shows celebration message when all subtasks are completed with active filter', async ({ page, request, isMobile }) => {
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

        // Add 2 subtasks
        for (let i = 1; i <= 2; i++) {
            const subtaskInput = page.getByTestId('add-subtask-input').locator('input');
            await subtaskInput.click();
            await subtaskInput.fill(`Subtask ${i}`);
            await page.waitForTimeout(500);

            const addSubtaskButton = page.getByTestId('add-subtask-button');
            await addSubtaskButton.click();
            await page.waitForLoadState('networkidle');
        }

        // Switch to active filter
        const filterActive = page.getByTestId('filter-active');
        await filterActive.click();
        await page.waitForTimeout(300);

        // Complete first subtask (it will disappear from the filtered list)
        const checkbox0 = page.getByTestId('subtask-checkbox-0');
        await checkbox0.click();
        await page.waitForTimeout(500);

        // Complete second subtask (which is now at index 0 after first was filtered out)
        const checkbox1 = page.getByTestId('subtask-checkbox-0');
        await checkbox1.click();
        await page.waitForTimeout(500);

        // Verify celebration message is shown
        const celebrationMessage = page.getByTestId('no-active-subtasks');
        await expect(celebrationMessage).toBeVisible();
        await expect(celebrationMessage).toContainText('All subtasks completed');

        // Verify count badge shows "0/2"
        const countBadge = page.locator('.v-chip').filter({ hasText: '0/2' });
        await expect(countBadge).toBeVisible();

        // Switch to "All" filter
        const filterAll = page.getByTestId('filter-all');
        await filterAll.click();
        await page.waitForTimeout(300);

        // Verify both completed subtasks are now visible
        await expect(page.getByTestId('subtask-item-0')).toBeVisible();
        await expect(page.getByTestId('subtask-item-1')).toBeVisible();
    });

    test('filter persists when adding new subtasks', async ({ page, request, isMobile }) => {
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

        // Add a subtask and mark it complete
        const subtaskInput = page.getByTestId('add-subtask-input').locator('input');
        await subtaskInput.click();
        await subtaskInput.fill('Completed subtask');
        await page.waitForTimeout(500);

        const addSubtaskButton = page.getByTestId('add-subtask-button');
        await addSubtaskButton.click();
        await page.waitForLoadState('networkidle');

        const checkbox = page.getByTestId('subtask-checkbox-0');
        await checkbox.click();
        await page.waitForTimeout(500);

        // Switch to active filter
        const filterActive = page.getByTestId('filter-active');
        await filterActive.click();
        await page.waitForTimeout(300);

        // Verify celebration message (no active subtasks)
        await expect(page.getByTestId('no-active-subtasks')).toBeVisible();

        // Add a new subtask while filter is on "active"
        await subtaskInput.click();
        await subtaskInput.fill('New active subtask');
        await page.waitForTimeout(500);
        await addSubtaskButton.click();
        await page.waitForLoadState('networkidle');

        // Verify the new subtask is visible (it's active)
        const newSubtask = page.getByTestId('subtask-item-0');
        await expect(newSubtask).toBeVisible();

        const newSubtaskName = page.getByTestId('subtask-name-0');
        await expect(newSubtaskName).toHaveText('New active subtask');

        // Verify count badge shows "1/2"
        const countBadge = page.locator('.v-chip').filter({ hasText: '1/2' });
        await expect(countBadge).toBeVisible();
    });
});
