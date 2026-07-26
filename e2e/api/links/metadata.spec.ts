import { test, expect } from '@playwright/test';

test.describe('Links', () => {
    test.skip('should fetch the youtube title', async ({ request }) => {
        const url = 'https://www.youtube.com/watch?v=R8h_gpSpEVU';
        const urls = JSON.stringify([url]);
        const response = await request.get(`/api/metadata?urls=${urls}`);

        const titles = await response.json();
        const title = titles.find(title => title.url === url);
        expect(title.title).toBe(
            'Deploying AI Models with Hugging Face – Hands-On Course - YouTube',
        );
    });

    test('one unreachable url does not block titles for the others in the same request', async ({ request }) => {
        const badUrl = 'http://localhost:1/does-not-exist';
        const goodUrl = 'https://example.com';
        const urls = JSON.stringify([badUrl, goodUrl]);

        const response = await request.get(`/api/metadata?urls=${urls}`);
        expect(response.ok()).toBeTruthy();

        const titles = await response.json();
        expect(Array.isArray(titles)).toBe(true);
        expect(titles.find(t => t.url === goodUrl)).toBeTruthy();
    });
});
