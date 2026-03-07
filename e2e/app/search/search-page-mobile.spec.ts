import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

test.describe('Search page on mobile', () => {
    test('keeps the search input fixed and dialog closed on mobile', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'This regression is mobile-specific');

        await page.goto('/search');
        await page.waitForLoadState('networkidle');

        await expect(page.getByTestId('mobile-search-input')).not.toBeHidden();
        await expect(page.getByPlaceholder('ctrl + k')).toHaveCount(0);
        await expect(page.locator('.v-overlay[role="dialog"]')).toHaveCount(0);

        const fixedInput = page.getByTestId('search-input-fixed');
        const isFixed = await fixedInput.evaluate(el => window.getComputedStyle(el).position === 'fixed');
        expect(isFixed).toBe(true);
    });

    test('results area is scrollable and does not overflow horizontally', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'This regression is mobile-specific');

        await page.goto('/search');
        await page.waitForLoadState('networkidle');

        const searchInput = page.getByTestId('mobile-search-input').locator('input');
        await searchInput.fill('this is an intentionally very long search query to verify the mobile layout remains stable and usable');

        const resultsContainer = page.getByTestId('search-results-container');
        const hasScrollableOverflow = await resultsContainer.evaluate((el) => {
            const styles = window.getComputedStyle(el);
            return styles.overflowY === 'auto' || styles.overflowY === 'scroll';
        });
        expect(hasScrollableOverflow).toBe(true);

        const hasNoHorizontalOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth <= document.documentElement.clientWidth
                && document.body.scrollWidth <= document.body.clientWidth;
        });
        expect(hasNoHorizontalOverflow).toBe(true);
    });

    test('disables status button in search page results', async ({ page, request, isMobile }) => {
        test.skip(!isMobile, 'This regression is mobile-specific');

        const testId = uuidv4();
        const response = await request.post('/api/list', {
            data: {
                name: `Search List ${testId}`,
                icon: 'mdi-format-list-bulleted',
                listType: 'simple',
                todos: [],
            },
        });
        const list = await response.json();

        const todoName = `Search Todo ${testId}`;
        await request.post('/api/todo', {
            data: {
                name: todoName,
                listId: list.id,
                status: 'Open',
            },
        });

        await page.goto('/search');
        await page.waitForLoadState('networkidle');

        const searchInput = page.getByTestId('mobile-search-input').locator('input');
        await searchInput.fill(todoName);

        await expect(page.getByText(todoName)).not.toBeHidden();
        await expect(page.getByTestId('status-button').first()).toBeDisabled();
    });
});
