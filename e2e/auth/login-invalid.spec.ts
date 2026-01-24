import { test, expect } from '@playwright/test';

test.describe('Login with invalid credentials', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('shows an error alert when email or password is incorrect', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        await page.locator('input[type="email"]').fill('invalid@example.com');
        await page.locator('input[type="password"]').fill('wrongpassword');

        await page.getByRole('button', { name: 'Sign In' }).click();

        const alert = page.getByTestId('login-error-alert');
        await expect(alert).toBeVisible({ timeout: 10000 });
        await expect(alert).toContainText(/Invalid|incorrect|credentials|error/i);
    });
});
