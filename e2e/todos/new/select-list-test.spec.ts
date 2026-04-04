import { test, expect } from '../../fixtures/index';
import { before } from 'node:test';
import { v4 as uuidv4 } from 'uuid';

let list: List;
test.describe('creating a new todo and selecting a list', () => {
    test.beforeEach(async ({ listAPI, page }) => {
        const testId = uuidv4();
        list = await listAPI.new({
            name: `List Name ${testId}`,
            listType: 'simple',
        });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });
    test('it should create a todo with a list', async ({ page }) => {
        const testId = uuidv4();
        const todoName = `Todo ${testId}`;
        await page.keyboard.press('t');

        await page.waitForTimeout(500);
        const dialogTitle = await page.getByTestId('dialog-title').textContent();
        expect(dialogTitle).toBe('New Todo');
        const newTodoInput = await page.getByTestId('new-todo-input').locator('input').first();
        await newTodoInput.fill(todoName);

        await page.locator('.v-field.v-field--appended.v-field--center-affix.v-field--no-label.v-field--variant-filled.v-theme--light > .v-field__field > .v-field__input').click();
        await page.getByRole('option', { name: list.name, exact: true }).click();

        const responsePromise = page.waitForResponse('**/api/todo');
        await page.getByTestId('create-todo-button').click();
        const response = await responsePromise;
        expect(response.status()).toBe(200);
        const body: Todo = await response.json();
        expect(body.listId).toEqual(list.id);
    });
});
