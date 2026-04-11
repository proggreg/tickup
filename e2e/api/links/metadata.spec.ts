import { test, expect } from '@playwright/test';

test.describe('Links', () => {
    test.skip('should fetch the youtube title', async ({ request }) => {
        const url = 'https://www.youtube.com/watch?v=R8h_gpSpEVU';
        const urls = JSON.stringify([url]);
        const response = await request.get(`/api/metadata?urls=${urls}`);

        const titles = await response.json();
        const title = titles.find(title => title.url === url);
        expect(title.title).toBe('Deploying AI Models with Hugging Face – Hands-On Course - YouTube');
    });
});
