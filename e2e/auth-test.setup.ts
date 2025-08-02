import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = './user.json';

setup('authenticate', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('/login');
  await page.getByLabel('Username').fill('test');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForTimeout(5000);
  await page.context().storageState({ path: authFile });
});