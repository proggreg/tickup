import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('subtasks are scrollable', () => {
    test('subtasks list is scrollable when many subtasks exist', async ({ page, request, isMobile }) => {
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

        // Add multiple subtasks (enough to require scrolling)
        const subtaskNames: string[] = [];
        for (let i = 0; i < 15; i++) {
            const subtaskInput = page.getByTestId('add-subtask-input').locator('input');
            const subtaskName = `Subtask ${i + 1} - ${uuidv4().substring(0, 8)}`;
            subtaskNames.push(subtaskName);
            
            await subtaskInput.click();
            await subtaskInput.fill(subtaskName);
            await page.waitForTimeout(200);

            const addSubtaskButton = page.getByTestId('add-subtask-button');
            await expect(addSubtaskButton).toBeEnabled({ timeout: 3000 });
            await addSubtaskButton.click();
            await page.waitForTimeout(300);
        }

        // Verify all subtasks were created
        const subtasksList = page.getByTestId('subtasks-list');
        await expect(subtasksList).toBeVisible();

        // Verify the count badge shows correct number
        const countBadge = page.locator('.v-chip').filter({ hasText: '15' });
        await expect(countBadge).toBeVisible();

        // Get the scrollable container
        const scrollableContainer = page.locator('.subtasks-scrollable-container');
        await expect(scrollableContainer).toBeVisible();

        // Check if the container has scrollable overflow
        const hasScroll = await scrollableContainer.evaluate((el) => {
            return el.scrollHeight > el.clientHeight;
        });
        expect(hasScroll).toBeTruthy();

        // Verify first subtask is visible
        const firstSubtask = page.getByTestId('subtask-name-0');
        await expect(firstSubtask).toBeVisible();

        // Scroll to bottom
        await scrollableContainer.evaluate((el) => {
            el.scrollTop = el.scrollHeight;
        });

        // Wait a moment for scroll
        await page.waitForTimeout(300);

        // Verify last subtask is visible after scrolling
        const lastSubtask = page.getByTestId('subtask-name-14');
        await expect(lastSubtask).toBeVisible();

        // Verify last subtask has the correct name
        await expect(lastSubtask).toHaveText(subtaskNames[14]);
    });

    test('subtasks maintain scroll position when interacting with them', async ({ page, request, isMobile }) => {
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

        // Navigate and create todo
        await page.goto(`/list/${list.id}`);
        await page.waitForLoadState('networkidle');

        const newTodoInput = page.getByTestId('new-todo-input').locator('input');
        const todoName = `Todo ${uuidv4()}`;
        await newTodoInput.fill(todoName);
        await newTodoInput.press('Enter');
        await page.waitForLoadState('networkidle');

        const todoTitle = page.getByTestId('todo-title').filter({ hasText: todoName });
        await todoTitle.click();
        await page.waitForURL(/\/todo\//);
        await page.waitForLoadState('networkidle');

        // Add 10 subtasks
        for (let i = 0; i < 10; i++) {
            const subtaskInput = page.getByTestId('add-subtask-input').locator('input');
            await subtaskInput.click();
            await subtaskInput.fill(`Subtask ${i + 1}`);
            await page.waitForTimeout(200);

            const addSubtaskButton = page.getByTestId('add-subtask-button');
            await addSubtaskButton.click();
            await page.waitForTimeout(300);
        }

        // Scroll to middle
        const scrollableContainer = page.locator('.subtasks-scrollable-container');
        await scrollableContainer.evaluate((el) => {
            el.scrollTop = el.scrollHeight / 2;
        });

        const scrollPosition = await scrollableContainer.evaluate((el) => el.scrollTop);

        // Check a checkbox in the middle
        const checkbox = page.getByTestId('subtask-checkbox-5');
        await checkbox.click();
        await page.waitForTimeout(200);

        // Verify scroll position is maintained
        const newScrollPosition = await scrollableContainer.evaluate((el) => el.scrollTop);
        expect(Math.abs(newScrollPosition - scrollPosition)).toBeLessThan(50); // Allow small variance
    });
});
