import { test, expect } from '../fixtures/index';
import { v4 as uuidv4 } from 'uuid';
import { deleteLists } from '../helpers/teardown';

test.describe('Priority icon in list view', () => {
    test.beforeEach(async ({ page }) => {
        await deleteLists();
    });

    async function createTodo(page, listId: string, name: string, priorityLev: string) {
        await page.request.post('/api/todo', {
            data: {
                name,
                listId,
                status: 'Open',
                priorityLev,
                color: '#87909e',
                links: [],
                attachments: [],
                edit: false,
            },
        });
    }

    test('shows a priority icon for medium and low priority todos', async ({
        listAPI,
        page,
    }) => {
        const list = await listAPI.new({
            name: `List View Priority ${uuidv4()}`,
            listType: 'simple',
        });

        const mediumName = `Medium ${uuidv4()}`;
        const lowName = `Low ${uuidv4()}`;
        const noneName = `None ${uuidv4()}`;

        await createTodo(page, list.id, mediumName, 'medium');
        await createTodo(page, list.id, lowName, 'low');
        await createTodo(page, list.id, noneName, '');

        await page.goto(`/list/${list.id}`);
        await page.waitForLoadState('networkidle');

        const mediumRow = page.getByTestId('todo-title').filter({ hasText: mediumName }).locator('..');
        const lowRow = page.getByTestId('todo-title').filter({ hasText: lowName }).locator('..');
        const noneRow = page.getByTestId('todo-title').filter({ hasText: noneName }).locator('..');

        await expect(mediumRow.getByTestId('todo-priority-icon')).toBeVisible();
        await expect(lowRow.getByTestId('todo-priority-icon')).toBeVisible();
        await expect(noneRow.getByTestId('todo-priority-icon')).toHaveCount(0);
    });
});
