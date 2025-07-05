import { test, expect } from '@playwright/test'

// Test user credentials - these should be created in the test database
const TEST_USER = {
  username: 'testuser',
  password: 'testpassword123',
  email: 'test@example.com'
}

test.describe('User Journey: Login and Create List', () => {
  test.beforeEach(async ({ page }) => {
    // Set test mode header for all requests
    await page.setExtraHTTPHeaders({
      'x-test-mode': 'true'
    })
  })

  test('Complete user journey: Login → Create List → Verify List', async ({ page }) => {
    // Step 1: Navigate to the application
    await page.goto('/')
    
    // Verify we're on the login page (unauthenticated users are redirected)
    await expect(page).toHaveTitle(/TickUp/)
    
    // Step 2: Login with test credentials
    await test.step('Login with test credentials', async () => {
      // Fill in the login form - select the first and second input fields
      await page.locator('input').nth(0).fill(TEST_USER.username)
      await page.locator('input').nth(1).fill(TEST_USER.password)
      
      // Click the login button
      await page.click('button:has-text("Login")')
      
      // Wait for authentication to complete - this may take time
      await page.waitForTimeout(5000)
      
      // Check if login was successful by looking for authenticated user elements
      // First, check if we're still on login page (which would indicate failure)
      const currentUrl = page.url()
      if (currentUrl.includes('/login')) {
        // Login failed, check for error message
        await expect(page.locator('text=Incorrect Credentials')).toBeVisible({ timeout: 5000 })
        throw new Error('Login failed - incorrect credentials')
      }
      
      // If we're not on login page, login was successful
      // Wait a bit more for the page to fully load
      await page.waitForTimeout(2000)
      
      // Verify we're logged in by checking for authenticated user elements
      // Look for the plus button in the navigation
      await expect(page.locator('[data-testid="new-list-button"]')).toBeVisible({ timeout: 10000 })
    })

    // Step 3: Create a new list
    await test.step('Create a new list', async () => {
      // Click the plus button to open the new list dialog
      await page.locator('[data-testid="new-list-button"]').click()
      
      // Wait for the dialog to appear
      await expect(page.locator('[data-testid="dialog-title"]')).toBeVisible()
      
      // Fill in the list name
      const listName = `Test List ${Date.now()}`
      await page.locator('[data-testid="new-list-input"] input').fill(listName)
      
      // Click save button
      await page.click('[data-testid="new-list-save"]')
      
      // Wait for dialog to close
      await expect(page.locator('[data-testid="dialog-title"]')).not.toBeVisible()
      
      // Verify the list was created by checking if it appears in the navigation
      await expect(page.locator(`text=${listName}`)).toBeVisible()
    })

    // Step 4: Navigate to the created list
    await test.step('Navigate to the created list', async () => {
      const listName = `Test List ${Date.now()}`
      
      // Click on the list in the navigation to open it
      const listLocator = page.locator(`text=${listName}`)
      if (!(await listLocator.isVisible({ timeout: 5000 }))) {
        const html = await page.content()
        console.log('DEBUG: List not found. Page HTML:', html)
        throw new Error('List not found in navigation')
      }
      await listLocator.click()
      
      // Wait for the list page to load
      await page.waitForURL(`**/list/**`, { timeout: 10000 })
      
      // Verify we're on the list page
      await expect(page.locator('input[placeholder*="Add todo"]')).toBeVisible()
    })

    // Step 5: Add a todo to the list
    await test.step('Add a todo to the list', async () => {
      const todoName = `Test Todo ${Date.now()}`
      
      // Fill in the todo name
      await page.fill('input[placeholder*="Add todo"]', todoName)
      
      // Press Enter to create the todo
      await page.press('input[placeholder*="Add todo"]', 'Enter')
      
      // Verify the todo was created
      await expect(page.locator(`text=${todoName}`)).toBeVisible()
    })

    // Step 6: Verify the complete journey
    await test.step('Verify the complete journey', async () => {
      // Check that we have a list with a todo
      await expect(page.locator('table')).toBeVisible()
      await expect(page.locator('tr').filter({ hasText: 'Test Todo' })).toBeVisible()
      
      // Verify the list name is displayed in the header
      await expect(page.locator('input[placeholder="My List"]')).toHaveValue(/Test List/)
    })
  })

  test('Login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/')
    
    // Fill in invalid credentials
    await page.locator('input').nth(0).fill('invaliduser')
    await page.locator('input').nth(1).fill('wrongpassword')
    
    // Click login
    await page.click('button:has-text("Login")')
    
    // Wait for error message or snackbar after failed login
    await page.waitForTimeout(2000)
    // Check for field validation error message
    await expect(page.locator('.v-messages__message')).toContainText('Oops! Username required to login', { timeout: 5000 })
  })

  test('Create list with empty name shows validation error', async ({ page }) => {
    // First login
    await page.goto('/')
    await page.locator('input').nth(0).fill(TEST_USER.username)
    await page.locator('input').nth(1).fill(TEST_USER.password)
    await page.click('button:has-text("Login")')
    
    // Wait for authentication to complete
    await page.waitForTimeout(5000)
    
    // Check if login was successful
    const currentUrl = page.url()
    if (currentUrl.includes('/login')) {
      await expect(page.locator('text=Incorrect Credentials')).toBeVisible({ timeout: 5000 })
      throw new Error('Login failed - cannot proceed with test')
    }
    
    // Wait for page to load after successful login
    await page.waitForTimeout(2000)
    
    // Try to create list with empty name
    await page.locator('[data-testid="new-list-button"]').click()
    await expect(page.locator('[data-testid="dialog-title"]')).toBeVisible()
    
    // Try to save without entering a name
    // await page.click('[data-testid="new-list-save"]')
    // Verify the save button is disabled
    await expect(page.locator('[data-testid="new-list-save"]')).toBeDisabled()
    
    // Wait for validation error message
    await expect(page.locator('.v-messages__message')).toContainText('Oops! Name required to create a list', { timeout: 5000 })
  })

  test('User can logout after creating list', async ({ page }) => {
    // Login and create a list
    await page.goto('/')
    await page.locator('input').nth(0).fill(TEST_USER.username)
    await page.locator('input').nth(1).fill(TEST_USER.password)
    await page.click('button:has-text("Login")')
    
    // Wait for authentication to complete
    await page.waitForTimeout(5000)
    
    // Check if login was successful
    const currentUrl = page.url()
    if (currentUrl.includes('/login')) {
      await expect(page.locator('text=Incorrect Credentials')).toBeVisible({ timeout: 5000 })
      throw new Error('Login failed - cannot proceed with test')
    }
    
    // Wait for page to load after successful login
    await page.waitForTimeout(2000)
    
    // Create a list
    await page.locator('[data-testid="new-list-button"]').click()
    const listName = `Test List ${Date.now()}`
    await page.locator('[data-testid="new-list-input"] input').fill(listName)
    await page.click('[data-testid="new-list-save"]')
    
    // Logout
    await page.click('button:has-text("Settings")')
    await page.waitForURL('**/settings', { timeout: 10000 })
    
    // Find and click logout button (might be in a menu)
    await page.click('button:has-text("Sign Out")')
    
    // Verify we're back to login page
    await page.waitForURL('**/', { timeout: 10000 })
    await expect(page.locator('input').nth(0)).toBeVisible()
  })
}) 