import { test, expect } from '../../fixtures/index';
import { v4 as uuidv4 } from 'uuid';

test.describe('Service worker — StaleWhileRevalidate error handling', () => {
    test('navigating to a list page does not throw no-response error', async ({
        page,
        listAPI,
    }) => {
        const list = await listAPI.new({ name: `SW test ${uuidv4()}`, listType: '' });

        const pageErrors: string[] = [];
        page.on('pageerror', (err) => pageErrors.push(err.message));

        await page.goto(`/list/${list.id}`);
        await page.waitForLoadState('networkidle');

        // Clean up
        await page.request.delete(`/api/list/${list.id}`);

        const noResponseErrors = pageErrors.filter((e) => e.includes('no-response'));
        expect(noResponseErrors).toHaveLength(0);
    });

    test('navigating to a todo page does not throw no-response error', async ({
        page,
        listAPI,
        request,
    }) => {
        const list = await listAPI.new({ name: `SW test ${uuidv4()}`, listType: '' });
        const todoRes = await request.post('/api/todo', {
            data: { name: `SW todo ${uuidv4()}`, listId: list.id, status: 'Open' },
        });
        expect(todoRes.ok()).toBeTruthy();
        const todo = await todoRes.json();

        const pageErrors: string[] = [];
        page.on('pageerror', (err) => pageErrors.push(err.message));

        await page.goto(`/todo/${todo.id}`);
        await page.waitForLoadState('networkidle');

        // Clean up
        await request.delete(`/api/todo/${todo.id}`);
        await request.delete(`/api/list/${list.id}`);

        const noResponseErrors = pageErrors.filter((e) => e.includes('no-response'));
        expect(noResponseErrors).toHaveLength(0);
    });
});
