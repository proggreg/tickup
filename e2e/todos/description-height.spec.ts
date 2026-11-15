import type { APIRequestContext, Locator, Page } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import { test, expect } from '../fixtures';

// Regression: the description used to be a raw <textarea> with a fixed
// ~2-row height, so long descriptions were cut off and scrolled inside a tiny box.

const lines = (count: number) =>
    Array.from({ length: count }, (_, i) => `Line ${i + 1} of the description`).join('\n');

async function openTodoWithDescription(
    page: Page,
    request: APIRequestContext,
    listId: string,
    desc: string,
) {
    const res = await request.post('/api/todo', {
        data: { name: `Description todo ${uuidv4()}`, listId, status: 'Open', desc },
    });
    expect(res.ok()).toBeTruthy();
    const todo = await res.json();

    await page.goto(`/todo/${todo.id}`);
    await page.waitForLoadState('networkidle');

    const field = page.getByTestId('todo-description').getByRole('textbox');
    await expect(field).toHaveValue(desc);
    return field;
}

function scrollsInternally(field: Locator) {
    return field.evaluate((el) => el.scrollHeight > el.clientHeight + 1);
}

test.describe('Todo description field', () => {
    let listId: string;

    test.beforeEach(async ({ listAPI }) => {
        const list = await listAPI.new({
            name: `Description List ${uuidv4()}`,
            icon: 'mdi-format-list-bulleted',
            listType: 'simple',
            todos: [],
        } as unknown as List);
        listId = String(list.id);
    });

    test('grows to show a medium-length description in full', async ({ page, request }) => {
        const field = await openTodoWithDescription(page, request, listId, lines(10));

        await expect.poll(() => scrollsInternally(field)).toBe(false);
        await expect(page.getByTestId('todo-description-toggle')).toBeHidden();
    });

    test('collapses a very long description behind "Show more"', async ({ page, request }) => {
        const field = await openTodoWithDescription(page, request, listId, lines(40));

        const toggle = page.getByTestId('todo-description-toggle');
        await expect(toggle).toHaveText(/Show more/);
        await expect.poll(() => scrollsInternally(field)).toBe(true);

        await toggle.click();

        await expect(toggle).toHaveText(/Show less/);
        await expect.poll(() => scrollsInternally(field)).toBe(false);
    });

    test('expands a long description when focused for editing', async ({ page, request }) => {
        const field = await openTodoWithDescription(page, request, listId, lines(40));

        await field.focus();

        await expect.poll(() => scrollsInternally(field)).toBe(false);
        await expect(page.getByTestId('todo-description-toggle')).toHaveText(/Show less/);
    });

    test('hides "Show more" once the description is shortened', async ({ page, request }) => {
        const field = await openTodoWithDescription(page, request, listId, lines(40));
        const toggle = page.getByTestId('todo-description-toggle');
        await expect(toggle).toBeVisible();

        await field.fill(lines(5));

        await expect(toggle).toBeHidden();
        await expect.poll(() => scrollsInternally(field)).toBe(false);
    });
});
