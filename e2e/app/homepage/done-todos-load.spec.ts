import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('Homepage done tab', () => {
    test.beforeEach(async ({ request, isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');

        const testId = uuidv4();
        const listResponse = await request.post('/api/list', {
            data: {
                name: `Done List ${testId}`,
                icon: 'mdi-format-list-bulleted',
                listType: 'simple',
                todos: [],
            },
        });
        const list = await listResponse.json();

        await request.post('/api/todo', {
            data: {
                name: `Legacy done todo ${testId}`,
                status: 'done',
                dueDate: new Date().toISOString(),
                listId: list.id,
                edit: false,
                color: '#87909e',
                links: [],
                priorityLev: '',
            },
        });
    });

    test('loads legacy done todos in the Done tab', async ({ page, isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await page.getByRole('tab', { name: 'Done' }).click();

        await expect(page.getByTestId('todo-title').filter({ hasText: 'Legacy done todo' })).toBeVisible();
    });
});
