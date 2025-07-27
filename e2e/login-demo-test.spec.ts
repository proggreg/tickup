import { test, expect } from '@playwright/test'

test.describe('Login Demo Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.setExtraHTTPHeaders({
      'x-test-mode': 'true'
    })
  })

  test('Demonstrate login form interaction', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveTitle(/TickUp/)
    await expect(page.locator('text=Login')).toBeVisible()
    await page.locator('input').nth(0).fill('demo-user')
    await page.locator('input').nth(1).fill('demo-password')
    await page.click('button:has-text("Login")')
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Incorrect Credentials')).toBeVisible()
    await page.screenshot({ path: 'login-demo-complete.png' })
  })

  test('Show login form structure', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveTitle(/TickUp/)
    const inputs = await page.locator('input').all()
    const buttons = await page.locator('button').all()
    const forms = await page.locator('form').all()
    expect(inputs).toHaveLength(2)
    expect(buttons).toHaveLength(2)
    expect(forms).toHaveLength(1)
    await expect(page.locator('button:has-text("Login")')).toBeVisible()
    await expect(page.locator('button:has-text("Github Sign In")')).toBeVisible()
  })
}) 