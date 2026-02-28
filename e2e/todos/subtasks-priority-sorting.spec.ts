import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('subtasks priority and sorting', () => {
    test('can set priority on subtasks', async ({ page, request, isMobile }) => {
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

        // Add a subtask
        const subtaskInput = page.getByTestId('add-subtask-input').locator('input');
        await subtaskInput.click();
        await subtaskInput.fill('Test Subtask');
        await page.waitForTimeout(500);

        const addSubtaskButton = page.getByTestId('add-subtask-button');
        await addSubtaskButton.click();
        await page.waitForLoadState('networkidle');

        // Verify priority button exists with default (no priority) state
        const priorityButton = page.getByTestId('subtask-priority-0');
        await expect(priorityButton).toBeVisible();

        // Click priority button to open menu
        await priorityButton.click();
        await page.waitForTimeout(200);

        // Set priority to high
        const highPriorityOption = page.getByTestId('subtask-priority-high-0');
        await expect(highPriorityOption).toBeVisible();
        await highPriorityOption.click();
        await page.waitForTimeout(500);

        // Verify priority button color changed (should be error/red color)
        await expect(priorityButton).toHaveClass(/text-error/);

        // Open menu again and change to medium
        await priorityButton.click();
        await page.waitForTimeout(200);
        const mediumPriorityOption = page.getByTestId('subtask-priority-medium-0');
        await mediumPriorityOption.click();
        await page.waitForTimeout(500);

        // Verify priority button color changed to warning
        await expect(priorityButton).toHaveClass(/text-warning/);

        // Set to low priority
        await priorityButton.click();
        await page.waitForTimeout(200);
        const lowPriorityOption = page.getByTestId('subtask-priority-low-0');
        await lowPriorityOption.click();
        await page.waitForTimeout(500);

        // Verify priority button color changed to success
        await expect(priorityButton).toHaveClass(/text-success/);

        // Set back to none
        await priorityButton.click();
        await page.waitForTimeout(200);
        const nonePriorityOption = page.getByTestId('subtask-priority-none-0');
        await nonePriorityOption.click();
        await page.waitForTimeout(500);

        // Verify priority button is back to grey/default
        await expect(priorityButton).toHaveClass(/text-grey/);
    });

    test('can sort subtasks by priority', async ({ page, request, isMobile }) => {
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

        // Add 4 subtasks with different priorities
        const subtasksData = [
            { name: 'Low Priority Task', priority: 'low' },
            { name: 'High Priority Task', priority: 'high' },
            { name: 'No Priority Task', priority: null },
            { name: 'Medium Priority Task', priority: 'medium' },
        ];

        for (const subtaskData of subtasksData) {
            const subtaskInput = page.getByTestId('add-subtask-input').locator('input');
            await subtaskInput.click();
            await subtaskInput.fill(subtaskData.name);
            await page.waitForTimeout(500);

            const addSubtaskButton = page.getByTestId('add-subtask-button');
            await addSubtaskButton.click();
            await page.waitForLoadState('networkidle');
        }

        // Set priorities on each subtask
        for (let i = 0; i < subtasksData.length; i++) {
            if (subtasksData[i].priority) {
                const priorityButton = page.getByTestId(`subtask-priority-${i}`);
                await priorityButton.click();
                await page.waitForTimeout(200);
                
                const priorityOption = page.getByTestId(`subtask-priority-${subtasksData[i].priority}-${i}`);
                await priorityOption.click();
                await page.waitForTimeout(500);
            }
        }

        // Verify initial order (creation order)
        let subtask0Name = page.getByTestId('subtask-name-0').locator('input');
        let subtask1Name = page.getByTestId('subtask-name-1').locator('input');
        let subtask2Name = page.getByTestId('subtask-name-2').locator('input');
        let subtask3Name = page.getByTestId('subtask-name-3').locator('input');

        await expect(subtask0Name).toHaveValue('Low Priority Task');
        await expect(subtask1Name).toHaveValue('High Priority Task');
        await expect(subtask2Name).toHaveValue('No Priority Task');
        await expect(subtask3Name).toHaveValue('Medium Priority Task');

        // Click sort button to sort by priority
        const sortButton = page.getByTestId('subtasks-sort-button');
        await expect(sortButton).toBeVisible();
        await sortButton.click();
        await page.waitForTimeout(300);

        // Verify sorted order: High -> Medium -> Low -> None
        subtask0Name = page.getByTestId('subtask-name-0').locator('input');
        subtask1Name = page.getByTestId('subtask-name-1').locator('input');
        subtask2Name = page.getByTestId('subtask-name-2').locator('input');
        subtask3Name = page.getByTestId('subtask-name-3').locator('input');

        await expect(subtask0Name).toHaveValue('High Priority Task');
        await expect(subtask1Name).toHaveValue('Medium Priority Task');
        await expect(subtask2Name).toHaveValue('Low Priority Task');
        await expect(subtask3Name).toHaveValue('No Priority Task');

        // Click sort button again to turn off sorting (back to creation order)
        await sortButton.click();
        await page.waitForTimeout(300);

        // Verify back to original order
        subtask0Name = page.getByTestId('subtask-name-0').locator('input');
        subtask1Name = page.getByTestId('subtask-name-1').locator('input');
        subtask2Name = page.getByTestId('subtask-name-2').locator('input');
        subtask3Name = page.getByTestId('subtask-name-3').locator('input');

        await expect(subtask0Name).toHaveValue('Low Priority Task');
        await expect(subtask1Name).toHaveValue('High Priority Task');
        await expect(subtask2Name).toHaveValue('No Priority Task');
        await expect(subtask3Name).toHaveValue('Medium Priority Task');
    });

    test('priority persists after page reload', async ({ page, request, isMobile }) => {
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

        // Add a subtask
        const subtaskInput = page.getByTestId('add-subtask-input').locator('input');
        await subtaskInput.click();
        await subtaskInput.fill('High Priority Subtask');
        await page.waitForTimeout(500);

        const addSubtaskButton = page.getByTestId('add-subtask-button');
        await addSubtaskButton.click();
        await page.waitForLoadState('networkidle');

        // Set priority to high
        const priorityButton = page.getByTestId('subtask-priority-0');
        await priorityButton.click();
        await page.waitForTimeout(200);

        const highPriorityOption = page.getByTestId('subtask-priority-high-0');
        await highPriorityOption.click();
        await page.waitForTimeout(500);

        // Reload the page
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Verify priority is still set to high
        const priorityButtonAfterReload = page.getByTestId('subtask-priority-0');
        await expect(priorityButtonAfterReload).toBeVisible();
        await expect(priorityButtonAfterReload).toHaveClass(/text-error/);
    });

    test('sorting works with filtering', async ({ page, request, isMobile }) => {
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

        // Add 3 subtasks
        const subtasksData = [
            { name: 'Low Priority Active', priority: 'low', complete: false },
            { name: 'High Priority Completed', priority: 'high', complete: true },
            { name: 'Medium Priority Active', priority: 'medium', complete: false },
        ];

        for (const subtaskData of subtasksData) {
            const subtaskInput = page.getByTestId('add-subtask-input').locator('input');
            await subtaskInput.click();
            await subtaskInput.fill(subtaskData.name);
            await page.waitForTimeout(500);

            const addSubtaskButton = page.getByTestId('add-subtask-button');
            await addSubtaskButton.click();
            await page.waitForLoadState('networkidle');
        }

        // Set priorities and complete status
        for (let i = 0; i < subtasksData.length; i++) {
            const priorityButton = page.getByTestId(`subtask-priority-${i}`);
            await priorityButton.click();
            await page.waitForTimeout(200);
            
            const priorityOption = page.getByTestId(`subtask-priority-${subtasksData[i].priority}-${i}`);
            await priorityOption.click();
            await page.waitForTimeout(500);

            if (subtasksData[i].complete) {
                const checkbox = page.getByTestId(`subtask-checkbox-${i}`);
                await checkbox.click();
                await page.waitForTimeout(500);
            }
        }

        // Switch to active filter
        const filterActive = page.getByTestId('filter-active');
        await filterActive.click();
        await page.waitForTimeout(300);

        // Should show only 2 active subtasks
        await expect(page.getByTestId('subtask-item-0')).toBeVisible();
        await expect(page.getByTestId('subtask-item-1')).toBeVisible();
        await expect(page.getByTestId('subtask-item-2')).not.toBeVisible();

        // Click sort button to sort by priority
        const sortButton = page.getByTestId('subtasks-sort-button');
        await sortButton.click();
        await page.waitForTimeout(300);

        // Verify sorted order of active tasks: Medium -> Low
        const subtask0Name = page.getByTestId('subtask-name-0').locator('input');
        const subtask1Name = page.getByTestId('subtask-name-1').locator('input');

        await expect(subtask0Name).toHaveValue('Medium Priority Active');
        await expect(subtask1Name).toHaveValue('Low Priority Active');
    });
});
