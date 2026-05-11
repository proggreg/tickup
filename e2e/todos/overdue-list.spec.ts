import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('Overdue todos', () => {
    test.skip('shows overdue todos in the Overdue list', async ({ page, request }) => {
        const testId = uuidv4();
        const listName = `Overdue List ${testId}`;
        const todoName = `Overdue Todo ${testId}`;

        const listResponse = await request.post('/api/list', {
            data: {
                name: listName,
                icon: 'mdi-format-list-bulleted',
                listType: 'simple',
                todos: [],
            },
        });
        const list = await listResponse.json();

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        await request.post('/api/todo', {
            data: {
                name: todoName,
                listId: list.id,
                status: 'Open',
                dueDate: yesterday.toISOString(),
                color: '#87909e',
                priorityLev: '',
                links: [],
            },
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const overdueTab = page.getByRole('tab', { name: 'Overdue' });
        await overdueTab.click();
        await expect(overdueTab).toHaveAttribute('aria-selected', 'true');

        await expect(page.getByText('Open', { exact: true })).toBeVisible();
        await expect(page.getByText(todoName, { exact: true })).toBeVisible();
    });
});
