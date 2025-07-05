import { test, expect } from '@playwright/test'

const TEST_USER = {
  username: 'testuser',
  password: 'testpassword123',
  email: 'test@example.com'
}

test('Debug login flow', async ({ page }) => {
  // Step 1: Check if test user exists via API
  const response = await page.request.get('http://localhost:3000/api/auth/user?username=testuser')
  console.log('User check response:', response.status())
  
  // Step 2: Try to login
  await page.goto('/')
  console.log('Current URL:', page.url())
  
  // Fill login form
  await page.locator('input').nth(0).fill(TEST_USER.username)
  await page.locator('input').nth(1).fill(TEST_USER.password)
  
  // Click login
  await page.click('button:has-text("Login")')
  
  // Wait a bit and check URL
  await page.waitForTimeout(3000)
  console.log('URL after login attempt:', page.url())
  
  // Check if we're still on login page
  const currentUrl = page.url()
  if (currentUrl.includes('/login')) {
    console.log('Still on login page - login failed')
    // Check for error message
    const errorElement = page.locator('text=Incorrect Credentials')
    if (await errorElement.isVisible()) {
      console.log('Error message is visible')
    } else {
      console.log('No error message found')
    }
    
    // Wait a bit more for error message to appear
    await page.waitForTimeout(2000)
    if (await errorElement.isVisible()) {
      console.log('Error message appeared after waiting')
    } else {
      console.log('Error message still not visible')
    }
  } else {
    console.log('Login successful - redirected to:', currentUrl)
  }
})

test('Create user and login immediately', async ({ page }) => {
  const uniqueUser = {
    username: `testuser_${Date.now()}`,
    password: 'testpassword123',
    email: `test_${Date.now()}@example.com`
  }
  
  // Create a new user
  const createResponse = await page.request.post('http://localhost:3000/api/auth/user', {
    data: uniqueUser
  })
  console.log('Create user response:', createResponse.status())
  
  // Try to login with the new user
  await page.goto('/')
  await page.locator('input').nth(0).fill(uniqueUser.username)
  await page.locator('input').nth(1).fill(uniqueUser.password)
  await page.click('button:has-text("Login")')
  
  // Wait for navigation
  await page.waitForTimeout(3000)
  console.log('URL after login with new user:', page.url())
  
  if (page.url().includes('/login')) {
    console.log('Login failed with new user')
  } else {
    console.log('Login successful with new user')
  }
})

test('Debug form submission', async ({ page }) => {
  await page.goto('/')
  
  // Listen for network requests
  const requests: string[] = []
  page.on('request', request => {
    if (request.url().includes('/api/auth')) {
      requests.push(`${request.method()} ${request.url()}`)
      console.log(`Request: ${request.method()} ${request.url()}`)
    }
  })
  
  page.on('response', response => {
    if (response.url().includes('/api/auth')) {
      console.log(`Response: ${response.status()} ${response.url()}`)
    }
  })
  
  // Fill and submit form
  await page.locator('input').nth(0).fill('test')
  await page.locator('input').nth(1).fill('password')
  await page.click('button:has-text("Login")')
  
  // Wait for requests to complete
  await page.waitForTimeout(5000)
  console.log('All auth requests:', requests)
})

test('Debug form validation', async ({ page }) => {
  await page.goto('/')
  
  // Check if form validation is working
  console.log('Checking form validation...')
  
  // Try to submit empty form
  await page.click('button:has-text("Login")')
  await page.waitForTimeout(1000)
  
  // Check for validation errors
  const validationErrors = await page.locator('.v-messages__message').all()
  console.log('Validation errors found:', validationErrors.length)
  
  for (let i = 0; i < validationErrors.length; i++) {
    const error = validationErrors[i]
    const text = await error.textContent()
    console.log(`Validation error ${i}:`, text)
  }
  
  // Now fill the form properly
  await page.locator('input').nth(0).fill('testuser')
  await page.locator('input').nth(1).fill('testpassword123')
  
  // Check if login button is enabled
  const loginButton = page.locator('button:has-text("Login")')
  const isDisabled = await loginButton.isDisabled()
  console.log('Login button disabled:', isDisabled)
  
  // Try to submit again
  await page.click('button:has-text("Login")')
  await page.waitForTimeout(3000)
  console.log('URL after form submission:', page.url())
}) 