import { test, expect } from '@playwright/test';
// import { createClient } from '@supabase/supabase-js';

test.describe('Navigation after login', () => {
    test.use({ storageState: '' });

    test('should show navigation after desktop login', async ({ page, isMobile }) => {
        test.skip(isMobile, 'This feature is desktop only');
        // Navigate to home page (user is already authenticated from setup)

        await page.goto('/');

        // Wait for the page to load
        await page.waitForLoadState('networkidle');

        // Fill in the email field using input selector
        const emailInput = page.locator('input[type="email"]');
        await emailInput.waitFor({ state: 'visible' });
        await emailInput.fill('testuser@example.com');

        // Fill in the password field using input selector
        const passwordInput = page.locator('input[type="password"]');
        await passwordInput.waitFor({ state: 'visible' });
        await passwordInput.fill('password');

        // Click the Sign In button
        const signInButton = page.getByRole('button', { name: 'Sign In' });
        await signInButton.click();

        // Wait for navigation after login - should redirect to home page
        await page.waitForURL('/', { timeout: 10000 });

        // Check that navigation is visible on desktop
        const navigation = page.getByTestId('nav-bar');
        await expect(navigation).toBeVisible();
    });
});
