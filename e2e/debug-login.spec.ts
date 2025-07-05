import { test, expect } from '@playwright/test'

const TEST_USER = {
  username: 'testuser',
  password: 'testpassword123',
  email: 'test@example.com'
}

test.describe('Debug Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.setExtraHTTPHeaders({
      'x-test-mode': 'true'
    })
  })

  test('Debug login page elements', async ({ page }) => {
    await page.goto('/')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Take a screenshot to see what's on the page
    await page.screenshot({ path: 'debug-login-page.png' })
    
    // Check what inputs are available
    const inputs = await page.locator('input').all()
    console.log(`Found ${inputs.length} input elements`)
    
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i]
      const placeholder = await input.getAttribute('placeholder')
      const type = await input.getAttribute('type')
      const label = await input.getAttribute('label')
      console.log(`Input ${i}: placeholder="${placeholder}", type="${type}", label="${label}"`)
    }
    
    // Check what buttons are available
    const buttons = await page.locator('button').all()
    console.log(`Found ${buttons.length} button elements`)
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i]
      const text = await button.textContent()
      const icon = await button.getAttribute('icon')
      console.log(`Button ${i}: text="${text?.trim()}", icon="${icon}"`)
    }
    
    // Try to fill the first two inputs (username and password)
    if (inputs.length >= 2) {
      await inputs[0].fill(TEST_USER.username)
      await inputs[1].fill(TEST_USER.password)
      
      // Find and click the login button
      const loginButton = page.locator('button:has-text("Login")')
      if (await loginButton.isVisible()) {
        await loginButton.click()
        
        // Wait a bit and take another screenshot
        await page.waitForTimeout(2000)
        await page.screenshot({ path: 'debug-after-login.png' })
        
        // Check if we're still on the login page or if we got redirected
        console.log('Current URL:', page.url())
      } else {
        console.log('Login button not found')
      }
    }
  })
}) 