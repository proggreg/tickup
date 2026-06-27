import { test, expect } from '../../fixtures/index';
import { v4 as uuidv4 } from 'uuid';
import { deleteLists } from '../../helpers/teardown';

let list: List;

test.describe('creating a new task and selecting a list', () => {
    test.beforeEach(async ({ listAPI, page }) => {
        await deleteLists();

        const testId = uuidv4();
        list = await listAPI.new({
            name: `List Name ${testId}`,
            listType: 'simple',
        });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('it should create a task with a list', async ({ page }) => {
        const testId = uuidv4();
        const todoName = `Todo ${testId}`;
        await page.keyboard.press('t');

        await page.waitForLoadState('networkidle');

        const dialogTitle = await page.getByTestId('dialog-title').textContent();
        expect(dialogTitle).toContain('New Task');

        const newTodoInput = await page.getByRole('textbox', { name: 'What needs to be done?' });
        await newTodoInput.fill(todoName);

        await page.getByTestId('list-select').click();
        await page.getByRole('option', { name: list.name, exact: true }).click();

        const responsePromise = page.waitForResponse('**/api/todo');
        await page.getByTestId('create-todo-button').click();

        await page.pause();
        const response = await responsePromise;
        expect(response.status()).toBe(200);
        const body: Todo = await response.json();
        expect(body.listId).toEqual(list.id);
    });
});
