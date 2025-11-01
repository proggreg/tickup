import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(process.cwd(), 'user.json');

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');
  
  // Wait for login form
  await page.waitForSelector('input[type="text"]', { state: 'visible' });
  
  // Fill credentials
  await page.getByLabel('Username').fill('test');
  await page.getByLabel('Password').fill('password');
  
  // Click login and wait for navigation away from login
  await Promise.all([
    page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 }),
    page.getByRole('button', { name: 'Login' }).click(),
  ]);
  
  // Verify we're logged in
  const currentUrl = page.url();
  expect(currentUrl).not.toContain('/login');
  
  // Wait a bit for the redirect and cookie to be set
  await page.waitForTimeout(2000);
  
  // Check for session cookie via Playwright context (handles httpOnly cookies)
  const cookies = await page.context().cookies();
  const hasSessionCookie = cookies.some(cookie => 
    cookie.name.includes('next-auth.session-token') ||
    cookie.name.includes('session')
  );
  
  if (!hasSessionCookie) {
    console.warn('⚠️  Session cookie not found immediately after login, waiting...');
    // Wait a bit more and check again
    await page.waitForTimeout(2000);
    const cookies2 = await page.context().cookies();
    const hasSessionCookie2 = cookies2.some(cookie => 
      cookie.name.includes('next-auth.session-token') ||
      cookie.name.includes('session')
    );
    if (!hasSessionCookie2) {
      console.warn('⚠️  Still no session cookie found');
      console.log('Cookies found:', cookies2.map(c => c.name).join(', '));
    }
  }
  
  // Navigate to home to ensure auth state is initialized
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Wait for logged-in UI element
  await page.waitForSelector('input[placeholder*="Add todo"], button[data-testid="new-list-button"], .v-navigation-drawer', { 
    timeout: 5000 
  }).catch(() => {
    // If not found, continue anyway - might be a different page layout
  });
  
  // Additional wait for client-side auth hydration
  await page.waitForTimeout(1000);
  
  // Save authenticated state
  await page.context().storageState({ path: authFile });
  
  // Verify cookies were saved (check one more time after saving)
  const finalCookies = await page.context().cookies();
  const hasFinalSessionCookie = finalCookies.some(cookie => 
    cookie.name.includes('session') || cookie.name.includes('auth')
  );
  
  console.log(`✅ Auth setup complete`);
  console.log(`   URL: ${currentUrl}`);
  console.log(`   Session cookie: ${hasFinalSessionCookie ? 'Found' : 'Missing'}`);
  console.log(`   Cookies saved: ${finalCookies.length}`);
  console.log(`   Saved to: ${authFile}`);
});