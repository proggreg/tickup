import { test, expect } from '../fixtures/index';
import { v4 as uuidv4 } from 'uuid';
import { deleteLists } from '../helpers/teardown';

test.describe('todo detail title wrapping', () => {
    test.beforeEach(async ({ isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');
        await deleteLists();
    });

    test('wraps a long title onto multiple lines instead of clipping it', async ({
        listAPI,
        page,
    }) => {
        const testId = uuidv4();
        const list = await listAPI.new({
            name: `Title Wrap List ${testId}`,
            listType: 'simple',
        });

        await page.goto(`/list/${list.id}`);
        await page.waitForLoadState('networkidle');

        const longTitle = `As a user I should be able to create and select a list when adding a new todo ${testId}`;

        const newTodoInput = page.getByTestId('new-todo-input').locator('input');
        await newTodoInput.fill(longTitle);
        await newTodoInput.press('Enter');
        await page.waitForLoadState('networkidle');

        await page.getByTestId('todo-title').filter({ hasText: testId }).click();
        await page.waitForURL(/\/todo\//, { timeout: 5000 });

        const titleField = page.getByTestId('todo-detail-title').locator('textarea');
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
