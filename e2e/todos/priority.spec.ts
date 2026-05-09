import { test, expect } from '../fixtures/index';
import { v4 as uuidv4 } from 'uuid';
import { deleteLists } from '../helpers/teardown';

test.describe('Task priorities', () => {
    test.beforeEach(async ({ page }) => {
        test.skip(await page.evaluate(() => window.innerWidth < 960), 'desktop only');

        await deleteLists();

        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('can set priority when creating a new task', async ({ page }) => {
        await page.keyboard.press('t');
        await page.waitForSelector('[data-testid="dialog-title"]');

        await page
            .getByRole('textbox', { name: 'What needs to be done?' })
            .fill(`Priority Task ${uuidv4()}`);

        await page.getByTestId('dialog-priority-button').click();
        await page.getByTestId('dialog-priority-high').click();

        const responsePromise = page.waitForResponse('**/api/todo');
        await page.getByTestId('create-todo-button').click();

        const response = await responsePromise;
        expect(response.status()).toBe(200);
        const body: Todo = await response.json();
        expect(body.priorityLev).toBe('high');
    });

    test('can set medium and low priorities when creating a task', async ({ page }) => {
        await page.keyboard.press('t');
        await page.waitForSelector('[data-testid="dialog-title"]');

        await page
            .getByRole('textbox', { name: 'What needs to be done?' })
            .fill(`Priority Task ${uuidv4()}`);

        await page.getByTestId('dialog-priority-button').click();
        await page.getByTestId('dialog-priority-medium').click();

        // Re-open menu and switch to low to verify changes apply
        await page.getByTestId('dialog-priority-button').click();
        await page.getByTestId('dialog-priority-low').click();

        const responsePromise = page.waitForResponse('**/api/todo');
        await page.getByTestId('create-todo-button').click();

        const response = await responsePromise;
        expect(response.status()).toBe(200);
        const body: Todo = await response.json();
        expect(body.priorityLev).toBe('low');
    });

    test('can change priority on the task detail page', async ({ listAPI, page }) => {
        const list = await listAPI.new({
            name: `Priority List ${uuidv4()}`,
            listType: 'simple',
        });

        await page.goto(`/list/${list.id}`);
        await page.waitForLoadState('networkidle');

        const todoName = `Detail Priority Task ${uuidv4()}`;
        const newTodoInput = page.getByTestId('new-todo-input').locator('input');
        await newTodoInput.fill(todoName);
        await newTodoInput.press('Enter');
        await page.waitForLoadState('networkidle');

        await page.getByTestId('todo-title').filter({ hasText: todoName }).click();
        await page.waitForURL(/\/todo\//, { timeout: 5000 });

        await page.getByTestId('todo-priority-button').click();
        await page.getByTestId('todo-priority-high').click();

        const putResponse = await page.waitForResponse(
            r => r.url().includes('/api/todo/') && r.request().method() === 'PUT',
        );
        expect(putResponse.status()).toBe(200);
        const body: Todo = await putResponse.json();
        expect(body.priorityLev).toBe('high');
    });

    test('can clear priority back to none on the task detail page', async ({ listAPI, page }) => {
        const list = await listAPI.new({
            name: `Priority List ${uuidv4()}`,
            listType: 'simple',
        });

        const todoResponse = await page.request.post('/api/todo', {
            data: {
                name: `Clear Priority Task ${uuidv4()}`,
                listId: list.id,
                status: 'Open',
                priorityLev: 'medium',
                color: '#87909e',
                links: [],
                attachments: [],
                edit: false,
            },
        });
        const todo: Todo = await todoResponse.json();

        await page.goto(`/todo/${todo.id}`);
        await page.waitForLoadState('networkidle');

        await page.getByTestId('todo-priority-button').click();
        await page.getByTestId('todo-priority-none').click();

        const putResponse = await page.waitForResponse(
            r => r.url().includes('/api/todo/') && r.request().method() === 'PUT',
        );
        expect(putResponse.status()).toBe(200);
        const body: Todo = await putResponse.json();
        expect(body.priorityLev).toBe('');
    });
});
