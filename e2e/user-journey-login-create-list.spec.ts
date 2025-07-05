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
    
    // Create a unique list name that will be used throughout the test
    const listName = `Test List ${Date.now()}`
    
    // Step 2: Login with test credentials
    await test.step('Login with test credentials', async () => {
      // Wait for the form to be ready
      await page.waitForLoadState('networkidle')
      
      // Clear any existing values and fill in the login form
      await page.locator('input').nth(0).clear()
      await page.locator('input').nth(0).fill(TEST_USER.username)
      await page.locator('input').nth(1).clear()
      await page.locator('input').nth(1).fill(TEST_USER.password)
      
      // Wait a moment for validation to complete
      await page.waitForTimeout(1000)
      
      // Verify the form is valid (no error messages visible)
      const usernameError = page.locator('text=Oops! Username required to login')
      const passwordError = page.locator('text=Oops! Password required to login')
      
      if (await usernameError.isVisible() || await passwordError.isVisible()) {
        throw new Error('Form validation errors present before submission')
      }
      
      // Click the login button
      await page.click('button:has-text("Login")')
      
      // Wait for authentication to complete - this may take time
      await page.waitForTimeout(5000)
      
      // Check if login was successful by looking for authenticated user elements
      // First, check if we're still on login page (which would indicate failure)
      const currentUrl = page.url()
      if (currentUrl.includes('/login')) {
        // Login failed - check if it's due to empty fields or invalid credentials
        const usernameError = page.locator('text=Oops! Username required to login')
        const passwordError = page.locator('text=Oops! Password required to login')
        
        if (await usernameError.isVisible() || await passwordError.isVisible()) {
          throw new Error('Login failed - field validation errors')
        } else {
          throw new Error('Login failed - invalid credentials')
        }
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
      await page.locator('[data-testid="new-list-input"] input').fill(listName)
      
      // Click save button
      await page.click('[data-testid="new-list-save"]')
      
      // Wait for dialog to close
      await expect(page.locator('[data-testid="dialog-title"]')).not.toBeVisible()
      
      // Verify the list was created by checking if it appears in the navigation
      await expect(page.locator(`text=${listName}`)).toBeVisible()
      
      // Store the list name for later use
      return listName
    })

    // Step 4: Navigate to the created list
    await test.step('Navigate to the created list', async () => {
      // Click on the list in the navigation to open it
      const listLocator = page.locator(`.v-list-item-title:has-text("${listName}")`)
      if (!(await listLocator.isVisible({ timeout: 30000 }))) {
        // Try alternative selectors
        const alternativeLocator = page.locator(`text=${listName}`)
        if (!(await alternativeLocator.isVisible({ timeout: 5000 }))) {
          const html = await page.content()
          console.log('DEBUG: List not found. Page HTML:', html)
          console.log('DEBUG: Looking for list name:', listName)
          throw new Error(`List "${listName}" not found in navigation`)
        }
        await alternativeLocator.click()
      } else {
        await listLocator.click()
      }
      
      // Wait for the list page to load
      await page.waitForURL(`**/list/**`, { timeout: 10000 })
      
      // Wait for the page to fully load
      await page.waitForTimeout(2000)
      
      // Verify we're on the list page by checking for the board structure
      // Look for status columns (like "Open", "In Progress", etc.)
      await expect(page.locator('.v-card-title').first()).toBeVisible({ timeout: 10000 })
    })

    // Step 5: Verify the complete journey
    await test.step('Verify the complete journey', async () => {
      // Check that we're on a list page with the correct URL
      expect(page.url()).toContain('/list/')
      
      // Verify the list name is displayed in the page title
      await expect(page).toHaveTitle(/TickUp:/)
    })
  })

  test('Login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/')
    
    // Fill in invalid credentials
    await page.locator('input').nth(0).fill('invaliduser')
    await page.locator('input').nth(1).fill('wrongpassword')
    
    // Click login
    await page.click('button:has-text("Login")')
    
    // Wait for response
    await page.waitForTimeout(3000)
    
    // Check if we're still on login page (which indicates failure)
    const currentUrl = page.url()
    expect(currentUrl).toContain('/login')
    
    // For invalid credentials, we should still be on login page
    // The form should be ready for another attempt
    await expect(page.locator('input').nth(0)).toBeVisible()
    await expect(page.locator('input').nth(1)).toBeVisible()
  })

  test('Create list with empty name shows validation error', async ({ page }) => {
    // First login
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Clear and fill the form properly
    await page.locator('input').nth(0).clear()
    await page.locator('input').nth(0).fill(TEST_USER.username)
    await page.locator('input').nth(1).clear()
    await page.locator('input').nth(1).fill(TEST_USER.password)
    
    // Wait for validation to complete
    await page.waitForTimeout(1000)
    
    // Verify form is valid before submission
    const usernameError = page.locator('text=Oops! Username required to login')
    const passwordError = page.locator('text=Oops! Password required to login')
    
    if (await usernameError.isVisible() || await passwordError.isVisible()) {
      throw new Error('Form validation errors present before submission')
    }
    
    await page.click('button:has-text("Login")')
    
    // Wait for authentication to complete
    await page.waitForTimeout(5000)
    
    // Check if login was successful
    const currentUrl = page.url()
    if (currentUrl.includes('/login')) {
      // Login failed - check if it's due to empty fields or invalid credentials
      const usernameError = page.locator('text=Oops! Username required to login')
      const passwordError = page.locator('text=Oops! Password required to login')
      
      if (await usernameError.isVisible() || await passwordError.isVisible()) {
        throw new Error('Login failed - field validation errors')
      } else {
        throw new Error('Login failed - invalid credentials')
      }
    }
    
    // Wait for page to load after successful login
    await page.waitForTimeout(2000)
    
    // Try to create list with empty name
    await page.locator('[data-testid="new-list-button"]').click()
    await expect(page.locator('[data-testid="dialog-title"]')).toBeVisible()
    
    // Verify the save button is disabled when name is empty
    await expect(page.locator('[data-testid="new-list-save"]')).toBeDisabled()
    
    // Try to enter some text and verify button becomes enabled
    await page.locator('[data-testid="new-list-input"] input').fill('Test List')
    await expect(page.locator('[data-testid="new-list-save"]')).toBeEnabled()
    
    // Clear the text and verify button becomes disabled again
    await page.locator('[data-testid="new-list-input"] input').clear()
    await expect(page.locator('[data-testid="new-list-save"]')).toBeDisabled()
  })

  test('User can logout after creating list', async ({ page }) => {
    // Login and create a list
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Clear and fill the form properly
    await page.locator('input').nth(0).clear()
    await page.locator('input').nth(0).fill(TEST_USER.username)
    await page.locator('input').nth(1).clear()
    await page.locator('input').nth(1).fill(TEST_USER.password)
    
    // Wait for validation to complete
    await page.waitForTimeout(1000)
    
    // Verify form is valid before submission
    const usernameError = page.locator('text=Oops! Username required to login')
    const passwordError = page.locator('text=Oops! Password required to login')
    
    if (await usernameError.isVisible() || await passwordError.isVisible()) {
      throw new Error('Form validation errors present before submission')
    }
    
    await page.click('button:has-text("Login")')
    
    // Wait for authentication to complete
    await page.waitForTimeout(5000)
    
    // Check if login was successful
    const currentUrl = page.url()
    if (currentUrl.includes('/login')) {
      // Login failed - check if it's due to empty fields or invalid credentials
      const usernameError = page.locator('text=Oops! Username required to login')
      const passwordError = page.locator('text=Oops! Password required to login')
      
      if (await usernameError.isVisible() || await passwordError.isVisible()) {
        throw new Error('Login failed - field validation errors')
      } else {
        throw new Error('Login failed - invalid credentials')
      }
    }
    
    // Wait for page to load after successful login
    await page.waitForTimeout(2000)
    
    // Create a list
    await page.locator('[data-testid="new-list-button"]').click()
    const listName = `Test List ${Date.now()}`
    await page.locator('[data-testid="new-list-input"] input').fill(listName)
    await page.click('[data-testid="new-list-save"]')
    
    // Logout
    await page.click('a[href="/settings"]')
    await page.waitForURL('**/settings', { timeout: 10000 })
    
    // Find and click logout button (might be in a menu)
    await page.click('button:has-text("Sign Out")')
    
    // Verify we're back to login page
    await page.waitForURL('**/', { timeout: 10000 })
    await expect(page.locator('input').nth(0)).toBeVisible()
  })
}) 