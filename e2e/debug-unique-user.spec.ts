import { test, expect } from '@playwright/test'

test('Debug unique user creation and login', async ({ page }) => {
  const uniqueUser = {
    username: `testuser_${Date.now()}`,
    password: 'testpassword123',
    email: `test_${Date.now()}@example.com`
  }
  
  console.log('Creating user:', uniqueUser.username)
  
  // Step 1: Create a new user
  const createResponse = await page.request.post('http://localhost:3000/api/auth/user', {
    data: uniqueUser
  })
  console.log('Create user response status:', createResponse.status())
  
  if (createResponse.status() !== 200) {
    const body = await createResponse.text()
    console.log('Create user response body:', body)
    throw new Error(`Failed to create user: ${createResponse.status()} - ${body}`)
  }
  
  const createdUser = await createResponse.json()
  console.log('Created user data:', createdUser)
  
  // Step 2: Verify user was created by checking if it exists
  const checkResponse = await page.request.get(`http://localhost:3000/api/auth/user?username=${uniqueUser.username}`)
  console.log('User check response:', checkResponse.status())
  
  // Step 3: Wait a moment for any database operations to complete
  await page.waitForTimeout(2000)
  
  // Step 4: Try to login with the new user
  await page.goto('/')
  console.log('Navigated to:', page.url())
  
  // Wait for page to load
  await page.waitForLoadState('networkidle')
  
  // Fill the login form
  await page.locator('input').nth(0).clear()
  await page.locator('input').nth(0).fill(uniqueUser.username)
  await page.locator('input').nth(1).clear()
  await page.locator('input').nth(1).fill(uniqueUser.password)
  
  // Wait for validation to complete
  await page.waitForTimeout(1000)
  
  // Check for validation errors
  const validationErrors = await page.locator('.v-messages__message').all()
  console.log('Validation errors before login:', validationErrors.length)
  
  // Click login
  await page.click('button:has-text("Login")')
  
  // Wait for authentication to complete
  await page.waitForTimeout(5000)
  
  console.log('URL after login attempt:', page.url())
  
  // Check if login was successful
  if (page.url().includes('/login')) {
    console.log('Login failed - still on login page')
    
    // Check for error messages
    const errorMessage = page.locator('text=Incorrect Credentials')
    if (await errorMessage.isVisible()) {
      console.log('Error message is visible: Incorrect Credentials')
    } else {
      console.log('No error message found')
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'unique-user-login-failed.png' })
    
    // Check if the user actually exists in the database
    const verifyResponse = await page.request.get(`http://localhost:3000/api/auth/user?username=${uniqueUser.username}`)
    console.log('Final user verification:', verifyResponse.status())
    
    throw new Error('Login failed with newly created user')
  } else {
    console.log('Login successful with new user!')
    await page.screenshot({ path: 'unique-user-login-success.png' })
  }
}) 