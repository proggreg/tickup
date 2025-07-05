import { test, expect } from '@playwright/test'

const TEST_USER = {
  username: 'testuser',
  password: 'testpassword123',
  email: 'test@example.com'
}

test.describe('Login Video Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.setExtraHTTPHeaders({
      'x-test-mode': 'true'
    })
  })

  test('Record login journey with video', async ({ page }) => {
    // Navigate to the application
    await page.goto('/')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Verify we're on the login page
    await expect(page).toHaveTitle(/TickUp/)
    await expect(page.locator('text=Login')).toBeVisible()
    
    // Fill in the login form
    await page.locator('input').nth(0).fill(TEST_USER.username)
    await page.locator('input').nth(1).fill(TEST_USER.password)
    
    // Click the login button
    await page.click('button:has-text("Login")')
    
    // Wait for response
    await page.waitForTimeout(3000)
    
    // Check the current URL to see if login was successful
    console.log('Current URL after login attempt:', page.url())
    
    // Take a screenshot to see the result
    await page.screenshot({ path: 'login-result.png' })
    
    // If login was successful, we should be redirected away from /login
    if (!page.url().includes('/login')) {
      console.log('Login appears to be successful!')
      
      // Wait a bit more and take another screenshot
      await page.waitForTimeout(2000)
      await page.screenshot({ path: 'after-login-success.png' })
      
      // Try to find the plus button or other authenticated user elements
      const buttons = await page.locator('button').all()
      console.log(`Found ${buttons.length} buttons after login`)
      
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i]
        const text = await button.textContent()
        console.log(`Button ${i}: "${text?.trim()}"`)
      }
      
    } else {
      console.log('Login failed - still on login page')
      
      // Check for error message
      const errorMessage = page.locator('text=Incorrect Credentials')
      if (await errorMessage.isVisible()) {
        console.log('Error message is visible')
      } else {
        console.log('No error message found')
      }
    }
  })

  test('Show login form elements', async ({ page }) => {
    await page.goto('/')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Show the login form structure
    console.log('Login page URL:', page.url())
    console.log('Page title:', await page.title())
    
    // List all form elements
    const inputs = await page.locator('input').all()
    console.log(`Found ${inputs.length} input elements`)
    
    const buttons = await page.locator('button').all()
    console.log(`Found ${buttons.length} button elements`)
    
    // Show what's in each input
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i]
      const type = await input.getAttribute('type')
      const placeholder = await input.getAttribute('placeholder')
      console.log(`Input ${i}: type="${type}", placeholder="${placeholder}"`)
    }
    
    // Show what's in each button
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i]
      const text = await button.textContent()
      const disabled = await button.isDisabled()
      console.log(`Button ${i}: text="${text?.trim()}", disabled=${disabled}`)
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'login-form-elements.png' })
  })
}) 