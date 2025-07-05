import { test, expect } from '@playwright/test'

const TEST_USER = {
  username: 'testuser',
  password: 'testpassword123',
  email: 'test@example.com'
}

test.describe('Verify Test User', () => {
  test.beforeEach(async ({ page }) => {
    await page.setExtraHTTPHeaders({
      'x-test-mode': 'true'
    })
  })

  test('Verify test user exists', async ({ page }) => {
    // Try to create the user again to see if it already exists
    const response = await page.request.post('http://localhost:3000/api/auth/user', {
      data: {
        username: TEST_USER.username,
        password: TEST_USER.password,
        email: TEST_USER.email
      }
    })

    console.log('Response status:', response.status())
    const body = await response.text()
    console.log('Response body:', body)

    if (response.status() === 200) {
      console.log('User created successfully')
    } else if (response.status() === 400 && body.includes('username taken')) {
      console.log('User already exists')
    } else {
      console.log('Unexpected response:', body)
    }
  })

  test('Try to login with test user', async ({ page }) => {
    await page.goto('/')
    
    // Fill in the login form
    const inputs = await page.locator('input').all()
    await inputs[0].fill(TEST_USER.username)
    await inputs[1].fill(TEST_USER.password)
    
    // Click login
    await page.click('button:has-text("Login")')
    
    // Wait for response
    await page.waitForTimeout(3000)
    
    console.log('Current URL after login attempt:', page.url())
    
    // Check if there's an error message
    const errorMessage = page.locator('text=Incorrect Credentials')
    if (await errorMessage.isVisible()) {
      console.log('Error message is visible')
    } else {
      console.log('No error message found')
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'verify-login-attempt.png' })
  })
}) 