import { test, expect } from '../../fixtures/index';
import { v4 as uuidv4 } from 'uuid';
import { deleteLists } from '../../helpers/teardown';

test.describe('Homepage - todo created via the new-task dialog persists', () => {
    test.beforeEach(async ({ page }) => {
        await deleteLists();

        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('a todo created without picking a due date is still shown after reload', async ({
        page,
        isMobile,
    }) => {
        const todoName = `Dialog todo ${uuidv4()}`;

        // Open the "New Task" dialog the same way a user would on this device -
        // the `t` shortcut on desktop, the bottom-nav FAB on mobile - and only
        // fill in the name. Regression coverage for a bug where todos created
        // this way were saved with a null due date and then silently dropped
        // from the homepage's "today" list on the next refetch.
        if (isMobile) {
            await page.getByTestId('mobile-new-todo-fab').click();
        }
        else {
            await page.keyboard.press('t');
        }
        await expect(page.getByTestId('dialog-title')).toHaveText('New Task');

        const newTodoInput = page.getByTestId('new-todo-input').locator('input');
        await newTodoInput.fill(todoName);

        const responsePromise = page.waitForResponse('**/api/todo');
        await page.getByTestId('create-todo-button').click();

        const response = await responsePromise;
        expect(response.status()).toBe(200);
        const created: Todo = await response.json();
        expect(created.dueDate).toBeTruthy();

        await expect(page.getByTestId('todo-title').filter({ hasText: todoName })).toBeVisible();

        // The bug only showed up once the homepage refetched todaysTodos from the
        // server (due_date filter), so a reload is required to catch it.
        await page.reload();
        await page.waitForLoadState('networkidle');

        await expect(page.getByTestId('todo-title').filter({ hasText: todoName })).toBeVisible();
    });
});
