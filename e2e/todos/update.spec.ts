import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('Update Todo', () => {
    test.beforeEach(async ({ page, request, isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');

        const listResponse = await request.post('/api/list', {
            data: {
                name: `Update Todo List ${uuidv4()}`,
                icon: 'mdi-format-list-bulleted',
                listType: 'simple',
                todos: [],
            },
        });
        const list = await listResponse.json();

        await page.goto(`/list/${list.id}`);
        await page.waitForLoadState('networkidle');

        const todoName = `Todo ${uuidv4()}`;
        const newTodoInput = page.getByTestId('new-todo-input').locator('input');
        await newTodoInput.fill(todoName);
        await newTodoInput.press('Enter');
        await page.waitForLoadState('networkidle');

        await page.getByTestId('todo-title').filter({ hasText: todoName }).click();
        await page.waitForURL(/\/todo\//, { timeout: 5000 });
    });

    test.skip('keeps local description while typing when stale API response arrives', async ({ page, isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');

        const descriptionField = page.locator('textarea').first();
        await expect(descriptionField).toBeVisible();

        const firstChunk = `Draft ${uuidv4()}`;
        const secondChunk = ' still typing';
        const expectedDescription = `${firstChunk}${secondChunk}`;

        let putRequestCount = 0;

        await page.route('**/api/todo/*', async (route) => {
            const request = route.request();

            if (request.method() !== 'PUT') {
                await route.continue();
                return;
            }

            putRequestCount += 1;

            // Simulate an out-of-order stale response for the first save.
            // Later saves continue normally to mimic real API behavior.
            if (putRequestCount === 1) {
                const staleBody = request.postDataJSON() as Record<string, unknown>;
                await new Promise(resolve => setTimeout(resolve, 1200));
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ ...staleBody, desc: firstChunk }),
                });
                return;
            }

            await route.continue();
        });

        await descriptionField.fill(firstChunk);
        await expect(descriptionField).toHaveValue(firstChunk);
        await page.waitForTimeout(300); // send first debounced PUT

        // Continue editing before the delayed first response returns.
        await descriptionField.fill(expectedDescription);
        await expect(descriptionField).toHaveValue(expectedDescription);

        // Wait for second save (new text) and then the delayed stale first response.
        await page.waitForTimeout(1700);

        await expect(descriptionField).toHaveValue(expectedDescription);
    });
});
