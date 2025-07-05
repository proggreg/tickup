import { test, expect } from '@playwright/test'

test.describe('Login Demo Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.setExtraHTTPHeaders({
      'x-test-mode': 'true'
    })
  })

  test('Demonstrate login form interaction', async ({ page }) => {
    // Navigate to the application
    await page.goto('/')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Verify we're on the login page
    await expect(page).toHaveTitle(/TickUp/)
    await expect(page.locator('text=Login')).toBeVisible()
    
    // Show the login form
    console.log('Login page loaded successfully')
    
    // Fill in some test credentials (these will fail, but that's okay for the demo)
    await page.locator('input').nth(0).fill('demo-user')
    await page.locator('input').nth(1).fill('demo-password')
    
    // Click the login button
    await page.click('button:has-text("Login")')
    
    // Wait for the error to appear
    await page.waitForTimeout(2000)
    
    // Verify the error message appears
    await expect(page.locator('text=Incorrect Credentials')).toBeVisible()
    
    console.log('Login form interaction completed - error message shown as expected')
    
    // Take a final screenshot
    await page.screenshot({ path: 'login-demo-complete.png' })
  })

  test('Show login form structure', async ({ page }) => {
    await page.goto('/')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Show the form structure
    console.log('=== Login Form Structure ===')
    console.log('URL:', page.url())
    console.log('Title:', await page.title())
    
    // Show input fields
    const inputs = await page.locator('input').all()
    console.log(`\nInput Fields (${inputs.length}):`)
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i]
      const type = await input.getAttribute('type')
      const placeholder = await input.getAttribute('placeholder')
      const label = await input.getAttribute('label')
      console.log(`  Input ${i}: type="${type}", placeholder="${placeholder}", label="${label}"`)
    }
    
    // Show buttons
    const buttons = await page.locator('button').all()
    console.log(`\nButtons (${buttons.length}):`)
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i]
      const text = await button.textContent()
      const disabled = await button.isDisabled()
      const type = await button.getAttribute('type')
      console.log(`  Button ${i}: text="${text?.trim()}", disabled=${disabled}, type="${type}"`)
    }
    
    // Show other form elements
    const form = await page.locator('form').all()
    console.log(`\nForms (${form.length}):`)
    for (let i = 0; i < form.length; i++) {
      const formElement = form[i]
      const action = await formElement.getAttribute('action')
      const method = await formElement.getAttribute('method')
      console.log(`  Form ${i}: action="${action}", method="${method}"`)
    }
    
    console.log('\n=== End Form Structure ===')
  })
}) 