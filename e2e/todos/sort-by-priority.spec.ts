import { test, expect } from '../fixtures/index';
import { v4 as uuidv4 } from 'uuid';
import { deleteLists } from '../helpers/teardown';

test.describe('Sort list by priority', () => {
    test.beforeEach(async ({ page }) => {
        await deleteLists();
    });

    test('sorting by priority puts high-priority todos first', async ({ listAPI, page }) => {
        const list = await listAPI.new({
            name: `Sort Priority List ${uuidv4()}`,
            listType: 'simple',
        });

        const lowName = `Low ${uuidv4()}`;
        const highName = `High ${uuidv4()}`;

        await page.request.post('/api/todo', {
            data: {
                name: lowName,
                listId: list.id,
                status: 'Open',
                priorityLev: 'low',
                color: '#87909e',
                links: [],
                attachments: [],
                edit: false,
            },
        });
        await page.request.post('/api/todo', {
            data: {
                name: highName,
                listId: list.id,
                status: 'Open',
                priorityLev: 'high',
                color: '#87909e',
                links: [],
                attachments: [],
                edit: false,
            },
        });

        await page.goto(`/list/${list.id}`);
        await page.waitForLoadState('networkidle');

        await page.getByTestId('list-sort-select').click();
        await page.getByRole('option', { name: 'Priority' }).click();

        const titles = page.getByTestId('todo-title');
        await expect(titles.first()).toHaveText(highName);
    });
});
