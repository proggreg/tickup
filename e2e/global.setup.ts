import { test as setup, expect } from '@playwright/test';

setup('Authenticate', async ({ page }) => {
    // TODO seed db data, using a single test user for now
    console.log('Setting up authentication...');

    // Navigate to login page
    await page.goto('/login');

    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');

    // Fill in the email field using input selector
    const emailInput = page.locator('input[type="email"]');
    await emailInput.waitFor({ state: 'visible' });
    await emailInput.fill('test@example.com');

    // Fill in the password field using input selector
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill('password');

    // Click the Sign In button
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    await signInButton.click();

    // Wait for navigation after login - should redirect to home page
    await page.waitForURL('/', { timeout: 10000 });

    // Verify we're actually logged in by checking we're not on login page
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    console.log('Successfully authenticated and redirected to:', currentUrl);

    // Save authentication state to user.json for use in other tests
    await page.context().storageState({ path: 'user.json' });
    console.log('Authentication state saved to user.json');
});
