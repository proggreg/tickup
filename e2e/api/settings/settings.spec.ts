import { test, expect } from '@playwright/test';

test.describe('Settings API', () => {
    test('GET /api/settings returns current settings object', async ({ request }) => {
        const response = await request.get('/api/settings');

        expect(response.ok()).toBeTruthy();

        const body = await response.json();
        expect(body).toHaveProperty('statuses');
        expect(Array.isArray(body.statuses)).toBeTruthy();
    });

    test('PUT /api/settings updates statuses and GET reflects the change', async ({ request }) => {
        const updatedStatuses = [
            { name: 'Todo', color: '#aabbcc' },
            { name: 'Done', color: '#00ff00' },
        ];

        const putResponse = await request.put('/api/settings', {
            data: { statuses: updatedStatuses },
        });

        expect(putResponse.ok()).toBeTruthy();
        const putBody = await putResponse.json();
        expect(putBody.statuses).toEqual(updatedStatuses);

        const getResponse = await request.get('/api/settings');
        expect(getResponse.ok()).toBeTruthy();
        const getBody = await getResponse.json();
        expect(getBody.statuses).toEqual(updatedStatuses);
    });

    test('PUT /api/settings with missing statuses field returns 400', async ({ request }) => {
        const response = await request.put('/api/settings', {
            data: { unknownField: 'value' },
        });

        expect(response.status()).toBe(400);
    });

    test('PUT /api/settings with non-array statuses returns 400', async ({ request }) => {
        const response = await request.put('/api/settings', {
            data: { statuses: 'not-an-array' },
        });

        expect(response.status()).toBe(400);
    });
});
