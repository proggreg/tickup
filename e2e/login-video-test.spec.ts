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
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveTitle(/TickUp/)
    await expect(page.locator('text=Login')).toBeVisible()
    await page.locator('input').nth(0).fill(TEST_USER.username)
    await page.locator('input').nth(1).fill(TEST_USER.password)
    await page.click('button:has-text("Login")')
    await page.waitForTimeout(3000)
    await page.screenshot({ path: 'login-result.png' })
    if (!page.url().includes('/login')) {
      await page.waitForTimeout(2000)
      await page.screenshot({ path: 'after-login-success.png' })
    } else {
      const errorMessage = page.locator('text=Incorrect Credentials')
      await expect(errorMessage).toBeVisible()
    }
  })

  test('Show login form elements', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveTitle(/TickUp/)
    const inputs = await page.locator('input').all()
    const buttons = await page.locator('button').all()
    expect(inputs).toHaveLength(2)
    expect(buttons).toHaveLength(2)
    await expect(page.locator('button:has-text("Login")')).toBeVisible()
    await expect(page.locator('button:has-text("Github Sign In")')).toBeVisible()
    await page.screenshot({ path: 'login-form-elements.png' })
  })
}) 