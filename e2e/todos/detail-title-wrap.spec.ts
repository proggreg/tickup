import { test, expect } from '../fixtures/index';
import { v4 as uuidv4 } from 'uuid';
import { deleteLists } from '../helpers/teardown';

test.describe('todo detail title wrapping', () => {
    test.beforeEach(async () => {
        await deleteLists();
    });

    test('wraps a long title onto multiple lines instead of clipping it', async ({
        listAPI,
        request,
        page,
    }) => {
        const testId = uuidv4();
        const list = await listAPI.new({
            name: `Title Wrap List ${testId}`,
            listType: 'simple',
        });

        const longTitle = `As a user I should be able to create and select a list when adding a new todo ${testId}`;

        const todoResponse = await request.post('/api/todo', {
            data: { name: longTitle, listId: list.id },
        });
        expect(todoResponse.ok()).toBeTruthy();
        const todo = await todoResponse.json();

        await page.goto(`/todo/${todo.id}`);
        await page.waitForLoadState('networkidle');

        // Vuetify's auto-grow textarea renders a second, hidden "sizer"
        // textarea (used internally to measure content height) alongside
        // the real input - exclude it so the locator stays unambiguous.
        const titleField = page
            .getByTestId('todo-detail-title')
            .locator('textarea:not(.v-textarea__sizer)');
        await expect(titleField).toHaveValue(longTitle);

        // The title box must grow to fit every wrapped line rather than
        // clipping the overflow of a fixed single-row textarea.
        await expect
            .poll(async () =>
                titleField.evaluate((el: HTMLTextAreaElement) => el.scrollHeight - el.clientHeight),
            )
            .toBeLessThanOrEqual(1);

        // A title this long must not fit on a single line.
        const singleLineHeight = await titleField.evaluate((el: HTMLTextAreaElement) => {
            const style = getComputedStyle(el);
            return parseFloat(style.lineHeight);
        });
        const renderedHeight = await titleField.evaluate(
            (el: HTMLTextAreaElement) => el.clientHeight,
        );
        expect(renderedHeight).toBeGreaterThan(singleLineHeight * 1.5);
    });
});
