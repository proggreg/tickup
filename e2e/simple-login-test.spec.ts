import { test, expect } from '@playwright/test'

test.describe('Simple Login Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.setExtraHTTPHeaders({
      'x-test-mode': 'true'
    })
  })

  test('Check what page we are on', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Check if we're on login page or home page
    if (page.url().includes('/login')) {
      // Check for login form elements
      const inputs = await page.locator('input').all()
      const buttons = await page.locator('button').all()
    } else {
      // Check for authenticated user elements
      const plusButtons = await page.locator('button').filter({ hasText: '+' }).all()
      // Check for navigation elements
      const navElements = await page.locator('nav, [role="navigation"]').all()
    }
    await page.screenshot({ path: 'simple-login-test.png' })
  })
}) 