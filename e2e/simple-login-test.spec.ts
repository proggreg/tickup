import { test, expect } from '@playwright/test'

test.describe('Simple Login Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.setExtraHTTPHeaders({
      'x-test-mode': 'true'
    })
  })

  test('Check what page we are on', async ({ page }) => {
    await page.goto('/')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    console.log('Current URL:', page.url())
    console.log('Page title:', await page.title())
    
    // Check if we're on login page or home page
    if (page.url().includes('/login')) {
      console.log('We are on the login page')
      
      // Check for login form elements
      const inputs = await page.locator('input').all()
      console.log(`Found ${inputs.length} input elements on login page`)
      
      const buttons = await page.locator('button').all()
      console.log(`Found ${buttons.length} button elements on login page`)
      
    } else {
      console.log('We are NOT on the login page - might be already logged in')
      
      // Check for authenticated user elements
      const plusButtons = await page.locator('button').filter({ hasText: '+' }).all()
      console.log(`Found ${plusButtons.length} plus buttons`)
      
      // Check for navigation elements
      const navElements = await page.locator('nav, [role="navigation"]').all()
      console.log(`Found ${navElements.length} navigation elements`)
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'simple-login-test.png' })
  })
}) 