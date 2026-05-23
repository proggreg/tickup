import { test, expect } from '@playwright/test';
import { createList } from '../helpers/lists';
import { createTodo } from '../helpers/todos';

test.describe('PUT /api/todo/[id] — status validation', () => {
    let listId: number;
    let todoId: number;

    test.beforeAll(async ({ request }) => {
        await request.put('/api/settings', { data: { statuses: [] } });
    });

    test.afterAll(async ({ request }) => {
        await request.put('/api/settings', { data: { statuses: [] } });
    });

    test.beforeEach(async ({ request }) => {
        const list = await createList(request, { name: 'Status Validation Test List' });
        listId = list.id;
        const todo = await createTodo(request, {
            name: 'Status Validation Test Todo',
            dueDate: new Date(),
            listId: String(listId),
        });
        todoId = todo.id;
    });

    test.afterEach(async ({ request }) => {
        await request.delete(`/api/list/${listId}`);
    });

    test('accepts a default status (Open)', async ({ request }) => {
        const response = await request.put(`/api/todo/${todoId}`, {
            data: { status: 'Open' },
        });
        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        expect(body.status).toBe('Open');
    });

    test('accepts a default status (In Progress)', async ({ request }) => {
        const response = await request.put(`/api/todo/${todoId}`, {
            data: { status: 'In Progress' },
        });
        expect(response.ok()).toBeTruthy();
    });

    test('accepts a default status (Closed)', async ({ request }) => {
        const response = await request.put(`/api/todo/${todoId}`, {
            data: { status: 'Closed' },
        });
        expect(response.ok()).toBeTruthy();
    });

    test('rejects an invalid status', async ({ request }) => {
        const response = await request.put(`/api/todo/${todoId}`, {
            data: { status: 'NotARealStatus' },
        });
        expect(response.status()).toBe(400);
    });

    test('allows update without a status field (no validation)', async ({ request }) => {
        const response = await request.put(`/api/todo/${todoId}`, {
            data: { name: 'Updated Name' },
        });
        expect(response.ok()).toBeTruthy();
    });

    test('accepts custom status from user settings', async ({ request }) => {
        const customStatuses = [
            { name: 'Backlog', color: '#aabbcc' },
            { name: 'Done', color: '#00ff00' },
        ];
        await request.put('/api/settings', { data: { statuses: customStatuses } });

        const response = await request.put(`/api/todo/${todoId}`, {
            data: { status: 'Backlog' },
        });
        expect(response.ok()).toBeTruthy();
    });

    test('rejects default status when user has custom statuses', async ({ request }) => {
        const customStatuses = [{ name: 'Backlog', color: '#aabbcc' }];
        await request.put('/api/settings', { data: { statuses: customStatuses } });

        const response = await request.put(`/api/todo/${todoId}`, {
            data: { status: 'Open' },
        });
        expect(response.status()).toBe(400);

        // Reset settings
        await request.put('/api/settings', { data: { statuses: [] } });
    });
});
